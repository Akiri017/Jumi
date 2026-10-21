// Combines raw factor scores into a viewer-oriented, explainable MatchResult.
// Formula is documented in docs/matching.md — keep the two in sync.

import type {
  CandidateProfile,
  FactorKey,
  FactorResult,
  FactorStatus,
  MatchResult,
  Priority,
  Vacancy,
  WorkSetup,
} from '../types';
import {
  scoreCompensation,
  scoreExperience,
  scoreLocation,
  scoreSkills,
  scoreWorkSetup,
} from './factors';

export const FACTOR_WEIGHTS: Record<FactorKey, number> = {
  skills: 35,
  experience: 20,
  compensation: 20,
  location: 15,
  workSetup: 10,
};

export const FACTOR_LABELS: Record<FactorKey, string> = {
  skills: 'Skills',
  experience: 'Experience',
  compensation: 'Pay',
  location: 'Location',
  workSetup: 'Work setup',
};

// An essential gap keeps the match visible but stops it from looking "strong".
export const ESSENTIAL_GAP_CAP = 59;

type Viewer = 'candidate' | 'employer';

export function statusFor(score: number): FactorStatus {
  if (score >= 80) return 'met';
  if (score >= 40) return 'partial';
  return 'gap';
}

// Preferred factors still count, but a miss only dents the overall score.
export function effectiveScore(score: number, priority: Priority): number {
  return priority === 'preferred' ? 50 + score / 2 : score;
}

export const formatPeso = (n: number) =>
  n >= 1000 ? `₱${Math.round(n / 100) / 10}k` : `₱${n}`;

const SETUP_LABEL: Record<WorkSetup, string> = {
  onsite: 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote',
};
export const workSetupLabel = (w: WorkSetup) => SETUP_LABEL[w];

const list = (items: string[]) =>
  items.length <= 1
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

function priorityTail(status: FactorStatus, priority: Priority): string {
  if (status === 'met') return '';
  if (priority === 'preferred') return ' Preferred only, so it doesn’t block.';
  return status === 'gap' ? ' This is essential, so it’s flagged.' : ' Essential: worth discussing.';
}

/** Priorities come from whoever owns each preference, as seen by the viewer. */
function prioritiesFor(viewer: Viewer, vacancy: Vacancy, profile: CandidateProfile) {
  const prefs = profile.preferences;
  if (viewer === 'candidate') {
    return {
      skills: vacancy.skillsPriority,
      experience: vacancy.experience.priority,
      compensation: prefs.salary.priority,
      location: prefs.locations.priority,
      workSetup: prefs.workSetups.priority,
    } satisfies Record<FactorKey, Priority>;
  }
  return {
    skills: vacancy.skillsPriority,
    experience: vacancy.experience.priority,
    compensation: vacancy.salary.priority,
    location: vacancy.location.priority,
    workSetup: vacancy.workSetup.priority,
  } satisfies Record<FactorKey, Priority>;
}

