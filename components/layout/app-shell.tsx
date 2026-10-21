'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FREE_DAILY_SWIPES, matchesFor, useAppStore } from '@/lib/state/app-store';
import { JumiLockup } from '../brand/jumi-mark';
import { DemoPanel } from '../demo/demo-panel';
import { MatchMoment } from '../match/match-moment';
import { IconChat, IconCompass, IconGrid, IconUser } from '../ui/icons';

const JOBSEEKER_TABS = [
  { href: '/discover', label: 'Discover', Icon: IconCompass },
  { href: '/matches', label: 'Matches', Icon: IconChat },
  { href: '/profile', label: 'Profile', Icon: IconUser },
];
const EMPLOYER_TABS = [
  { href: '/employer', label: 'Vacancies', Icon: IconGrid },
  { href: '/discover', label: 'Candidates', Icon: IconCompass },
  { href: '/matches', label: 'Matches', Icon: IconChat },
  { href: '/profile', label: 'Company', Icon: IconUser },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, hydrated, swipesLeft } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();
  const employer = state.persona === 'employer';
  const tabs = employer ? EMPLOYER_TABS : JOBSEEKER_TABS;
  const matchCount = matchesFor(state).length;

  useEffect(() => {
    if (hydrated && !state.onboarded) router.replace('/onboarding');
  }, [hydrated, state.onboarded, router]);

  // Screens scroll inside the phone frame's own container, not the window, so reset it per route.
  useEffect(() => {
    document.getElementById('app-scroll')?.scrollTo(0, 0);
  }, [pathname]);

  // Both personas use the phone layout; the cap only matters on real tablets with no frame.
  const width = 'max-w-md';

  return (
    <div className="flex min-h-[var(--app-h)] flex-col">
      <header className="sticky top-0 z-30 bg-forest text-cream">
        <div className={`mx-auto flex h-14 w-full items-center justify-between gap-3 px-4 ${width}`}>
          <Link href={employer ? '/employer' : '/discover'} aria-label="Jumi home">
            <JumiLockup variant="onDark" size={26} />
          </Link>
          <div className="flex items-center gap-2">
            {hydrated && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${swipesLeft <= 3 ? 'bg-signal text-forest' : 'bg-forest-2 text-lime'}`}
                aria-label={`${swipesLeft} swipes left today`}
              >
                {swipesLeft}/{FREE_DAILY_SWIPES} swipes
              </span>
            )}
            <DemoPanel />
          </div>
        </div>
      </header>

      <main className={`mx-auto w-full flex-1 px-4 pt-4 pb-28 ${width}`}>
        {hydrated && state.onboarded ? children : <ShellSkeleton />}
      </main>

      <nav aria-label="Main" className="phone-safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur">
        <ul className={`mx-auto flex w-full justify-around px-2 ${width}`}>
          {tabs.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== '/discover' && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex min-h-16 min-w-16 flex-col items-center justify-center gap-0.5 px-3 text-xs font-semibold ${
                    active ? 'text-forest' : 'text-ink-muted'
                  }`}
                >
                  <span className={`grid h-8 w-12 place-items-center rounded-full ${active ? 'bg-lime' : ''}`}>
                    <Icon className="size-5" />
                  </span>
                  {label}
                  {label === 'Matches' && matchCount > 0 && (
                    <span className="absolute top-1.5 right-3 grid size-5 place-items-center rounded-full bg-forest text-[10px] text-lime">
                      {matchCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <MatchMoment />
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-2/3 rounded-xl bg-line" />
      <div className="h-[440px] rounded-3xl bg-line" />
    </div>
  );
}
