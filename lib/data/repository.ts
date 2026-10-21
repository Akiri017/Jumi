// Data access boundary. The UI only talks to this interface, so swapping the local
// implementation for Supabase later means writing one new class, not touching screens.

import type { CandidateProfile, Company, Match, Message, Role, Swipe, Vacancy } from '../types';

export interface AppState {
  version: number;
  persona: Role;
  onboarded: boolean;
  consentGiven: boolean;
  swipes: Swipe[];
  matches: Match[];
  messages: Message[];
  // Free-tier daily swipe usage, keyed per persona so each side has its own allowance.
  swipeUsage: Record<Role, { day: string; count: number }>;
  bonusSwipes: Record<Role, number>;
}

export interface Catalog {
  candidates: CandidateProfile[];
  vacancies: Vacancy[];
  companies: Company[];
}

export interface JumiRepository {
  catalog(): Catalog;
  /** Fresh demo state without touching storage (used for the first, server-matching render). */
  seed(): AppState;
  load(): AppState;
  save(state: AppState): void;
  reset(): AppState;
}
