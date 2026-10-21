'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAppStore } from '@/lib/state/app-store';
import type { Role } from '@/lib/types';
import { Sheet } from '../ui/sheet';

/** Presenter controls: switch persona, force the other side to swipe back, refill, reset. */
export function DemoPanel() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const { state, setPersona, forceSwipeBack, addSwipes, reset } = useAppStore();
  const router = useRouter();

  const switchTo = (persona: Role) => {
    setPersona(persona);
    setOpen(false);
    router.push(persona === 'employer' ? '/employer' : '/discover');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setNote(null);
          setOpen(true);
        }}
        className="rounded-full border border-dashed border-cream/40 px-3 py-1.5 text-xs font-semibold text-cream/80 hover:text-cream"
      >
        Demo
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Demo controls">
        <p className="text-sm text-ink-muted">For presenting. The other side is simulated with a fixed rule.</p>
        <fieldset className="mt-4">
          <legend className="text-xs font-bold tracking-wide text-ink-muted uppercase">Persona</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(
              [
                ['jobseeker', 'Maria Santos', 'Jobseeker'],
                ['employer', 'Northwind Digital', 'Employer'],
              ] as const
            ).map(([role, name, sub]) => (
              <button
                key={role}
                type="button"
                aria-pressed={state.persona === role}
                onClick={() => switchTo(role)}
                className={`min-h-14 rounded-2xl border px-3 text-left ${
                  state.persona === role ? 'border-forest bg-forest text-cream' : 'border-line bg-paper'
                }`}
              >
                <span className="block text-sm font-semibold">{name}</span>
                <span className="text-xs opacity-70">{sub}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-4 grid gap-2">
          <button
            type="button"
            className="h-12 rounded-2xl bg-lime font-semibold text-forest"
            onClick={() => {
              const ok = forceSwipeBack();
              if (ok) setOpen(false);
              else setNote('Nothing to match: swipe “interested” on someone first.');
            }}
          >
            Make the other side swipe back
          </button>
          <button type="button" className="h-12 rounded-2xl border border-line bg-paper font-semibold" onClick={() => addSwipes(15)}>
            Refill swipes (+15)
          </button>
          <button
            type="button"
            className="h-12 rounded-2xl border border-danger/40 bg-paper font-semibold text-danger"
            onClick={() => {
              reset();
              setOpen(false);
              router.push('/onboarding');
            }}
          >
            Reset demo data
          </button>
          <Link href="/brand" className="grid h-11 place-items-center text-sm text-ink-muted underline" onClick={() => setOpen(false)}>
            Brand &amp; design tokens
          </Link>
        </div>
        {note && (
          <p role="status" className="mt-3 text-sm text-warn">
            {note}
          </p>
        )}
      </Sheet>
    </>
  );
}
