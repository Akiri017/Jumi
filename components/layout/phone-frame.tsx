'use client';

import { useEffect, useState } from 'react';
import { JumiLockup } from '../brand/jumi-mark';

// Logical phone screen height (iPhone 14/15 class, 390×844). Width/height live in globals.css.
const PHONE_H = 844;
const BEZEL = 12;
const MARGIN = 32; // breathing room above/below the phone

/**
 * Presents the app inside a phone on wide screens, matching the pitch deck mockups.
 * On a real phone (narrow screens) the chrome disappears and the app fills the viewport.
 *
 * Key trick: `.app-viewport` has a transform, which makes it the containing block for
 * `position: fixed` descendants. Tab bars, sheets and the match overlay therefore pin to
 * the phone screen instead of the browser window, with no changes to those components.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const zoom = useFitZoom();

  return (
    <div className="phone-stage">
      <div className="phone-device" style={{ zoom }}>
        <div className="phone-screen">
          <StatusBar />
          <div className="app-viewport">
            <div id="app-scroll" className="app-scroll">
              {children}
            </div>
          </div>
          <span className="phone-home-indicator" aria-hidden />
        </div>
      </div>
      <aside className="phone-caption" aria-label="About this prototype">
        <JumiLockup variant="onDark" size={28} />
        <p className="mt-3 max-w-[15rem] text-sm leading-relaxed text-cream/70">
          Explainable, two-sided job matching. Interactive prototype with seeded demo data.
        </p>
        <p className="mt-4 text-xs text-cream/50">Keyboard: ← pass · ↑ super · → interested · Enter for details</p>
      </aside>
    </div>
  );
}

/** Scale the phone down on short laptop screens so the whole device stays visible. */
function useFitZoom() {
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const fit = () => {
      // Only scale when the frame is showing (it's hidden below the sm breakpoint).
      if (!window.matchMedia('(min-width: 640px)').matches) return setZoom(1);
      // Zoom scales the device (screen + bezel) but not the stage padding around it.
      setZoom(Math.min(1, (window.innerHeight - MARGIN * 2) / (PHONE_H + BEZEL * 2)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return zoom;
}

function StatusBar() {
  return (
    <div className="phone-status-bar" aria-hidden>
      <span className="w-14 pl-2 text-[15px] font-semibold tracking-tight">9:41</span>
      <span className="phone-island" />
      <span className="flex w-14 items-center justify-end gap-1.5 pr-1">
        {/* signal */}
        <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor">
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="5" y="5" width="3" height="6" rx="1" />
          <rect x="10" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="15" y="0" width="3" height="11" rx="1" />
        </svg>
        {/* wifi */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
          <path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .4 10.4 10.4 0 0 0 .8 3.3L2 4.6a8.6 8.6 0 0 1 6-2.4z" />
          <path d="M8 5.6c1.4 0 2.6.5 3.6 1.4l1.2-1.3A7 7 0 0 0 8 3.8a7 7 0 0 0-4.8 1.9L4.4 7c1-.9 2.2-1.4 3.6-1.4z" />
          <circle cx="8" cy="9.3" r="1.6" />
        </svg>
        {/* battery */}
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3.5" stroke="currentColor" opacity="0.45" />
          <rect x="2" y="2" width="19" height="8" rx="2" fill="currentColor" />
          <path d="M24 4v4a2 2 0 0 0 0-4z" fill="currentColor" opacity="0.45" />
        </svg>
      </span>
    </div>
  );
}
