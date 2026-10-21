'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { repository, todayKey } from '../data/local-repository';
import type { AppState } from '../data/repository';
import { SWIPE_BACK_DELAY_MS, simulatedReply, wouldSwipeBack } from '../demo/simulator';
import type { CandidateProfile, Company, Match, Message, Role, SwipeDecision, Vacancy } from '../types';

// The two demo personas. A real build would derive these from the signed-in user.
export const JOBSEEKER_ID = 'c-maria';
export const EMPLOYER_COMPANY_ID = 'co-northwind';
export const FREE_DAILY_SWIPES = 15;

const catalog = repository.catalog();
const candidateById = new Map(catalog.candidates.map((c) => [c.id, c]));
const vacancyById = new Map(catalog.vacancies.map((v) => [v.id, v]));
const companyById = new Map(catalog.companies.map((c) => [c.id, c]));

export const getCandidate = (id: string) => candidateById.get(id);
export const getVacancy = (id: string) => vacancyById.get(id);
export const getCompany = (id: string) => companyById.get(id);
export const { candidates: allCandidates, vacancies: allVacancies } = catalog;

const matchId = (candidateId: string, vacancyId: string) => `m-${candidateId}-${vacancyId}`;
const counterpart = (side: Role): Role => (side === 'jobseeker' ? 'employer' : 'jobseeker');

type Action =
  | { type: 'replace'; state: AppState }
  | { type: 'setPersona'; persona: Role }
  | { type: 'onboard'; persona: Role }
  // `simulated` swipes come from the demo's stand-in counterpart and don't use up anyone's allowance.
  | { type: 'swipe'; side: Role; candidateId: string; vacancyId: string; decision: SwipeDecision; simulated?: boolean }
  | { type: 'match'; candidateId: string; vacancyId: string }
  | { type: 'message'; message: Message }
  | { type: 'addSwipes'; persona: Role; amount: number };

function usageFor(state: AppState, persona: Role) {
  const usage = state.swipeUsage[persona];
  return usage.day === todayKey() ? usage.count : 0;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'replace':
      return action.state;
    case 'setPersona':
      return { ...state, persona: action.persona };
    case 'onboard':
      return { ...state, persona: action.persona, onboarded: true, consentGiven: true };
    case 'swipe': {
      const { side, candidateId, vacancyId, decision } = action;
      // Replace any earlier swipe by the same side on the same pair.
      const swipes = state.swipes.filter(
        (s) => !(s.side === side && s.candidateId === candidateId && s.vacancyId === vacancyId),
      );
      swipes.push({ side, candidateId, vacancyId, decision, at: Date.now() });
      if (action.simulated) return { ...state, swipes };
      return {
        ...state,
        swipes,
        swipeUsage: {
          ...state.swipeUsage,
          [side]: { day: todayKey(), count: usageFor(state, side) + 1 },
        },
      };
    }
    case 'match': {
      const id = matchId(action.candidateId, action.vacancyId);
      if (state.matches.some((m) => m.id === id)) return state;
      const match: Match = { id, candidateId: action.candidateId, vacancyId: action.vacancyId, createdAt: Date.now() };
      return { ...state, matches: [match, ...state.matches] };
    }
    case 'message':
      return { ...state, messages: [...state.messages, action.message] };
    case 'addSwipes':
      return {
        ...state,
        bonusSwipes: { ...state.bonusSwipes, [action.persona]: state.bonusSwipes[action.persona] + action.amount },
      };
    default:
      return state;
  }
}

// Wraps the app reducer so "loaded from storage" flips in the same update as the state swap,
// avoiding a frame where seed state is shown as if it were the user's saved state.
type RootState = { app: AppState; hydrated: boolean };
type RootAction = Action | { type: 'hydrate'; state: AppState };

function rootReducer(root: RootState, action: RootAction): RootState {
  if (action.type === 'hydrate') return { app: action.state, hydrated: true };
  const app = reducer(root.app, action);
  return app === root.app ? root : { ...root, app };
}

export interface AppStore {
  state: AppState;
  hydrated: boolean;
  swipesLeft: number;
  celebration: Match | null;
  typingIn: string | null; // match id where the other side is "typing"
  dismissCelebration: () => void;
  setPersona: (persona: Role) => void;
  onboard: (persona: Role) => void;
  swipe: (candidateId: string, vacancyId: string, decision: SwipeDecision) => 'ok' | 'limit';
  forceSwipeBack: () => boolean;
  sendMessage: (matchId: string, body: string) => void;
  addSwipes: (amount: number) => void;
  reset: () => void;
}

const StoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [{ app: state, hydrated }, dispatch] = useReducer(rootReducer, undefined, () => ({
    app: repository.seed(),
    hydrated: false,
  }));
  const [celebration, setCelebration] = useState<Match | null>(null);
  const [typingIn, setTypingIn] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  // Latest state for timer callbacks, which would otherwise close over a stale snapshot.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Server render uses seed state; swap in saved state after mount to avoid hydration mismatch.
  useEffect(() => {
    dispatch({ type: 'hydrate', state: repository.load() });
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  useEffect(() => {
    if (hydrated) repository.save(state);
  }, [state, hydrated]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const createMatch = useCallback((candidateId: string, vacancyId: string) => {
    dispatch({ type: 'match', candidateId, vacancyId });
    setCelebration({ id: matchId(candidateId, vacancyId), candidateId, vacancyId, createdAt: Date.now() });
  }, []);

  // usageFor reads today's date, which isn't allowed during prerender, so only compute once hydrated.
  const swipesLeft = hydrated
    ? Math.max(0, FREE_DAILY_SWIPES + state.bonusSwipes[state.persona] - usageFor(state, state.persona))
    : FREE_DAILY_SWIPES;

  const swipe = useCallback<AppStore['swipe']>(
    (candidateId, vacancyId, decision) => {
      const current = stateRef.current;
      const side = current.persona;
      const left = FREE_DAILY_SWIPES + current.bonusSwipes[side] - usageFor(current, side);
      if (left <= 0) return 'limit';

      dispatch({ type: 'swipe', side, candidateId, vacancyId, decision });
      if (decision === 'pass') return 'ok';

      const other = counterpart(side);
      const alreadyLiked = current.swipes.some(
        (s) => s.side === other && s.candidateId === candidateId && s.vacancyId === vacancyId && s.decision !== 'pass',
      );
      if (alreadyLiked) {
        createMatch(candidateId, vacancyId);
        return 'ok';
      }

      const vacancy = vacancyById.get(vacancyId);
      const candidate = candidateById.get(candidateId);
      if (vacancy && candidate && wouldSwipeBack(side, vacancy, candidate)) {
        later(() => {
          dispatch({ type: 'swipe', side: other, candidateId, vacancyId, decision: 'like', simulated: true });
          createMatch(candidateId, vacancyId);
        }, SWIPE_BACK_DELAY_MS);
      }
      return 'ok';
    },
    [createMatch, later],
  );

  const forceSwipeBack = useCallback(() => {
    const current = stateRef.current;
    const side = current.persona;
    const matched = new Set(current.matches.map((m) => m.id));
    const lastLike = [...current.swipes]
      .reverse()
      .find((s) => s.side === side && s.decision !== 'pass' && !matched.has(matchId(s.candidateId, s.vacancyId)));
    if (!lastLike) return false;
    dispatch({ type: 'swipe', side: counterpart(side), candidateId: lastLike.candidateId, vacancyId: lastLike.vacancyId, decision: 'like', simulated: true });
    createMatch(lastLike.candidateId, lastLike.vacancyId);
    return true;
  }, [createMatch]);

  const sendMessage = useCallback(
    (id: string, body: string) => {
      const match = stateRef.current.matches.find((m) => m.id === id);
      const text = body.trim();
      if (!match || !text) return;
      const persona = stateRef.current.persona;
      const vacancy = vacancyById.get(match.vacancyId);
      const mine = persona === 'jobseeker' ? match.candidateId : (vacancy?.companyId ?? 'employer');
      const theirs = persona === 'jobseeker' ? (vacancy?.companyId ?? 'employer') : match.candidateId;

      dispatch({ type: 'message', message: { id: crypto.randomUUID(), matchId: id, senderId: mine, body: text, at: Date.now() } });
      // Mocked reply with a typing indicator, so the chat feels alive in a solo demo.
      later(() => setTypingIn(id), 600);
      later(() => {
        setTypingIn(null);
        const count = stateRef.current.messages.filter((m) => m.matchId === id).length;
        dispatch({
          type: 'message',
          message: { id: crypto.randomUUID(), matchId: id, senderId: theirs, body: simulatedReply(count), at: Date.now() },
        });
      }, 2200);
    },
    [later],
  );

  const store = useMemo<AppStore>(
    () => ({
      state,
      hydrated,
      swipesLeft,
      celebration,
      typingIn,
      dismissCelebration: () => setCelebration(null),
      setPersona: (persona) => dispatch({ type: 'setPersona', persona }),
      onboard: (persona) => dispatch({ type: 'onboard', persona }),
      swipe,
      forceSwipeBack,
      sendMessage,
      addSwipes: (amount) => dispatch({ type: 'addSwipes', persona: state.persona, amount }),
      reset: () => {
        timers.current.forEach((t) => window.clearTimeout(t));
        timers.current = [];
        setCelebration(null);
        setTypingIn(null);
        dispatch({ type: 'replace', state: repository.reset() });
      },
    }),
    [state, hydrated, swipesLeft, celebration, typingIn, swipe, forceSwipeBack, sendMessage],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useAppStore(): AppStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useAppStore must be used inside <AppStoreProvider>');
  return store;
}

// ---- Selectors (pure helpers over state) ----

/** Has this side already swiped on the pair? */
export function hasSwiped(state: AppState, side: Role, candidateId: string, vacancyId: string) {
  return state.swipes.some((s) => s.side === side && s.candidateId === candidateId && s.vacancyId === vacancyId);
}

export function matchesFor(state: AppState): Match[] {
  if (state.persona === 'jobseeker') return state.matches.filter((m) => m.candidateId === JOBSEEKER_ID);
  return state.matches.filter((m) => vacancyById.get(m.vacancyId)?.companyId === EMPLOYER_COMPANY_ID);
}

export function employerVacancies(): Vacancy[] {
  return catalog.vacancies.filter((v) => v.companyId === EMPLOYER_COMPANY_ID);
}

export const jobseeker = (): CandidateProfile => candidateById.get(JOBSEEKER_ID)!;
export const employerCompany = (): Company => companyById.get(EMPLOYER_COMPANY_ID)!;
