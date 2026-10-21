'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { mutualScore } from '@/lib/matching/score';
import { getCandidate, getCompany, getVacancy, matchesFor, useAppStore } from '@/lib/state/app-store';

const timeAgo = (t: number) => {
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  return hrs < 24 ? `${hrs}h` : `${Math.round(hrs / 24)}d`;
};

export default function MatchesPage() {
  const { state } = useAppStore();
  const employer = state.persona === 'employer';
  const matches = matchesFor(state);

  return (
    <div className={employer ? 'mx-auto max-w-2xl' : ''}>
      <h1 className="font-display text-2xl font-extrabold">Matches</h1>
      <p className="text-sm text-ink-muted">Both sides said yes. Chat is private to the two of you.</p>

      {matches.length === 0 ? (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-line p-8 text-center">
          <p className="font-display text-xl font-bold">No matches yet</p>
          <p className="mt-1 text-sm text-ink-muted">When someone you’re interested in is interested back, they’ll appear here.</p>
          <Link href="/discover" className="mt-4 inline-flex h-11 items-center rounded-2xl bg-forest px-5 font-semibold text-lime">
            Start discovering
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {matches.map((m) => {
            const vacancy = getVacancy(m.vacancyId);
            const candidate = getCandidate(m.candidateId);
            const company = vacancy && getCompany(vacancy.companyId);
            if (!vacancy || !candidate || !company) return null;
            const thread = state.messages.filter((x) => x.matchId === m.id);
            const last = thread[thread.length - 1];
            const name = employer ? candidate.name : company.name;
            return (
              <li key={m.id}>
                <Link
                  href={`/chat/${m.id}`}
                  className="flex min-h-[76px] items-center gap-3 rounded-2xl border border-line bg-paper p-3 transition hover:border-moss"
                >
                  {employer ? (
                    <Avatar name={candidate.name} hue={candidate.avatarHue} size={52} />
                  ) : (
                    <Avatar name={company.name} hue={company.hue} size={52} shape="square" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-semibold">{name}</span>
                      <span className="shrink-0 text-xs text-ink-muted">{timeAgo(last?.at ?? m.createdAt)}</span>
                    </span>
                    <span className="block truncate text-sm text-ink-muted">{vacancy.title}</span>
                    <span className="block truncate text-sm">
                      {last ? last.body : <em className="text-moss">New match: say hi!</em>}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-lime px-2 py-1 text-xs font-bold text-forest" title="Mutual score">
                    {mutualScore(vacancy, candidate)}%
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
