// Card faces for the swipe deck. Space goes to the facts people decide on,
// not to a giant initial: the match %, 3 key facts, skills and a one-line verdict.

import { fitLabel, formatPeso, workSetupLabel } from '@/lib/matching/score';
import type { CandidateProfile, Company, MatchResult, Vacancy } from '@/lib/types';
import { Avatar } from '../ui/avatar';
import { SkillChip } from '../ui/chips';
import { IconAlert, IconBuilding, IconPeso, IconPin, IconSpark } from '../ui/icons';

function MatchBadge({ result }: { result: MatchResult }) {
  const flagged = result.hasEssentialGap;
  return (
    <div className={`rounded-2xl px-3 py-2 text-right ${flagged ? 'bg-signal text-forest' : 'bg-lime text-forest'}`}>
      <div className="font-display text-3xl leading-none font-extrabold">{result.overall}%</div>
      <div className="mt-0.5 text-[11px] font-bold tracking-wide uppercase">{fitLabel(result)}</div>
    </div>
  );
}

function Fact({ icon, children, className = '' }: { icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <li className={`flex items-center gap-2 text-sm text-ink ${className}`}>
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-cream text-moss">{icon}</span>
      <span className="font-medium">{children}</span>
    </li>
  );
}

function Verdict({ result }: { result: MatchResult }) {
  return (
    <div
      className={`mt-auto flex gap-2 rounded-2xl p-3 text-sm leading-snug ${
        result.hasEssentialGap ? 'bg-warn-soft text-warn' : 'bg-cream text-ink'
      }`}
    >
      {result.hasEssentialGap ? <IconAlert className="mt-0.5 size-4 shrink-0" /> : <IconSpark className="mt-0.5 size-4 shrink-0 text-moss" />}
      <span>
        {result.summary} <span className="font-semibold underline underline-offset-2">Tap for why</span>
      </span>
    </div>
  );
}

const CARD = 'flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-[0_18px_40px_-20px_rgba(26,34,19,0.45)]';

export function VacancyCard({
  vacancy,
  company,
  result,
  profile,
}: {
  vacancy: Vacancy;
  company: Company;
  result: MatchResult;
  profile: CandidateProfile;
}) {
  const has = (skill: string) =>
    profile.skills.some((s) => s.name === skill) || profile.evidence.some((e) => e.skills.includes(skill));
  return (
    <article className={CARD}>
      <header className="relative bg-forest px-5 pt-5 pb-5 text-cream short:pt-4 short:pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={company.name} hue={company.hue} size={52} shape="square" />
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-lime uppercase">{company.name}</p>
              <p className="text-xs text-cream/70">
                {company.industry} · {company.size} people
              </p>
            </div>
          </div>
          <MatchBadge result={result} />
        </div>
        <h2 className="mt-4 font-display text-[28px] short:mt-3 short:text-2xl leading-[1.05] font-extrabold">{vacancy.title}</h2>
      </header>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <ul className="grid grid-cols-2 gap-2">
          <Fact icon={<IconPeso className="size-4" />}>
            {formatPeso(vacancy.salary.value.min)}–{formatPeso(vacancy.salary.value.max)}/mo
          </Fact>
          <Fact icon={<IconPin className="size-4" />}>{vacancy.location.value.city}</Fact>
          <Fact icon={<IconBuilding className="size-4" />}>{workSetupLabel(vacancy.workSetup.value)}</Fact>
          <Fact icon={<IconSpark className="size-4" />} className="short:hidden">{vacancy.level}</Fact>
        </ul>
        <div>
          <p className="mb-2 text-xs font-semibold text-ink-muted short:hidden">
            Skills: <span className="text-ink">dark = required</span>, outlined = preferred
          </p>
          <div className="flex flex-wrap gap-1.5">
            {vacancy.requiredSkills.map((s) => (
              <SkillChip key={s} name={s} required has={has(s)} />
            ))}
            {vacancy.preferredSkills.map((s) => (
              <SkillChip key={s} name={s} required={false} has={has(s)} />
            ))}
          </div>
        </div>
        <Verdict result={result} />
      </div>
    </article>
  );
}

export function CandidateCard({ profile, result }: { profile: CandidateProfile; result: MatchResult }) {
  const { salary, locations, workSetups } = profile.preferences;
  return (
    <article className={CARD}>
      <header className="bg-forest px-5 pt-5 pb-5 text-cream short:pt-4 short:pb-4">
        <div className="flex items-start justify-between gap-3">
          <Avatar name={profile.name} hue={profile.avatarHue} size={64} />
          <MatchBadge result={result} />
        </div>
        <h2 className="mt-4 font-display text-[28px] short:mt-3 short:text-2xl leading-[1.05] font-extrabold">{profile.name}</h2>
        <p className="mt-1 text-sm text-cream/80">{profile.headline}</p>
      </header>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <ul className="grid grid-cols-2 gap-2">
          <Fact icon={<IconPeso className="size-4" />}>
            Asks {formatPeso(salary.value.min)}–{formatPeso(salary.value.max)}
          </Fact>
          {/* First city + count keeps the card one line per fact; the full list is on the Why screen. */}
          <Fact icon={<IconPin className="size-4" />}>
            {locations.value[0]?.city ?? 'Anywhere'}
            {locations.value.length > 1 && <span className="text-ink-muted"> +{locations.value.length - 1}</span>}
          </Fact>
          <Fact icon={<IconBuilding className="size-4" />}>{workSetups.value.map(workSetupLabel).join(' / ')}</Fact>
        </ul>
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.map((s) => (
            <SkillChip key={s.name} name={s.name} required={false} />
          ))}
        </div>
        {profile.evidence.length > 0 && (
          <p className="text-sm text-ink-muted">
            <span className="font-semibold text-ink">{profile.evidence.length} evidence items:</span>{' '}
            {profile.evidence.map((e) => e.title.split(':')[0]).join(' · ')}
          </p>
        )}
        <Verdict result={result} />
      </div>
    </article>
  );
}
