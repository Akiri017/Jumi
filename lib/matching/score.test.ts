import { describe, expect, it } from 'vitest';
import type { CandidateProfile, Vacancy } from '../types';
import { CANDIDATES } from '../data/seed/candidates';
import { VACANCIES } from '../data/seed/vacancies';
import {
  scoreCompensation,
  scoreExperience,
  scoreLocation,
  scoreSkills,
  workSetupCompatibility,
} from './factors';
import {
  ESSENTIAL_GAP_CAP,
  effectiveScore,
  mutualScore,
  scoreForCandidate,
  scoreForEmployer,
  statusFor,
} from './score';

const MAKATI = { city: 'Makati', metro: 'Metro Manila' };
const QC = { city: 'Quezon City', metro: 'Metro Manila' };
const CEBU = { city: 'Cebu City', metro: 'Metro Cebu' };

function vacancy(overrides: Partial<Vacancy> = {}): Vacancy {
  return {
    id: 'v-test',
    companyId: 'co-test',
    title: 'Test role',
    level: 'Entry-level',
    summary: '',
    requiredSkills: ['React', 'JavaScript'],
    preferredSkills: ['TypeScript'],
    skillsPriority: 'essential',
    experience: { value: { minMonths: 0 }, priority: 'preferred' },
    salary: { value: { min: 25000, max: 30000 }, priority: 'essential' },
    location: { value: MAKATI, priority: 'essential' },
    workSetup: { value: 'hybrid', priority: 'preferred' },
    ...overrides,
  };
}

function profile(overrides: Partial<CandidateProfile> = {}): CandidateProfile {
  return {
    id: 'c-test',
    name: 'Test Person',
    headline: '',
    education: '',
    avatarHue: 0,
    skills: [
      { name: 'React', proficiency: 3 },
      { name: 'JavaScript', proficiency: 3 },
      { name: 'TypeScript', proficiency: 3 },
    ],
    experience: [],
    evidence: [],
    preferences: {
      salary: { value: { min: 25000, max: 30000 }, priority: 'essential' },
      locations: { value: [MAKATI], priority: 'essential' },
      workSetups: { value: ['hybrid'], priority: 'preferred' },
      openToRelocate: false,
    },
    ...overrides,
  };
}

const withPrefs = (p: Partial<CandidateProfile['preferences']>) =>
  profile({ preferences: { ...profile().preferences, ...p } });

describe('perfect match', () => {
  it('scores 100 with all essentials met', () => {
    const r = scoreForCandidate(vacancy(), profile());
    expect(r.overall).toBe(100);
    expect(r.hasEssentialGap).toBe(false);
    expect(r.essentialsMet).toBe(r.essentialsTotal);
  });
});

describe('essential gaps', () => {
  it('caps the overall score and flags it, but still returns the factor', () => {
    // Location is essential for the candidate; Cebu is outside their list.
    const r = scoreForCandidate(vacancy({ location: { value: CEBU, priority: 'essential' } }), profile());
    expect(r.hasEssentialGap).toBe(true);
    expect(r.overall).toBeLessThanOrEqual(ESSENTIAL_GAP_CAP);
    const loc = r.factors.find((f) => f.key === 'location');
    expect(loc?.status).toBe('gap');
    expect(loc?.note).toMatch(/essential/i);
  });

  it('treats a missing required skill as a gap even when the ratio is decent', () => {
    const v = vacancy({ requiredSkills: ['React', 'JavaScript', 'Docker'] });
    const r = scoreForEmployer(profile(), v);
    const skills = r.factors.find((f) => f.key === 'skills')!;
    expect(skills.score).toBeGreaterThan(50);
    expect(skills.status).toBe('gap');
    expect(skills.note).toContain('Docker');
    expect(r.hasEssentialGap).toBe(true);
  });

  it('never filters factors out: all five are always present', () => {
    const r = scoreForCandidate(vacancy({ salary: { value: { min: 10000, max: 12000 }, priority: 'essential' } }), profile());
    expect(r.factors.map((f) => f.key)).toEqual(['skills', 'experience', 'compensation', 'location', 'workSetup']);
  });
});

