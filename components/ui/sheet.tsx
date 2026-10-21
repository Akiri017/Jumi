'use client';

import { useEffect, useRef } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/** Bottom sheet built on <dialog> for free focus trapping and Esc handling. */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className="m-0 mt-auto w-full max-w-none bg-transparent p-0 backdrop:bg-forest/50 open:animate-slide-up sm:m-auto sm:max-w-md"
    >
      <div className="rounded-t-3xl bg-cream p-6 pb-8 sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line sm:hidden" aria-hidden />
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <div className="mt-3">{children}</div>
      </div>
    </dialog>
  );
}
