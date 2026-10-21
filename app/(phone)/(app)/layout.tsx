import { Suspense } from 'react';
import { AppShell } from '@/components/layout/app-shell';

// The shell reads the URL (pathname, params), which only exists at request time,
// so it streams in behind Suspense instead of blocking prerender.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-[var(--app-h)] bg-cream" aria-busy="true" />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
