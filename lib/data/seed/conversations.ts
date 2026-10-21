import type { Match, Message } from '../../types';

// Pre-existing matches so the Matches tab isn't empty on first load.
// Timestamps are relative offsets; local-repository anchors them to "now" on reset.
const HOUR = 60 * 60 * 1000;

export const SEED_MATCHES: Array<Omit<Match, 'createdAt'> & { ago: number }> = [
  { id: 'm-maria-mabini', candidateId: 'c-maria', vacancyId: 'v-mabini-backend', ago: 26 * HOUR },
  { id: 'm-jose-northwind', candidateId: 'c-jose', vacancyId: 'v-northwind-data', ago: 5 * HOUR },
];

export const SEED_MESSAGES: Array<Omit<Message, 'at'> & { ago: number }> = [
  {
    id: 'msg-1',
    matchId: 'm-maria-mabini',
    senderId: 'co-mabini',
    body: 'Hi Maria! Your capstone used Node and SQL, which is exactly our stack. Want to do a short tech chat?',
    ago: 25 * HOUR,
  },
  {
    id: 'msg-2',
    matchId: 'm-maria-mabini',
    senderId: 'c-maria',
    body: 'Hi! Yes, I’d love that. I’m free Wednesday afternoon.',
    ago: 24 * HOUR,
  },
  {
    id: 'msg-3',
    matchId: 'm-jose-northwind',
    senderId: 'c-jose',
    body: 'Good afternoon! Thanks for the match. Happy to walk you through my dengue dashboard.',
    ago: 4 * HOUR,
  },
];
