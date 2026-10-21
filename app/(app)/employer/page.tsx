'use client';

import Link from 'next/link';
import { PriorityChip } from '@/components/ui/chips';
import { formatPeso, scoreForEmployer, workSetupLabel } from '@/lib/matching/score';
import { allCandidates, employerCompany, employerVacancies, useAppStore } from '@/lib/state/app-store';

export default function EmployerDashboard() {
  const { state } = useAppStore();

  if (state.persona !== 'employer') {
    return (
      <div className="rounded-3xl border border-line bg-paper p-6 text-center">
        <p className="font-display text-xl font-bold">Employer view</p>
        <p className="mt-1 text-sm text-ink-muted">Switch to the Northwind Digital persona in the Demo panel.</p>
      </div>
    );
  }

  const company = employerCompany();
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">{company.name}</h1>
      <p className="text-sm text-ink-muted">Your vacancies and how the recommended talent pool fits them.</p>

      <ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employerVacancies().map((v) => {
          const results = allCandidates.map((c) => scoreForEmployer(c, v));
          const strong = results.filter((r) => r.overall >= 80).length;
          const gapped = results.filter((r) => r.hasEssentialGap).length;
          const interested = state.swipes.filter((s) => s.side === 'jobseeker' && s.vacancyId === v.id && s.decision !== 'pass').length;
          const matches = state.matches.filter((m) => m.vacancyId === v.id).length;
          return (
            <li key={v.id} className="flex flex-col rounded-3xl border border-line bg-paper p-5">
              <h2 className="font-display text-xl font-bold">{v.title}</h2>
              <p className="text-sm text-ink-muted">
                {formatPeso(v.salary.value.min)}–{formatPeso(v.salary.value.max)} · {v.location.value.city} ·{' '}
                {workSetupLabel(v.workSetup.value)}
              </p>
              <div className="mt-3 space-y-1.5 text-sm">
                <p className="flex flex-wrap items-center gap-1.5">
                  <PriorityChip priority="essential" size="sm" />
                  {v.requiredSkills.join(', ')}
                </p>
                <p className="flex flex-wrap items-center gap-1.5">
                  <PriorityChip priority="preferred" size="sm" />
                  {v.preferredSkills.join(', ')}
                </p>
              </div>
              <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
                {[
                  ['Strong', strong],
                  ['Gaps', gapped],
                  ['Liked you', interested],
                  ['Matches', matches],
                ].map(([label, n]) => (
                  <div key={label} className="rounded-2xl bg-cream py-2">
                    <dt className="text-[11px] text-ink-muted">{label}</dt>
                    <dd className="font-display text-xl font-bold">{n}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href={`/discover?vacancy=${v.id}`}
                className="mt-4 flex h-12 items-center justify-center rounded-2xl bg-forest font-semibold text-lime"
              >
                Review candidates
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
