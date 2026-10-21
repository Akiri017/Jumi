// Raw per-factor scoring. Pure functions with no UI or framework imports.
// Raw scores are symmetric: the same pair gets the same raw score from either side.
// Only the priorities (and therefore the overall score) differ by viewer; see score.ts.

import type { CandidateProfile, EvidenceItem, Vacancy, WorkSetup } from '../types';

const REQUIRED_SKILL_WEIGHT = 2;
const PREFERRED_SKILL_WEIGHT = 1;
// Evidence-only credit is slightly below a declared skill: it shows ability, not fluency.
const EVIDENCE_ONLY_CREDIT = 0.8;
const PROFICIENCY_CREDIT: Record<1 | 2 | 3, number> = { 1: 0.8, 2: 0.95, 3: 1 };

// Projects count as partial experience so entry-level talent isn't zeroed out.
const MONTHS_PER_RELEVANT_PROJECT = 2;
const MAX_PROJECT_MONTHS = 6;
const DEFAULT_INTERNSHIP_MONTHS = 3;

// A salary shortfall of 30% of the candidate's minimum or more scores 0.
const SALARY_GAP_TOLERANCE = 0.3;

const normalize = (s: string) => s.trim().toLowerCase();

export interface SkillsResult {
  score: number;
  matchedRequired: string[];
  missingRequired: string[];
  matchedPreferred: string[];
  missingPreferred: string[];
  evidenceOnly: string[]; // skills credited only through evidence
  boostingEvidence: EvidenceItem[];
}

function evidenceFor(skill: string, evidence: EvidenceItem[]): EvidenceItem[] {
  return evidence.filter((e) => e.skills.some((s) => normalize(s) === normalize(skill)));
}

export function scoreSkills(vacancy: Vacancy, profile: CandidateProfile): SkillsResult {
  const result: SkillsResult = {
    score: 100,
    matchedRequired: [],
    missingRequired: [],
    matchedPreferred: [],
    missingPreferred: [],
    evidenceOnly: [],
    boostingEvidence: [],
  };
  const boosting = new Set<EvidenceItem>();
  let earned = 0;
  let possible = 0;

  const assess = (skill: string, weight: number, required: boolean) => {
    possible += weight;
    const declared = profile.skills.find((s) => normalize(s.name) === normalize(skill));
    const proof = evidenceFor(skill, profile.evidence);
    proof.forEach((e) => boosting.add(e));

    let credit = 0;
    if (declared) credit = PROFICIENCY_CREDIT[declared.proficiency];
    else if (proof.length > 0) {
      credit = EVIDENCE_ONLY_CREDIT;
      result.evidenceOnly.push(skill);
    }
    earned += credit * weight;

    const matched = credit > 0;
    if (required) (matched ? result.matchedRequired : result.missingRequired).push(skill);
    else (matched ? result.matchedPreferred : result.missingPreferred).push(skill);
  };

  vacancy.requiredSkills.forEach((s) => assess(s, REQUIRED_SKILL_WEIGHT, true));
  vacancy.preferredSkills.forEach((s) => assess(s, PREFERRED_SKILL_WEIGHT, false));

  // A vacancy listing no skills can't be failed on skills.
  result.score = possible === 0 ? 100 : Math.round((earned / possible) * 100);
  result.boostingEvidence = [...boosting];
  return result;
}

export interface ExperienceResult {
  score: number;
  candidateMonths: number;
  requiredMonths: number;
  fromEvidenceMonths: number;
}

