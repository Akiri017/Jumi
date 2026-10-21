// Demo-only stand-in for "the other side". Deterministic so a live demo never surprises us.

import { scoreForCandidate, scoreForEmployer } from '../matching/score';
import type { CandidateProfile, Role, Vacancy } from '../types';

export const SWIPE_BACK_THRESHOLD = 65;
export const SWIPE_BACK_DELAY_MS = 1200;

// Pairs that always swipe back, so the scripted demo path is guaranteed to match.
const ALWAYS_MATCH = new Set(['c-maria|v-northwind-webdev']);

/**
 * Would the counterpart of `actor` like this pair back?
 * The counterpart judges with their own priorities, which is the two-sided point.
 */
export function wouldSwipeBack(actor: Role, vacancy: Vacancy, candidate: CandidateProfile): boolean {
  if (ALWAYS_MATCH.has(`${candidate.id}|${vacancy.id}`)) return true;
  const counterpartView =
    actor === 'jobseeker' ? scoreForEmployer(candidate, vacancy) : scoreForCandidate(vacancy, candidate);
  return counterpartView.overall >= SWIPE_BACK_THRESHOLD && !counterpartView.hasEssentialGap;
}

const REPLIES = [
  'Thanks for reaching out! When would be a good time for a quick call?',
  'Sounds great. Could you share a bit more about the day-to-day?',
  'Happy to chat. I’m free most afternoons this week.',
];

/** Canned reply for the chat mock, picked deterministically by message count. */
export function simulatedReply(messageCount: number): string {
  return REPLIES[messageCount % REPLIES.length];
}