describe('preferred gaps', () => {
  it('only dents the score and never sets the essential flag', () => {
    const remoteFan = withPrefs({ workSetups: { value: ['remote'], priority: 'preferred' } });
    const onsite = vacancy({ workSetup: { value: 'onsite', priority: 'preferred' } });
    const r = scoreForCandidate(onsite, remoteFan);
    expect(r.factors.find((f) => f.key === 'workSetup')?.status).toBe('gap');
    expect(r.hasEssentialGap).toBe(false);
    expect(r.overall).toBeGreaterThanOrEqual(90);
  });

  it('softens preferred scores to 50 + raw / 2', () => {
    expect(effectiveScore(0, 'preferred')).toBe(50);
    expect(effectiveScore(60, 'preferred')).toBe(80);
    expect(effectiveScore(60, 'essential')).toBe(60);
  });

  it('same raw gap hurts more when the candidate marks it essential', () => {
    const v = vacancy({ workSetup: { value: 'onsite', priority: 'preferred' } });
    const soft = scoreForCandidate(v, withPrefs({ workSetups: { value: ['remote'], priority: 'preferred' } }));
    const hard = scoreForCandidate(v, withPrefs({ workSetups: { value: ['remote'], priority: 'essential' } }));
    expect(hard.overall).toBeLessThan(soft.overall);
    expect(hard.hasEssentialGap).toBe(true);
  });
});

describe('evidence credit', () => {
  it('credits a skill shown only in a project, with 0 months of work experience', () => {
    const p = profile({
      skills: [{ name: 'React', proficiency: 3 }],
      evidence: [{ id: 'e1', type: 'project', title: 'Capstone', skills: ['JavaScript'] }],
    });
    const s = scoreSkills(vacancy(), p);
    expect(s.missingRequired).toEqual([]);
    expect(s.evidenceOnly).toContain('JavaScript');
    expect(s.boostingEvidence.map((e) => e.id)).toEqual(['e1']);
  });

  it('gives slightly less credit for evidence-only than for a declared skill', () => {
    const declared = scoreSkills(vacancy(), profile());
    const viaEvidence = scoreSkills(
      vacancy(),
      profile({
        skills: [{ name: 'React', proficiency: 3 }, { name: 'TypeScript', proficiency: 3 }],
        evidence: [{ id: 'e1', type: 'internship', title: 'Intern', skills: ['JavaScript'] }],
      }),
    );
    expect(viaEvidence.score).toBeLessThan(declared.score);
    expect(viaEvidence.score).toBeGreaterThan(80);
  });

  it('counts internships and relevant projects as experience months', () => {
    const p = profile({
      evidence: [
        { id: 'i', type: 'internship', title: 'Intern', skills: ['React'], months: 4 },
        { id: 'p', type: 'project', title: 'App', skills: ['React'] },
        { id: 'x', type: 'project', title: 'Unrelated', skills: ['Cooking'] },
      ],
    });
    const e = scoreExperience(vacancy({ experience: { value: { minMonths: 12 }, priority: 'preferred' } }), p);
    expect(e.candidateMonths).toBe(6);
    expect(e.score).toBe(50);
  });

  it('caps project months so projects cannot replace a real year of work', () => {
    const projects = Array.from({ length: 10 }, (_, i) => ({
      id: `p${i}`,
      type: 'project' as const,
      title: 'App',
      skills: ['React'],
    }));
    const e = scoreExperience(vacancy({ experience: { value: { minMonths: 12 }, priority: 'essential' } }), profile({ evidence: projects }));
    expect(e.candidateMonths).toBe(6);
  });

  it('lists evidence that helped on the match result', () => {
    const r = scoreForCandidate(VACANCIES[0], CANDIDATES[0]);
    expect(r.evidenceBoosts.length).toBeGreaterThan(0);
  });
});

describe('salary overlap', () => {
  const ask = (min: number, max: number) => withPrefs({ salary: { value: { min, max }, priority: 'essential' } });
  const offer = (min: number, max: number) => vacancy({ salary: { value: { min, max }, priority: 'essential' } });

  it('overlapping ranges score 100', () => {
    expect(scoreCompensation(offer(25000, 32000), ask(28000, 35000)).score).toBe(100);
  });
  it('touching edges count as overlap', () => {
    expect(scoreCompensation(offer(20000, 25000), ask(25000, 30000)).score).toBe(100);
  });
  it('offer above the ask is never a gap', () => {
    expect(scoreCompensation(offer(40000, 50000), ask(20000, 25000)).score).toBe(100);
  });
  it('decays with the shortfall and reaches 0 at a 30% gap', () => {
    const near = scoreCompensation(offer(20000, 27000), ask(30000, 35000)); // 10% short
    expect(near.overlaps).toBe(false);
    expect(near.shortfall).toBe(3000);
    expect(near.score).toBe(67);
    expect(scoreCompensation(offer(15000, 21000), ask(30000, 35000)).score).toBe(0);
  });
  it('rejects inverted ranges instead of guessing', () => {
    expect(() => scoreCompensation(offer(30000, 20000), ask(20000, 25000))).toThrow();
  });
});

