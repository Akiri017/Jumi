'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { JumiLockup, JumiMark } from '@/components/brand/jumi-mark';
import { Avatar } from '@/components/ui/avatar';
import { PriorityChip, SkillChip } from '@/components/ui/chips';
import { IconBack, IconShield } from '@/components/ui/icons';
import { formatPeso, workSetupLabel } from '@/lib/matching/score';
import { employerCompany, employerVacancies, jobseeker, useAppStore } from '@/lib/state/app-store';
import type { Role } from '@/lib/types';

const STEPS = ['Role', 'Profile', 'Consent'] as const;

export default function OnboardingPage() {
  const { onboard } = useAppStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role>('jobseeker');
  const [consent, setConsent] = useState(false);

  const finish = () => {
    if (!consent) return;
    onboard(role);
    router.push(role === 'employer' ? '/employer' : '/discover');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-forest text-cream">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-6 pb-8">
        <div className="flex h-11 items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="-ml-2 inline-flex h-11 items-center gap-1 px-2 text-cream/80"
            >
              <IconBack className="size-5" /> Back
            </button>
          ) : (
            <JumiLockup variant="onDark" size={26} />
          )}
          <ol className="flex gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <li key={s} className={`h-1.5 w-8 rounded-full ${i <= step ? 'bg-lime' : 'bg-cream/20'}`}>
                <span className="sr-only">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        {step === 0 && (
          <section className="flex flex-1 animate-fade-in flex-col">
            <div className="mt-10 mb-8">
              <JumiMark size={72} />
              <h1 className="mt-6 font-display text-[40px] leading-[1.02] font-extrabold">
                Matches both sides <span className="text-lime">can understand.</span>
              </h1>
              <p className="mt-3 text-cream/75">
                See why a role or candidate fits, what’s essential and what’s only preferred. Chat opens when you’re both
                interested.
              </p>
            </div>
            <fieldset className="mt-auto space-y-3">
              <legend className="mb-3 text-sm font-semibold text-cream/80">I’m here as…</legend>
              {(
                [
                  ['jobseeker', 'A jobseeker', 'Fresh grad or early-career: find roles that fit your skills and evidence.'],
                  ['employer', 'An employer', 'Hiring for entry-level or junior roles: find candidates who fit.'],
                ] as const
              ).map(([value, title, sub]) => (
                <label
                  key={value}
                  className={`flex min-h-[72px] cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition ${
                    role === value ? 'border-lime bg-forest-2' : 'border-cream/15'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={role === value}
                    onChange={() => setRole(value)}
                    className="size-5 accent-[#d6ff6e]"
                  />
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="text-sm text-cream/70">{sub}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-5 h-14 rounded-2xl bg-lime font-semibold text-forest"
            >
              Continue
            </button>
          </section>
        )}

        {step === 1 && (
          <section className="flex flex-1 animate-fade-in flex-col">
            <h1 className="mt-8 font-display text-3xl font-extrabold">
              {role === 'jobseeker' ? 'Your profile' : 'Your company'}
            </h1>
            <p className="mt-1 text-sm text-cream/70">Prefilled for this demo. In the full app you’d build this in a few taps.</p>
            <div className="mt-5 rounded-3xl bg-cream p-5 text-ink">
              {role === 'jobseeker' ? <JobseekerPreview /> : <EmployerPreview />}
            </div>
            <button type="button" onClick={() => setStep(2)} className="mt-auto h-14 rounded-2xl bg-lime font-semibold text-forest">
              Looks good
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="flex flex-1 animate-fade-in flex-col">
            <IconShield className="mt-10 size-10 text-lime" />
            <h1 className="mt-4 font-display text-3xl font-extrabold">Your data, your call</h1>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-cream/80">
              <li>• We use your profile only to recommend and explain matches.</li>
              <li>
                • {role === 'jobseeker' ? 'Employers' : 'Candidates'} see fit, not your private details. Contact info and chat
                unlock only after a mutual match.
              </li>
              <li>• Jumi facilitates connections. Applicants decide whether to pursue; employers make all hiring decisions.</li>
              <li>• You can export or delete your data at any time.</li>
            </ul>
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-cream/15 p-4">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-[#d6ff6e]"
              />
              <span className="text-sm">
                I consent to Jumi processing my information for matching, in line with the Philippine Data Privacy Act of
                2012 (RA 10173).
              </span>
            </label>
            <button
              type="button"
              onClick={finish}
              disabled={!consent}
              className="mt-auto h-14 rounded-2xl bg-lime font-semibold text-forest disabled:cursor-not-allowed disabled:opacity-40"
            >
              {role === 'jobseeker' ? 'Start discovering' : 'Go to my vacancies'}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

function JobseekerPreview() {
  const me = jobseeker();
  const { salary, locations, workSetups } = me.preferences;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar name={me.name} hue={me.avatarHue} size={52} />
        <div>
          <p className="font-display text-lg font-bold">{me.name}</p>
          <p className="text-sm text-ink-muted">{me.headline}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {me.skills.map((s) => (
          <SkillChip key={s.name} name={s.name} required={false} />
        ))}
      </div>
      <p className="text-sm">
        <span className="font-semibold">{me.evidence.length} evidence items</span>{' '}
        <span className="text-ink-muted">(capstone, internship, certificate, portfolio)</span>
      </p>
      <ul className="space-y-2 text-sm">
        <PrefLine label={`${formatPeso(salary.value.min)}–${formatPeso(salary.value.max)}/mo`} priority={salary.priority} />
        <PrefLine label={locations.value.map((l) => l.city).join(', ')} priority={locations.priority} />
        <PrefLine label={workSetups.value.map(workSetupLabel).join(' or ')} priority={workSetups.priority} />
      </ul>
    </div>
  );
}

function EmployerPreview() {
  const company = employerCompany();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar name={company.name} hue={company.hue} size={52} shape="square" />
        <div>
          <p className="font-display text-lg font-bold">{company.name}</p>
          <p className="text-sm text-ink-muted">{company.industry}</p>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {employerVacancies().map((v) => (
          <li key={v.id} className="rounded-xl bg-paper p-3">
            <span className="font-semibold">{v.title}</span>
            <span className="block text-ink-muted">Requires {v.requiredSkills.join(', ')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PrefLine({ label, priority }: { label: string; priority: 'essential' | 'preferred' }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-xl bg-paper p-3">
      <span className="font-medium">{label}</span>
      <PriorityChip priority={priority} size="sm" />
    </li>
  );
}
