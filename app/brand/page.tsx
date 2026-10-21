import Link from 'next/link';
import { JumiLockup, JumiMark, type MarkDirection, type MarkVariant } from '@/components/brand/jumi-mark';
import { PriorityChip, SkillChip, StatusBadge } from '@/components/ui/chips';

const DIRECTIONS: Array<{ id: MarkDirection; name: string; note: string; recommended?: boolean }> = [
  {
    id: 'bowl',
    name: 'A · Meeting point',
    note: 'Two hooked strokes, one per side of the market, form a “U”. Where they overlap at the base is the match, shown in a blend of both colors. It stays clean at 16px and needs no gradient or handshake glyph.',
    recommended: true,
  },
  {
    id: 'figures',
    name: 'B · Two figures',
    note: 'Same structure with heads added, which keeps the deck’s “two people” idea. It’s friendlier, but the heads crowd the mark at favicon size.',
  },
  {
    id: 'lens',
    name: 'C · Lens',
    note: 'Two interlocking rings with a lens where they meet. It’s simple, but it reads as a generic Venn diagram and loses the “U” for Jumi.',
  },
];

const BACKGROUNDS: Array<{ variant: MarkVariant; bg: string; label: string }> = [
  { variant: 'onDark', bg: 'bg-forest', label: 'On forest' },
  { variant: 'onLight', bg: 'bg-cream border border-line', label: 'On cream' },
  { variant: 'onLime', bg: 'bg-lime', label: 'On lime' },
  { variant: 'mono', bg: 'bg-paper border border-line text-forest', label: 'Mono' },
];

const TOKENS = [
  { name: 'forest', hex: '#1A2213', use: 'Primary surface and text. Lime on forest is 14:1.' },
  { name: 'lime', hex: '#D6FF6E', use: 'Accent, CTA on dark, met status. Never text on light.' },
  { name: 'signal', hex: '#FFF32F', use: 'Highlights and gap warnings, as a background only.' },
  { name: 'moss', hex: '#4C7F1E', use: 'Text-safe green on cream (5:1). Links, focus ring.' },
  { name: 'leaf', hex: '#6FAE27', use: 'Graphic only: bars and the mark.' },
  { name: 'cream', hex: '#FDFBF4', use: 'App background.' },
];

export const metadata = { title: 'Jumi brand & tokens' };

export default function BrandPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <JumiLockup size={32} />
        <Link href="/" className="text-sm font-semibold text-moss underline">
          Back to app
        </Link>
      </div>
      <h1 className="mt-8 font-display text-4xl font-extrabold">Brand & design tokens</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">
        The deck’s logo put a tiny handshake inside gradient figures, and it turned to mush under ~48px. These three
        directions keep the idea of two sides meeting and drop the detail.
      </p>

      <section className="mt-10 space-y-6">
        {DIRECTIONS.map((d) => (
          <article key={d.id} className={`rounded-3xl border bg-paper p-6 ${d.recommended ? 'border-moss ring-2 ring-lime' : 'border-line'}`}>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl font-bold">{d.name}</h2>
              {d.recommended && (
                <span className="rounded-full bg-forest px-3 py-1 text-xs font-bold text-lime uppercase">Recommended</span>
              )}
            </div>
            <p className="mt-1 max-w-3xl text-sm text-ink-muted">{d.note}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {BACKGROUNDS.map((b) => (
                <div key={b.variant} className={`rounded-2xl p-4 ${b.bg}`}>
                  <div className="flex items-end gap-3">
                    <JumiMark direction={d.id} variant={b.variant} size={64} />
                    <JumiMark direction={d.id} variant={b.variant} size={32} />
                    <JumiMark direction={d.id} variant={b.variant} size={16} />
                  </div>
                  <p className={`mt-3 text-xs font-semibold ${b.variant === 'onDark' ? 'text-cream/70' : 'text-ink-muted'}`}>
                    {b.label} · 64 / 32 / 16px
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">Lockups</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-forest p-6">
            <JumiLockup variant="onDark" size={40} />
          </div>
          <div className="rounded-2xl border border-line bg-cream p-6">
            <JumiLockup variant="onLight" size={40} />
          </div>
          <div className="rounded-2xl bg-lime p-6">
            <JumiLockup variant="onLime" size={40} />
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-muted">Favicon: `app/icon.svg` (mark A on a forest tile).</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">Color tokens</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOKENS.map((t) => (
            <li key={t.name} className="flex gap-3 rounded-2xl border border-line bg-paper p-3">
              <span className="size-14 shrink-0 rounded-xl border border-line" style={{ background: t.hex }} />
              <span className="text-sm">
                <span className="block font-semibold">
                  {t.name} <span className="font-mono text-xs text-ink-muted">{t.hex}</span>
                </span>
                <span className="text-ink-muted">{t.use}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 mb-10">
        <h2 className="font-display text-2xl font-bold">Components</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-3xl border border-line bg-paper p-6">
          <PriorityChip priority="essential" />
          <PriorityChip priority="preferred" />
          <StatusBadge status="met" />
          <StatusBadge status="partial" />
          <StatusBadge status="gap" />
          <SkillChip name="React" required has />
          <SkillChip name="TypeScript" required={false} has />
          <SkillChip name="Docker" required={false} has={false} />
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          Essential and Preferred differ in fill, border style, icon and text, so they never rely on color alone. Type pairs
          Bricolage Grotesque (display) with Geist (body). Spacing sits on an 8px grid, cards are rounded-2xl/3xl and touch
          targets are at least 44px.
        </p>
      </section>
    </div>
  );
}
