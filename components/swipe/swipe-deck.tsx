'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SwipeDecision } from '@/lib/types';
import { IconHeart, IconStar, IconX } from '../ui/icons';

const THRESHOLD = 110; // px of drag that commits a decision
const EXIT_MS = 260;

export interface DeckItem {
  key: string;
  label: string; // accessible name of the card, e.g. "Junior Web Developer at Northwind Digital"
}

interface SwipeDeckProps<T extends DeckItem> {
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  onDecide: (item: T, decision: SwipeDecision) => 'ok' | 'limit';
  onOpen: (item: T) => void;
  empty: React.ReactNode;
  /** Vertical space (px) used by the page around the deck; the deck fills the rest of the viewport. */
  reserve?: number;
}

type Drag = { x: number; y: number; active: boolean };
type Leaving<T> = { item: T; decision: SwipeDecision; x: number; y: number };

function exitTransform(decision: SwipeDecision, from: { x: number; y: number }) {
  if (decision === 'super') return `translate(${from.x}px, -140%) rotate(0deg)`;
  const dir = decision === 'like' ? 1 : -1;
  return `translate(${dir * 150}%, ${from.y}px) rotate(${dir * 22}deg)`;
}

export function SwipeDeck<T extends DeckItem>({
  items,
  renderCard,
  onDecide,
  onOpen,
  empty,
  reserve = 314,
}: SwipeDeckProps<T>) {
  const [drag, setDrag] = useState<Drag>({ x: 0, y: 0, active: false });
  const [leaving, setLeaving] = useState<Leaving<T> | null>(null);
  const [exiting, setExiting] = useState(false);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const top = items[0];
  const next = items[1];

  const decide = useCallback(
    (decision: SwipeDecision, from = { x: 0, y: 0 }) => {
      if (!top || leaving) return;
      const result = onDecide(top, decision);
      setDrag({ x: 0, y: 0, active: false });
      if (result === 'limit') return; // parent shows the upgrade sheet; card snaps back
      // Keep a copy of the card so it can animate out after the parent drops it from `items`.
      setLeaving({ item: top, decision, ...from });
      setExiting(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setExiting(true)));
      window.setTimeout(() => setLeaving(null), EXIT_MS);
    },
    [top, leaving, onDecide],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack arrows while typing or while a sheet/dialog is open.
      if (e.target instanceof Element && e.target.closest('input, textarea, select, dialog[open]')) return;
      if (document.querySelector('dialog[open], [role=dialog]')) return;
      if (e.key === 'ArrowLeft') decide('pass');
      else if (e.key === 'ArrowRight') decide('like');
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        decide('super');
      } else return;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [decide]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ x: 0, y: 0, active: true });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const x = e.clientX - start.current.x;
    const y = e.clientY - start.current.y;
    if (Math.abs(x) + Math.abs(y) > 6) start.current.moved = true;
    setDrag({ x, y, active: true });
  };
  const onPointerUp = () => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const { x, y } = drag;
    if (!s.moved) {
      setDrag({ x: 0, y: 0, active: false });
      if (top) onOpen(top); // a tap, not a drag, opens the explanation
      return;
    }
    if (y < -THRESHOLD && Math.abs(y) > Math.abs(x)) decide('super', { x, y });
    else if (x > THRESHOLD) decide('like', { x, y });
    else if (x < -THRESHOLD) decide('pass', { x, y });
    else setDrag({ x: 0, y: 0, active: false });
  };

  const hint = drag.y < -40 && Math.abs(drag.y) > Math.abs(drag.x) ? 'super' : drag.x > 40 ? 'like' : drag.x < -40 ? 'pass' : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Height tracks the viewport so the action buttons stay visible on short laptop screens too. */}
      <div className="relative" style={{ height: `clamp(390px, calc(var(--app-h) - ${reserve}px), 560px)` }} aria-live="polite">
        {!top && !leaving && <div className="absolute inset-0">{empty}</div>}

        {next && (
          <div
            className="absolute inset-0 scale-[0.95] translate-y-3 opacity-70 transition-transform duration-300"
            aria-hidden
          >
            {renderCard(next)}
          </div>
        )}

        {top && (
          <div
            role="group"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen(top);
              }
            }}
            aria-roledescription="swipe card"
            aria-label={`${top.label}. Tap for details. Use left arrow to pass, right arrow for interested, up arrow for super interest.`}
            className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              start.current = null;
              setDrag({ x: 0, y: 0, active: false });
            }}
            style={{
              transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 18}deg)`,
              transition: drag.active ? 'none' : 'transform 300ms cubic-bezier(0.2, 0.9, 0.3, 1.2)',
            }}
          >
            {renderCard(top)}
            <SwipeStamp hint={hint} />
          </div>
        )}

        {leaving && (
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              transform: exiting ? exitTransform(leaving.decision, leaving) : `translate(${leaving.x}px, ${leaving.y}px)`,
              opacity: exiting ? 0 : 1,
              transition: `transform ${EXIT_MS}ms ease-in, opacity ${EXIT_MS}ms ease-in`,
            }}
          >
            {renderCard(leaving.item)}
            <SwipeStamp hint={leaving.decision} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-5" role="toolbar" aria-label="Swipe actions">
        <ActionButton label="Pass" onClick={() => decide('pass')} disabled={!top} className="size-14 bg-paper text-danger">
          <IconX className="size-7" />
        </ActionButton>
        <ActionButton
          label="Super interest"
          onClick={() => decide('super')}
          disabled={!top}
          className="size-12 bg-signal text-forest"
        >
          <IconStar className="size-6" />
        </ActionButton>
        <ActionButton label="Interested" onClick={() => decide('like')} disabled={!top} className="size-16 bg-forest text-lime">
          <IconHeart className="size-8" />
        </ActionButton>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid place-items-center rounded-full shadow-[0_6px_20px_-6px_rgba(26,34,19,0.35)] transition hover:scale-105 active:scale-95 disabled:opacity-40 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function SwipeStamp({ hint }: { hint: SwipeDecision | null }) {
  if (!hint) return null;
  const map = {
    like: { text: 'Interested', cls: 'left-5 -rotate-12 border-moss text-moss bg-lime/90' },
    pass: { text: 'Pass', cls: 'right-5 rotate-12 border-danger text-danger bg-paper/90' },
    super: { text: 'Super', cls: 'left-1/2 -translate-x-1/2 border-forest text-forest bg-signal' },
  }[hint];
  return (
    <span
      aria-hidden
      className={`absolute top-6 rounded-xl border-[3px] px-3 py-1 font-display text-2xl font-extrabold tracking-wide uppercase ${map.cls}`}
    >
      {map.text}
    </span>
  );
}