export function scoreExperience(vacancy: Vacancy, profile: CandidateProfile): ExperienceResult {
  const vacancySkills = [...vacancy.requiredSkills, ...vacancy.preferredSkills].map(normalize);
  const relevant = (e: EvidenceItem) => e.skills.some((s) => vacancySkills.includes(normalize(s)));

  const workMonths = profile.experience.reduce((sum, x) => sum + x.months, 0);
  const internshipMonths = profile.evidence
    .filter((e) => e.type === 'internship')
    .reduce((sum, e) => sum + (e.months ?? DEFAULT_INTERNSHIP_MONTHS), 0);
  const projectMonths = Math.min(
    MAX_PROJECT_MONTHS,
    profile.evidence.filter((e) => e.type === 'project' && relevant(e)).length *
      MONTHS_PER_RELEVANT_PROJECT,
  );

  const candidateMonths = workMonths + internshipMonths + projectMonths;
  const requiredMonths = vacancy.experience.value.minMonths;
  const score =
    requiredMonths <= 0 ? 100 : Math.min(100, Math.round((candidateMonths / requiredMonths) * 100));

  return {
    score,
    candidateMonths,
    requiredMonths,
    fromEvidenceMonths: internshipMonths + projectMonths,
  };
}

export interface CompensationResult {
  score: number;
  overlaps: boolean;
  shortfall: number; // PHP below the candidate's minimum, 0 when ranges overlap
}

export function scoreCompensation(vacancy: Vacancy, profile: CandidateProfile): CompensationResult {
  const offer = vacancy.salary.value;
  const ask = profile.preferences.salary.value;
  if (offer.min > offer.max || ask.min > ask.max) {
    throw new Error('Invalid salary range: min must not exceed max');
  }
  // Only the offer's ceiling vs the ask's floor matters: an offer above the ask is never a gap.
  if (offer.max >= ask.min) return { score: 100, overlaps: true, shortfall: 0 };

  const shortfall = ask.min - offer.max;
  const gapRatio = ask.min === 0 ? 1 : shortfall / ask.min;
  const score = Math.max(0, Math.round(100 * (1 - gapRatio / SALARY_GAP_TOLERANCE)));
  return { score, overlaps: false, shortfall };
}

export type LocationReason = 'remote-role' | 'same-city' | 'same-metro' | 'relocate' | 'outside';

export interface LocationResult {
  score: number;
  reason: LocationReason;
}

export function scoreLocation(vacancy: Vacancy, profile: CandidateProfile): LocationResult {
  if (vacancy.workSetup.value === 'remote') return { score: 100, reason: 'remote-role' };
  const { city, metro } = vacancy.location.value;
  const places = profile.preferences.locations.value;
  if (places.some((p) => normalize(p.city) === normalize(city))) {
    return { score: 100, reason: 'same-city' };
  }
  if (places.some((p) => normalize(p.metro) === normalize(metro))) {
    return { score: 75, reason: 'same-metro' };
  }
  if (profile.preferences.openToRelocate) return { score: 50, reason: 'relocate' };
  return { score: 0, reason: 'outside' };
}

// Hybrid sits between on-site and remote, so it partially satisfies either.
const WORK_SETUP_MATRIX: Record<WorkSetup, Record<WorkSetup, number>> = {
  onsite: { onsite: 100, hybrid: 60, remote: 0 },
  hybrid: { onsite: 60, hybrid: 100, remote: 60 },
  remote: { onsite: 0, hybrid: 60, remote: 100 },
};

export function workSetupCompatibility(wanted: WorkSetup, offered: WorkSetup): number {
  return WORK_SETUP_MATRIX[wanted][offered];
}

export interface WorkSetupResult {
  score: number;
  bestWanted: WorkSetup;
}

export function scoreWorkSetup(vacancy: Vacancy, profile: CandidateProfile): WorkSetupResult {
  const wanted = profile.preferences.workSetups.value;
  if (wanted.length === 0) return { score: 100, bestWanted: vacancy.workSetup.value };
  // Candidates can accept several setups; the best one counts.
  let best: WorkSetupResult = { score: -1, bestWanted: wanted[0] };
  for (const w of wanted) {
    const s = workSetupCompatibility(w, vacancy.workSetup.value);
    if (s > best.score) best = { score: s, bestWanted: w };
  }
  return best;
}
