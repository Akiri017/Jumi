'use client';

import { Avatar } from '@/components/ui/avatar';
import { PriorityChip, SkillChip } from '@/components/ui/chips';
import { IconShield } from '@/components/ui/icons';
import { formatPeso, workSetupLabel } from '@/lib/matching/score';
import { employerCompany, employerVacancies, jobseeker, useAppStore } from '@/lib/state/app-store';
import type { Priority } from '@/lib/types';

const PROFICIENCY = { 1: 'Basic', 2: 'Working', 3: 'Strong' } as const;

function Pref({ label, value, priority }: { label: string; value: string; priority: Priority }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-4">
      <span>
        <span className="block text-xs font-semibold text-ink-muted">{label}</span>
        <span className="font-semibold">{value}</span>
      </span>
      <PriorityChip priority={priority} />
    </li>
  );
}

function PrivacyNote() {
  return (
    <p className="flex gap-2 rounded-2xl bg-paper p-4 text-xs leading-relaxed text-ink-muted">
      <IconShield className="size-4 shrink-0 text-moss" />
      Processed under the Philippine Data Privacy Act of 2012 (RA 10173). Salary expectations are used for matching and
      shown only as fit, and contact details stay hidden until a mutual match. In the full product you can export or delete
      your data at any time.
    </p>
  );
}

export default function ProfilePage() {
  const { state } = useAppStore();

  if (state.persona === 'employer') {
    const company = employerCompany();
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center gap-4">
          <Avatar name={company.name} hue={company.hue} size={72} shape="square" />
          <div>
            <h1 className="font-display text-2xl font-extrabold">{company.name}</h1>
            <p className="text-sm text-ink-muted">
              {company.industry} · {company.size} people
            </p>
          </div>
        </div>
        <section>
          <h2 className="mb-2 text-xs font-bold tracking-[0.18em] text-ink-muted uppercase">Open vacancies</h2>
          <ul className="space-y-2">
            {employerVacancies().map((v) => (
              <li key={v.id} className="rounded-2xl border border-line bg-paper p-4">
                <p className="font-semibold">{v.title}</p>
                <p className="text-sm text-ink-muted">
                  {formatPeso(v.salary.value.min)}–{formatPeso(v.salary.value.max)} · {v.location.value.city} ·{' '}
                  {workSetupLabel(v.workSetup.value)}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <PrivacyNote />
      </div>
    );
  }

  const me = jobseeker();
  const { salary, locations, workSetups, openToRelocate } = me.preferences;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name={me.name} hue={me.avatarHue} size={72} />
        <div>
          <h1 className="font-display text-2xl font-extrabold">{me.name}</h1>
          <p className="text-sm text-ink-muted">{me.headline}</p>
          <p className="text-sm text-ink-muted">{me.education}</p>
        </div>
      </div>

      <section>
        <h2 className="mb-1 text-xs font-bold tracking-[0.18em] text-ink-muted uppercase">What matters to me</h2>
        <p className="mb-2 text-sm text-ink-muted">Essentials are must-haves. Preferred items only nudge the score.</p>
        <ul className="space-y-2">
          <Pref label="Expected pay" value={`${formatPeso(salary.value.min)}–${formatPeso(salary.value.max)} / month`} priority={salary.priority} />
          <Pref
            label="Locations"
            value={`${locations.value.map((l) => l.city).join(', ')}${openToRelocate ? ' · open to relocate' : ''}`}
            priority={locations.priority}
          />
          <Pref label="Work setup" value={workSetups.value.map(workSetupLabel).join(' or ')} priority={workSetups.priority} />
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold tracking-[0.18em] text-ink-muted uppercase">Skills</h2>
        <ul className="flex flex-wrap gap-1.5">
          {me.skills.map((s) => (
            <li key={s.name}>
              <SkillChip name={`${s.name} · ${PROFICIENCY[s.proficiency]}`} required={false} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold tracking-[0.18em] text-ink-muted uppercase">Evidence</h2>
        <ul className="space-y-2">
          {me.evidence.map((e) => (
            <li key={e.id} className="rounded-2xl border border-line bg-paper p-4">
              <p className="text-[11px] font-bold tracking-wide text-moss uppercase">
                {e.type}
                {e.months ? ` · ${e.months} months` : ''}
              </p>
              <p className="font-semibold">{e.title}</p>
              <p className="text-sm text-ink-muted">Shows: {e.skills.join(', ')}</p>
            </li>
          ))}
        </ul>
      </section>
      <PrivacyNote />
    </div>
  );
}
