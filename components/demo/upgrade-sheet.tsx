'use client';

import { FREE_DAILY_SWIPES, useAppStore } from '@/lib/state/app-store';
import { Sheet } from '../ui/sheet';
import { IconCheck } from '../ui/icons';

const FREE_FOREVER = ['Recommendations', 'Match explanations', 'Mutual matching', 'Messaging'];

/** Mock freemium sheet. No payments: buttons just add swipes so the demo can continue. */
export function UpgradeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addSwipes, state } = useAppStore();
  const pro = state.persona === 'jobseeker' ? 'Jobseeker Pro' : 'Employer Pro';

  const grant = (n: number) => {
    addSwipes(n);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="You’ve used today’s free swipes">
      <p className="text-sm text-ink-muted">
        Free accounts get {FREE_DAILY_SWIPES} swipes a day, and they reset tomorrow. These stay free, always:
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-1.5 text-sm">
        {FREE_FOREVER.map((f) => (
          <li key={f} className="flex items-center gap-1.5">
            <IconCheck className="size-4 text-moss" /> {f}
          </li>
        ))}
      </ul>
      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={() => grant(100)}
          className="flex min-h-14 items-center justify-between rounded-2xl bg-forest px-4 text-left text-cream"
        >
          <span>
            <span className="block font-semibold">{pro}</span>
            <span className="text-xs text-cream/70">More swipes, filters and detailed feedback</span>
          </span>
          <span className="rounded-full bg-lime px-3 py-1 text-sm font-bold text-forest">Try</span>
        </button>
        <button
          type="button"
          onClick={() => grant(10)}
          className="flex min-h-14 items-center justify-between rounded-2xl border border-line bg-paper px-4 text-left"
        >
          <span>
            <span className="block font-semibold">Swipe pack</span>
            <span className="text-xs text-ink-muted">One-time +10 swipes</span>
          </span>
          <span className="rounded-full bg-signal px-3 py-1 text-sm font-bold text-forest">Add</span>
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-ink-muted">Prototype: no payment is taken.</p>
    </Sheet>
  );
}
