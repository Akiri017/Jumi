// Seeded catalog + localStorage-backed state. Safe to call on the server (falls back to seed).

import type { AppState, Catalog, JumiRepository } from './repository';
import { CANDIDATES } from './seed/candidates';
import { COMPANIES } from './seed/companies';
import { SEED_MATCHES, SEED_MESSAGES } from './seed/conversations';
import { VACANCIES } from './seed/vacancies';

const STORAGE_KEY = 'jumi:state';
// Bump when AppState's shape changes so stale saved state is discarded instead of crashing.
const STATE_VERSION = 1;

export const todayKey = (now = new Date()) => now.toISOString().slice(0, 10);

function seedState(now: number, day: string): AppState {
  return {
    version: STATE_VERSION,
    persona: 'jobseeker',
    onboarded: false,
    consentGiven: false,
    swipes: [
      // Both sides already liked each other for the seeded matches.
      ...SEED_MATCHES.flatMap((m) => [
        { side: 'jobseeker' as const, candidateId: m.candidateId, vacancyId: m.vacancyId, decision: 'like' as const, at: now - m.ago },
        { side: 'employer' as const, candidateId: m.candidateId, vacancyId: m.vacancyId, decision: 'like' as const, at: now - m.ago },
      ]),
    ],
    matches: SEED_MATCHES.map(({ ago, ...m }) => ({ ...m, createdAt: now - ago })),
    messages: SEED_MESSAGES.map(({ ago, ...m }) => ({ ...m, at: now - ago })),
    swipeUsage: {
      jobseeker: { day, count: 0 },
      employer: { day, count: 0 },
    },
    bonusSwipes: { jobseeker: 0, employer: 0 },
  };
}

const freshState = () => seedState(Date.now(), todayKey());

function isAppState(value: unknown): value is AppState {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as AppState).version === STATE_VERSION &&
    Array.isArray((value as AppState).swipes)
  );
}

export class LocalRepository implements JumiRepository {
  catalog(): Catalog {
    return { candidates: CANDIDATES, vacancies: VACANCIES, companies: COMPANIES };
  }

  seed(): AppState {
    // Fixed clock values: this runs during prerender, where reading the time is not allowed.
    return seedState(0, '');
  }

  load(): AppState {
    if (typeof window === 'undefined') return freshState();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      const parsed: unknown = JSON.parse(raw);
      if (isAppState(parsed)) return parsed;
      console.warn('[jumi] Saved state is from an older version; starting fresh.');
    } catch (err) {
      // Private mode or corrupted JSON: the demo must still work, just without persistence.
      console.warn('[jumi] Could not read saved state; starting fresh.', err);
    }
    return freshState();
  }

  save(state: AppState): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('[jumi] Could not persist state.', err);
    }
  }

  reset(): AppState {
    const fresh = freshState();
    this.save(fresh);
    return fresh;
  }
}

export const repository: JumiRepository = new LocalRepository();
