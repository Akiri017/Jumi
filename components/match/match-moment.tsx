'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { openingMove } from '@/lib/demo/opening-move';
import { getCandidate, getCompany, getVacancy, useAppStore } from '@/lib/state/app-store';
import { Avatar } from '../ui/avatar';

/** Full-screen celebration when both sides opt in. The only moment chat unlocks. */
export function MatchMoment() {
  const { celebration, dismissCelebration, state, sendMessage } = useAppStore();
  const router = useRouter();
  const primary = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (celebration) primary.current?.focus();
  }, [celebration]);

  if (!celebration) return null;
  const candidate = getCandidate(celebration.candidateId);
  const vacancy = getVacancy(celebration.vacancyId);
  const company = vacancy && getCompany(vacancy.companyId);
  if (!candidate || !vacancy || !company) return null;

  const isJobseeker = state.persona === 'jobseeker';
  const otherName = isJobseeker ? company.name : candidate.name;
  const suggestion = openingMove(state.persona, candidate, vacancy, company);

  const openChat = (withMessage: boolean) => {
    if (withMessage) sendMessage(celebration.id, suggestion);
    dismissCelebration();
    router.push(`/chat/${celebration.id}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
      className="fixed inset-0 z-50 grid animate-fade-in place-items-center bg-forest/95 p-6 text-cream"
      onKeyDown={(e) => e.key === 'Escape' && dismissCelebration()}
    >
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center" aria-hidden>
          <span className="animate-merge-left">
            <Avatar name={candidate.name} hue={candidate.avatarHue} size={96} ring />
          </span>
          <span className="-ml-6 animate-merge-right">
            <Avatar name={company.name} hue={company.hue} size={96} shape="square" ring />
          </span>
        </div>
        <h2 id="match-title" className="mt-6 animate-pop-in font-display text-5xl font-extrabold text-lime">
          It’s a match!
        </h2>
        <p className="mt-2 text-cream/80">
          You and <strong className="text-cream">{otherName}</strong> are both interested in{' '}
          <strong className="text-cream">{vacancy.title}</strong>. Private chat is now open.
        </p>

        <div className="mt-6 rounded-2xl bg-forest-2 p-4 text-left">
          <p className="text-[11px] font-bold tracking-[0.2em] text-lime uppercase">Opening move</p>
          <p className="mt-1.5 text-sm leading-relaxed">{suggestion}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            ref={primary}
            type="button"
            onClick={() => openChat(true)}
            className="h-12 rounded-2xl bg-lime font-semibold text-forest transition hover:brightness-95"
          >
            Send opening move
          </button>
          <button
            type="button"
            onClick={() => openChat(false)}
            className="h-12 rounded-2xl border border-cream/30 font-semibold text-cream"
          >
            Write my own
          </button>
          <button type="button" onClick={dismissCelebration} className="h-11 text-sm text-cream/70 underline">
            Keep swiping
          </button>
        </div>
        <p className="mt-4 text-xs text-cream/60">
          A match opens a conversation, not an offer. {isJobseeker ? 'The employer' : 'You'} still decide{isJobseeker ? 's' : ''} on hiring.
        </p>
      </div>
    </div>
  );
}
