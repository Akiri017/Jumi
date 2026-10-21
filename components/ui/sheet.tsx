'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Bottom sheet. Deliberately not <dialog>.showModal(): the browser's top layer would escape the
 * phone frame and cover the whole window. A fixed overlay stays inside the frame instead, so focus
 * trapping, Esc and focus restore are handled here.
 */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null);
  // Callers pass inline handlers; read the latest one without re-running the focus effect each render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      // Keep Tab cycling inside the sheet while it's open.
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;

  // Portal to the phone's screen layer so the sheet doesn't inherit styles or stacking from
  // wherever it was opened (e.g. the dark header), while staying inside the frame.
  const host = document.querySelector('.app-viewport') ?? document.body;
  return createPortal(
    <div className="fixed inset-0 z-40 flex animate-fade-in flex-col justify-end bg-forest/50 text-ink" onClick={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="phone-safe-bottom max-h-[90%] animate-slide-up overflow-y-auto rounded-t-3xl bg-cream p-6 pb-8"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" aria-hidden />
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>,
    host,
  );
}
