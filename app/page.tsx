'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { JumiMark } from '@/components/brand/jumi-mark';
import { useAppStore } from '@/lib/state/app-store';

/** Entry: route to onboarding or straight into the app, based on saved demo state. */
export default function Home() {
  const { state, hydrated } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!state.onboarded) router.replace('/onboarding');
    else router.replace(state.persona === 'employer' ? '/employer' : '/discover');
  }, [hydrated, state.onboarded, state.persona, router]);

  return (
    <div className="grid min-h-dvh place-items-center bg-forest" aria-busy="true">
      <JumiMark size={64} title="Loading Jumi" />
    </div>
  );
}