describe('location', () => {
  it('same city 100, same metro 75, relocate 50, outside 0', () => {
    expect(scoreLocation(vacancy(), profile()).score).toBe(100);
    expect(scoreLocation(vacancy(), withPrefs({ locations: { value: [QC], priority: 'essential' } })).score).toBe(75);
    expect(
      scoreLocation(vacancy(), withPrefs({ locations: { value: [CEBU], priority: 'essential' }, openToRelocate: true })).score,
    ).toBe(50);
    expect(scoreLocation(vacancy(), withPrefs({ locations: { value: [CEBU], priority: 'essential' } })).score).toBe(0);
  });
  it('remote roles ignore location', () => {
    const v = vacancy({ workSetup: { value: 'remote', priority: 'preferred' }, location: { value: CEBU, priority: 'essential' } });
    expect(scoreLocation(v, profile()).reason).toBe('remote-role');
  });
});

describe('work setup matrix', () => {
  it.each([
    ['onsite', 'onsite', 100],
    ['onsite', 'hybrid', 60],
    ['onsite', 'remote', 0],
    ['hybrid', 'onsite', 60],
    ['hybrid', 'hybrid', 100],
    ['hybrid', 'remote', 60],
    ['remote', 'onsite', 0],
    ['remote', 'hybrid', 60],
    ['remote', 'remote', 100],
  ] as const)('%s wanted vs %s offered = %i', (wanted, offered, expected) => {
    expect(workSetupCompatibility(wanted, offered)).toBe(expected);
  });

  it('uses the best of several accepted setups', () => {
    const p = withPrefs({ workSetups: { value: ['remote', 'onsite'], priority: 'essential' } });
    const r = scoreForCandidate(vacancy({ workSetup: { value: 'onsite', priority: 'preferred' } }), p);
    expect(r.factors.find((f) => f.key === 'workSetup')?.score).toBe(100);
  });
});

describe('two directions', () => {
  it('uses each side’s own priorities', () => {
    // Employer marks pay preferred, candidate marks it essential: only the candidate sees a gap.
    const v = vacancy({ salary: { value: { min: 15000, max: 18000 }, priority: 'preferred' } });
    expect(scoreForCandidate(v, profile()).hasEssentialGap).toBe(true);
    expect(scoreForEmployer(profile(), v).hasEssentialGap).toBe(false);
  });

  it('writes notes for the viewer', () => {
    expect(scoreForCandidate(vacancy(), profile()).factors[0].note).toMatch(/^You have/);
    expect(scoreForEmployer(profile(), vacancy()).factors[0].note).toMatch(/^Test has/);
  });

  it('mutual score is the geometric mean and is deterministic', () => {
    const v = vacancy({ salary: { value: { min: 15000, max: 18000 }, priority: 'preferred' } });
    const a = scoreForCandidate(v, profile()).overall;
    const b = scoreForEmployer(profile(), v).overall;
    expect(mutualScore(v, profile())).toBe(Math.round(Math.sqrt(a * b)));
    expect(mutualScore(v, profile())).toBe(mutualScore(v, profile()));
  });
});

describe('status thresholds', () => {
  it('80 met, 40 partial, below 40 gap', () => {
    expect(statusFor(80)).toBe('met');
    expect(statusFor(79)).toBe('partial');
    expect(statusFor(40)).toBe('partial');
    expect(statusFor(39)).toBe('gap');
  });
});

describe('seed data spread (keeps the demo explainable)', () => {
  const maria = CANDIDATES.find((c) => c.id === 'c-maria')!;
  const webDev = VACANCIES.find((v) => v.id === 'v-northwind-webdev')!;

  it('Maria × Junior Web Developer is a strong fit with a preferred gap explained', () => {
    const r = scoreForCandidate(webDev, maria);
    expect(r.overall).toBeGreaterThanOrEqual(80);
    expect(r.hasEssentialGap).toBe(false);
    expect(r.essentialsMet).toBe(r.essentialsTotal);
    const setup = r.factors.find((f) => f.key === 'workSetup')!;
    expect(setup.priority).toBe('preferred');
    expect(setup.status).not.toBe('met');
    expect(setup.note).toContain('Hybrid vs. your remote wish');
  });

  it('Maria’s deck has strong, middling and essential-gap vacancies', () => {
    const scores = VACANCIES.map((v) => scoreForCandidate(v, maria));
    expect(scores.some((r) => r.overall >= 80)).toBe(true);
    expect(scores.some((r) => r.overall >= 60 && r.overall < 80)).toBe(true);
    expect(scores.some((r) => r.hasEssentialGap)).toBe(true);
  });

  it('Northwind’s web dev deck has a spread of candidates', () => {
    const scores = CANDIDATES.map((c) => scoreForEmployer(c, webDev));
    expect(scores.filter((r) => r.overall >= 80).length).toBeGreaterThanOrEqual(2);
    expect(scores.some((r) => r.hasEssentialGap)).toBe(true);
  });
});
