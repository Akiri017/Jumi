'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { UpgradeSheet } from '@/components/demo/upgrade-sheet';
import { MatchExplanation } from '@/components/match/match-explanation';
import { Avatar } from '@/components/ui/avatar';
import { IconBack, IconHeart, IconX } from '@/components/ui/icons';
import { scoreForCandidate, scoreForEmployer } from '@/lib/matching/score';
import { getCandidate, getCompany, getVacancy, hasSwiped, useAppStore } from '@/lib/state/app-store';
import type { SwipeDecision } from '@/lib/types';

export default function WhyPage() {
  const { vacancyId, candidateId } = useParams<{ vacancyId: string; candidateId: string }>();
  const { state, swipe } = useAppStore();
  const router = useRouter();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const vacancy = getVacancy(vacancyId);
  const candidate = getCandidate(candidateId);
  const company = vacancy && getCompany(vacancy.companyId);
  if (!vacancy || !candidate || !company) {
    return (
      <div className="rounded-3xl border border-line bg-paper p-6 text-center">
        <p className="font-display text-xl font-bold">This match isn’t available</p>
        <p className="mt-1 text-sm text-ink-muted">It may have been removed or the link is wrong.</p>
        <Link href="/discover" className="mt-4 inline-block font-semibold text-moss underline">
          Back to Discover
        </Link>
      </div>
    );
  }

  const employer = state.persona === 'employer';
  const result = employer ? scoreForEmployer(candidate, vacancy) : scoreForCandidate(vacancy, candidate);
  const swiped = hasSwiped(state, state.persona, candidate.id, vacancy.id);
  const match = state.matches.find((m) => m.candidateId === candidate.id && m.vacancyId === vacancy.id);

  const decide = (d: SwipeDecision) => {
    if (swipe(candidate.id, vacancy.id, d) === 'limit') return setUpgradeOpen(true);
    router.push(employer ? `/discover?vacancy=${vacancy.id}` : '/discover');
  };

  const heading = employer ? (
    <div className="flex items-center gap-3">
      <Avatar name={candidate.name} hue={candidate.avatarHue} size={44} />
      <div>
        <p className="font-display text-lg leading-tight font-bold">{candidate.name}</p>
        <p className="text-sm text-cream/70">for {vacancy.title}</p>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <Avatar name={company.name} hue={company.hue} size={44} shape="square" />
      <div>
        <p className="font-display text-lg leading-tight font-bold">{vacancy.title}</p>
        <p className="text-sm text-cream/70">{company.name}</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-md">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-3 -ml-2 inline-flex h-11 items-center gap-1 rounded-xl px-2 font-semibold text-ink-muted hover:text-ink"
      >
        <IconBack className="size-5" /> Back
      </button>
      <h1 className="sr-only">Why this match</h1>
      <MatchExplanation result={result} viewer={employer ? 'employer' : 'candidate'} heading={heading} />

      <div className="sticky bottom-20 mt-6 flex gap-3 rounded-3xl bg-cream/90 py-2 backdrop-blur">
        {match ? (
          <Link
            href={`/chat/${match.id}`}
            className="flex h-14 flex-1 items-center justify-center rounded-2xl bg-forest font-semibold text-lime"
          >
            Open chat
          </Link>
        ) : swiped ? (
          <p className="flex h-14 flex-1 items-center justify-center rounded-2xl border border-line bg-paper text-sm text-ink-muted">
            You’ve responded. Chat opens if they’re interested too.
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => decide('pass')}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-paper font-semibold text-danger"
            >
              <IconX className="size-5" /> Pass
            </button>
            <button
              type="button"
              onClick={() => decide('like')}
              className="flex h-14 flex-[2] items-center justify-center gap-2 rounded-2xl bg-forest font-semibold text-lime"
            >
              <IconHeart className="size-5" /> Interested
            </button>
          </>
        )}
      </div>
      <UpgradeSheet open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