function evaluate(viewer: Viewer, vacancy: Vacancy, profile: CandidateProfile): MatchResult {
  const you = viewer === 'candidate';
  const firstName = profile.name.split(' ')[0];
  const subj = you ? 'You' : firstName;
  const poss = you ? 'your' : `${firstName}’s`;
  const priorities = prioritiesFor(viewer, vacancy, profile);

  const skills = scoreSkills(vacancy, profile);
  const experience = scoreExperience(vacancy, profile);
  const pay = scoreCompensation(vacancy, profile);
  const location = scoreLocation(vacancy, profile);
  const setup = scoreWorkSetup(vacancy, profile);

  // --- Skills: a missing *required* skill is always a gap, whatever the ratio says.
  const skillsStatus: FactorStatus =
    skills.missingRequired.length > 0 ? 'gap' : statusFor(skills.score);
  const reqTotal = vacancy.requiredSkills.length;
  let skillsNote = `${subj} ${you ? 'have' : 'has'} ${skills.matchedRequired.length} of ${reqTotal} required skills`;
  if (skills.matchedPreferred.length) skillsNote += ` plus ${list(skills.matchedPreferred)}`;
  skillsNote += '.';
  if (skills.evidenceOnly.length) {
    skillsNote += ` ${list(skills.evidenceOnly)} counted from projects or internships.`;
  }
  if (skills.missingRequired.length) skillsNote += ` Missing: ${list(skills.missingRequired)}.`;

  // --- Experience
  const expNote =
    experience.requiredMonths === 0
      ? 'No minimum experience asked.'
      : `${experience.candidateMonths} months counted (${experience.fromEvidenceMonths} from internships and projects) vs ${experience.requiredMonths} asked.`;

  // --- Pay
  const ask = profile.preferences.salary.value;
  const offer = vacancy.salary.value;
  const payNote = pay.overlaps
    ? `${formatPeso(offer.min)}–${formatPeso(offer.max)} offered fits ${poss} ${formatPeso(ask.min)}–${formatPeso(ask.max)} expectation.`
    : `Offer tops out at ${formatPeso(offer.max)}, ${formatPeso(pay.shortfall)} below ${poss} ${formatPeso(ask.min)} minimum.`;

  // --- Location
  const city = vacancy.location.value.city;
  const locationNote = {
    'remote-role': 'Remote role, so location doesn’t matter.',
    'same-city': `${city} is in ${poss} preferred locations.`,
    'same-metro': `${city} is in ${poss} metro area, but not a listed city.`,
    relocate: `${city} is outside ${poss} locations; ${you ? 'you’re' : `${firstName} is`} open to relocating.`,
    outside: `${city} is outside ${poss} preferred locations.`,
  }[location.reason];

  // --- Work setup
  const offered = workSetupLabel(vacancy.workSetup.value);
  const setupNote =
    setup.score === 100
      ? `${offered} matches ${poss} preference.`
      : `${offered} vs. ${poss} ${workSetupLabel(setup.bestWanted).toLowerCase()} wish.`;

  const raw: Array<[FactorKey, number, FactorStatus, string]> = [
    ['skills', skills.score, skillsStatus, skillsNote],
    ['experience', experience.score, statusFor(experience.score), expNote],
    ['compensation', pay.score, statusFor(pay.score), payNote],
    ['location', location.score, statusFor(location.score), locationNote],
    ['workSetup', setup.score, statusFor(setup.score), setupNote],
  ];

  const factors: FactorResult[] = raw.map(([key, score, status, note]) => ({
    key,
    label: FACTOR_LABELS[key],
    score,
    priority: priorities[key],
    status,
    note: note + priorityTail(status, priorities[key]),
  }));

  const totalWeight = factors.reduce((s, f) => s + FACTOR_WEIGHTS[f.key], 0);
  const weighted = factors.reduce(
    (s, f) => s + FACTOR_WEIGHTS[f.key] * effectiveScore(f.score, f.priority),
    0,
  );
  const essentials = factors.filter((f) => f.priority === 'essential');
  const essentialGaps = essentials.filter((f) => f.status === 'gap');
  const hasEssentialGap = essentialGaps.length > 0;

  let overall = Math.round(weighted / totalWeight);
  if (hasEssentialGap) overall = Math.min(overall, ESSENTIAL_GAP_CAP);

  const result: MatchResult = {
    overall,
    hasEssentialGap,
    essentialsMet: essentials.filter((f) => f.status === 'met').length,
    essentialsTotal: essentials.length,
    factors,
    evidenceBoosts: skills.boostingEvidence.map((e) => ({
      evidenceId: e.id,
      title: e.title,
      type: e.type,
      skills: e.skills,
    })),
    summary: '',
  };
  result.summary = summarize(result);
  return result;
}

export function fitLabel(result: Pick<MatchResult, 'overall' | 'hasEssentialGap'>): string {
  if (result.hasEssentialGap) return 'Essential gap';
  if (result.overall >= 80) return 'Strong fit';
  if (result.overall >= 65) return 'Promising fit';
  return 'Partial fit';
}

/** One story-style sentence: verdict first, then the difference that matters most. */
export function summarize(result: MatchResult): string {
  const { essentialsMet, essentialsTotal, factors } = result;
  const essentialGaps = factors.filter((f) => f.priority === 'essential' && f.status === 'gap');
  if (essentialGaps.length) {
    return `${essentialsMet} of ${essentialsTotal} essentials met. ${list(
      essentialGaps.map((f) => f.label),
    )} ${essentialGaps.length > 1 ? 'are' : 'is an'} essential gap${
      essentialGaps.length > 1 ? 's' : ''
    }, shown so you can decide.`;
  }
  const head = `${fitLabel(result)}: ${essentialsMet} of ${essentialsTotal} essentials met.`;
  const soft = factors.filter((f) => f.status !== 'met');
  if (soft.length === 0) return `${head} No differences to discuss.`;
  const plural = soft.length > 1;
  const labels = list(soft.map((f) => f.label));
  if (soft.every((f) => f.priority === 'preferred')) {
    return `${head} ${labels} ${plural ? 'are preferred differences' : 'is a preferred difference'}, not ${plural ? 'blockers' : 'a blocker'}.`;
  }
  return `${head} ${labels} ${plural ? 'are' : 'is'} worth discussing.`;
}

/** How well a vacancy fits the jobseeker, using the jobseeker's own essentials. */
export function scoreForCandidate(vacancy: Vacancy, profile: CandidateProfile): MatchResult {
  return evaluate('candidate', vacancy, profile);
}

/** How well a candidate fits the vacancy, using the employer's essentials. */
export function scoreForEmployer(profile: CandidateProfile, vacancy: Vacancy): MatchResult {
  return evaluate('employer', vacancy, profile);
}

/** Geometric mean: a lopsided pair (great for one side only) scores lower than the average. */
export function mutualScore(vacancy: Vacancy, profile: CandidateProfile): number {
  const a = scoreForCandidate(vacancy, profile).overall;
  const b = scoreForEmployer(profile, vacancy).overall;
  return Math.round(Math.sqrt(a * b));
}
