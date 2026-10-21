import type { Metadata, Viewport } from 'next';
import { AppStoreProvider } from '@/lib/state/app-store';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jumi: explainable two-sided job matching',
  description:
    'Jumi recommends vacancies to jobseekers and candidates to employers, explains why a match may work, and opens chat only when interest is mutual.',
};

export const viewport: Viewport = { themeColor: '#1a2213' };

// Fonts load at runtime (not via next/font) so builds and offline demos never fail on a network fetch;
// globals.css falls back to system fonts if the stylesheet can't load.
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Geist:wght@400..700&display=swap';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body className="flex min-h-full flex-col">
        <AppStoreProvider>{children}</AppStoreProvider>
      </body>
    </html>
  );
}
