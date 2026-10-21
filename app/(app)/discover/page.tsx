'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { UpgradeSheet } from '@/components/demo/upgrade-sheet';
import { MatchExplanation } from '@/components/match/match-explanation';
import { CandidateCard, VacancyCard } from '@/components/swipe/match-cards';
import { SwipeDeck, type DeckItem } from '@/components/swipe/swipe-deck';
import { scoreForCandidate, scoreForEmployer } from '@/lib/matching/score';
import {
  allCandidates,
  allVacancies,
  employerVacancies,
  getCompany,
  hasSwiped,
  jobseeker,
  useAppStore,
} from '@/lib/state/app-store';
import type { CandidateProfile, MatchResult, SwipeDecision, Vacancy } from '@/lib/types';

interface PairItem extends DeckItem {
  vacancy: Vacancy;
  candidate: CandidateProfile;
  result: MatchResult;
}

export default function DiscoverPage() {
  // useSearchParams needs a Suspense boundary for prerendering.
  return (
    <Suspense>
      <Discover />
    </Suspense>
  );
}

function Discover() {
  const { state, swipe } = useAppStore();
  const router = useRouter();
  const params = useSearchParams();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const employer = state.persona === 'employer';

  const ownVacancies = employerVacancies();
  const selectedVacancy = ownVacancies.find((v) => v.id === params.get('vacancy')) ?? ownVacancies[0];

  // Scoring is cheap (≈10 items) and the React Compiler memoizes this component.
  const items = ((): PairItem[] => {
    if (employer) {
      return allCandidates
        .filter((c) => !hasSwiped(state, 'employer', c.id, selectedVacancy.id))
        .map((c) => ({ c, result: scoreForEmployer(c, selectedVacancy) }))
        .sort((a, b) => b.result.overall - a.result.overall)
        .map(({ c, result }) => ({
          key: `${c.id}|${selectedVacancy.id}`,
          label: `${c.name}, ${result.overall}% match`,
          vacancy: selectedVacancy,
          candidate: c,
          result,
        }));
    }
    const me = jobseeker();
    return allVacancies
      .filter((v) => !hasSwiped(state, 'jobseeker', me.id, v.id))
      .map((v) => ({ v, result: scoreForCandidate(v, me) }))
      .sort((a, b) => b.result.overall - a.result.overall)
      .map(({ v, result }) => ({
        key: `${me.id}|${v.id}`,
        label: `${v.title} at ${getCompany(v.companyId)?.name ?? 'unknown company'}, ${result.overall}% match`,
        vacancy: v,
        candidate: me,
        result,
      }));
  })();

  const onDecide = (item: PairItem, decision: SwipeDecision) => {
    const r = swipe(item.candidate.id, item.vacancy.id, decision);
    if (r === 'limit') setUpgradeOpen(true);
    return r;
  };
  const onOpen = (item: PairItem) => router.push(`/why/${item.vacancy.id}/${item.candidate.id}`);

  const deck = (
    <SwipeDeck
      items={items}
      onDecide={onDecide}
      onOpen={onOpen}
      renderCard={(item) => {
        if (employer) return <CandidateCard profile={item.candidate} result={item.result} />;
        const company = getCompany(item.vacancy.companyId);
        if (!company) return null;
        return <VacancyCard vacancy={item.vacancy} company={company} result={item.result} profile={item.candidate} />;
      }}
      empty={
        <div className="grid h-full place-items-center rounded-3xl border-2 border-dashed border-line p-8 text-center">
          <div>
            <p className="font-display text-2xl font-bold">You’re all caught up</p>
            <p className="mt-2 text-sm text-ink-muted">
              {employer
                ? 'No more candidates for this vacancy right now. Check your matches or pick another vacancy.'
                : 'No more recommendations today. Your matches are waiting.'}
            </p>
            <Link href="/matches" className="mt-4 inline-flex h-11 items-center rounded-2xl bg-forest px-5 font-semibold text-lime">
              See matches
            </Link>
          </div>
        </div>
      }
    />
  );

  return (
    <>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-extrabold">{employer ? 'Recommended candidates' : 'Recommended for you'}</h1>
        {employer ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Vacancy">
            {ownVacancies.map((v) => (
              <Link
                key={v.id}
                href={`/discover?vacancy=${v.id}`}
                role="tab"
                aria-selected={v.id === selectedVacancy.id}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                  v.id === selectedVacancy.id ? 'bg-forest text-lime' : 'border border-line bg-paper'
                }`}
              >
                {v.title}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-muted">Ranked by fit with your skills, evidence and essentials.</p>
        )}
      </div>

      {employer ? (
        // Desktop: deck on the left, live explanation for the top card on the right.
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          <div>{deck}</div>
          <aside className="hidden lg:block" aria-label="Why the top candidate fits">
            {items[0] ? (
              <MatchExplanation
                compact
                viewer="employer"
                result={items[0].result}
                heading={
                  <p className="text-sm text-cream/80">
                    Why <strong className="text-cream">{items[0].candidate.name}</strong> for{' '}
                    <strong className="text-cream">{selectedVacancy.title}</strong>
                  </p>
                }
              />
            ) : null}
          </aside>
        </div>
      ) : (
        deck
      )}
      <UpgradeSheet open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
