// "Why this match", told as a story: verdict sentence → score → essentials → factor detail → evidence.

import { fitLabel } from '@/lib/matching/score';
import type { EvidenceType, FactorResult, MatchResult } from '@/lib/types';
import { PriorityChip, StatusBadge } from '../ui/chips';
import { ScoreRing } from './score-ring';

const BAR_COLOR = { met: 'bg-leaf', partial: 'bg-[#e0b400]', gap: 'bg-danger' } as const;

function FactorRow({ factor }: { factor: FactorResult }) {
  const essentialGap = factor.priority === 'essential' && factor.status === 'gap';
  return (
    <li
      className={`rounded-2xl border p-4 ${
        essentialGap ? 'border-danger/50 bg-danger-soft/60' : 'border-line bg-paper'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="mr-auto font-display text-lg font-bold">{factor.label}</h3>
        <PriorityChip priority={factor.priority} />
        <StatusBadge status={factor.status} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div
          className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={factor.score}
          aria-label={`${factor.label} score`}
        >
          <div className={`h-full rounded-full ${BAR_COLOR[factor.status]}`} style={{ width: `${Math.max(factor.score, 3)}%` }} />
        </div>
        <span className="w-11 text-right text-sm font-bold tabular-nums">{factor.score}%</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink">{factor.note}</p>
    </li>
  );
}

const EVIDENCE_LABEL: Record<EvidenceType, string> = {
  project: 'Project',
  internship: 'Internship',
  certification: 'Certification',
  portfolio: 'Portfolio',
};

interface MatchExplanationProps {
  result: MatchResult;
  viewer: 'candidate' | 'employer';
  heading: React.ReactNode;
  compact?: boolean;
}

export function MatchExplanation({ result, viewer, heading, compact = false }: MatchExplanationProps) {
  // Show what to look at first: essential gaps, then other differences, then what's met.
  const order = (f: FactorResult) =>
    (f.status === 'gap' ? 0 : f.status === 'partial' ? 1 : 2) + (f.priority === 'essential' ? 0 : 0.5);
  const factors = [...result.factors].sort((a, b) => order(a) - order(b));

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-forest p-5 text-cream">
        {heading}
        <div className="mt-4 flex items-center gap-5">
          <ScoreRing score={result.overall} size={compact ? 104 : 124} flagged={result.hasEssentialGap} label={fitLabel(result)} />
          <div className="flex-1">
            <p className="font-display text-xl leading-snug font-bold">{result.summary}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className={`rounded-full px-3 py-1 font-bold ${result.hasEssentialGap ? 'bg-signal text-forest' : 'bg-lime text-forest'}`}>
            {result.essentialsMet} of {result.essentialsTotal} essentials met
          </span>
          <span className="rounded-full bg-forest-2 px-3 py-1 text-cream/80">
            {viewer === 'candidate' ? 'Uses your essentials + the employer’s requirements' : 'Uses your vacancy’s essentials'}
          </span>
        </div>
      </section>

      <section aria-labelledby="factors-h">
        <h2 id="factors-h" className="mb-2 text-xs font-bold tracking-[0.18em] text-ink-muted uppercase">
          Factor by factor
        </h2>
        <ul className="space-y-3">
          {factors.map((f) => (
            <FactorRow key={f.key} factor={f} />
          ))}
        </ul>
      </section>

      {result.evidenceBoosts.length > 0 && (
        <section aria-labelledby="evidence-h" className="rounded-3xl border border-line bg-paper p-5">
          <h2 id="evidence-h" className="font-display text-lg font-bold">
            Evidence that helped
          </h2>
          <p className="text-sm text-ink-muted">
            Projects, internships and certificates count toward skills, not just years of work.
          </p>
          <ul className="mt-3 space-y-2">
            {result.evidenceBoosts.map((e) => (
              <li key={e.evidenceId} className="flex items-start gap-3 rounded-2xl bg-cream p-3">
                <span className="rounded-lg bg-lime px-2 py-0.5 text-[11px] font-bold tracking-wide text-forest uppercase">
                  {EVIDENCE_LABEL[e.type]}
                </span>
                <span className="text-sm">
                  <span className="font-semibold">{e.title}</span>
                  <span className="block text-ink-muted">{e.skills.join(' · ')}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="px-1 text-xs leading-relaxed text-ink-muted">
        Scores explain fit on five factors; they don’t predict hiring outcomes. Essential gaps are always shown, never
        hidden. Applicants decide whether to pursue a role and employers make every hiring decision.
      </p>
    </div>
  );
}
