import { useId } from 'react';

/*
 * The Jumi mark: two hooked strokes, one per side of the market, that together form a "U".
 * Where they overlap at the base is the match point, filled in a blend of both colors.
 * No gradients and no handshake glyph, so it stays legible at 16px.
 */

export type MarkVariant = 'onDark' | 'onLight' | 'onLime' | 'mono';
export type MarkDirection = 'bowl' | 'figures' | 'lens';

const PALETTES: Record<Exclude<MarkVariant, 'mono'>, { a: string; b: string; overlap: string }> = {
  onDark: { a: '#6fae27', b: '#fff32f', overlap: '#d6ff6e' },
  // Yellow vanishes on cream, so the light variant shifts to the deep greens.
  onLight: { a: '#4c7f1e', b: '#1a2213', overlap: '#6fae27' },
  onLime: { a: '#1a2213', b: '#4c7f1e', overlap: '#fdfbf4' },
};

// Geometry on a 48×48 grid: stems at x=13 and x=35, bowl radius 11 centered at (24,24).
// Each stroke runs past the bottom by 35° so the overlap is a short lens, not the whole bowl.
const LEFT = 'M13 10 V24 A11 11 0 0 0 30.3 33';
const RIGHT = 'M35 10 V24 A11 11 0 0 1 17.7 33';
const STROKE = 8;

interface JumiMarkProps {
  size?: number;
  variant?: MarkVariant;
  direction?: MarkDirection;
  className?: string;
  title?: string;
}

export function JumiMark({ size = 32, variant = 'onDark', direction = 'bowl', className, title = 'Jumi' }: JumiMarkProps) {
  const uid = useId().replace(/:/g, '');
  const maskId = `jumi-overlap-${uid}`;
  const knockId = `jumi-knock-${uid}`;
  const mono = variant === 'mono';
  const p = mono ? { a: 'currentColor', b: 'currentColor', overlap: 'currentColor' } : PALETTES[variant];

  if (direction === 'lens') {
    // Direction C: two interlocking rings; the lens between them is the match.
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={title} className={className}>
        <defs>
          <mask id={maskId}>
            <circle cx="18" cy="24" r="12" fill="white" />
          </mask>
        </defs>
        <circle cx="18" cy="24" r="12" fill="none" stroke={p.a} strokeWidth="6" />
        <circle cx="30" cy="24" r="12" fill="none" stroke={p.b} strokeWidth="6" />
        {!mono && <circle cx="30" cy="24" r="12" fill={p.overlap} mask={`url(#${maskId})`} />}
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={title} className={className}>
      <defs>
        {/* Overlap = right stroke clipped to the left stroke's footprint. */}
        <mask id={maskId}>
          <path d={LEFT} stroke="white" strokeWidth={STROKE} strokeLinecap="round" fill="none" />
        </mask>
        {/* Mono: cut a thin gap around the right stroke so the two forms stay distinct in one color. */}
        <mask id={knockId}>
          <rect width="48" height="48" fill="white" />
          <path d={RIGHT} stroke="black" strokeWidth={STROKE + 4} strokeLinecap="round" fill="none" />
        </mask>
      </defs>
      <path
        d={LEFT}
        stroke={p.a}
        strokeWidth={STROKE}
        strokeLinecap="round"
        fill="none"
        mask={mono ? `url(#${knockId})` : undefined}
      />
      <path d={RIGHT} stroke={p.b} strokeWidth={STROKE} strokeLinecap="round" fill="none" />
      {!mono && (
        <path
          d={RIGHT}
          stroke={p.overlap}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          mask={`url(#${maskId})`}
        />
      )}
      {direction === 'figures' && (
        <>
          <circle cx="13" cy="4.5" r="3.5" fill={p.a} />
          <circle cx="35" cy="4.5" r="3.5" fill={p.b} />
        </>
      )}
    </svg>
  );
}

interface JumiLockupProps {
  size?: number;
  variant?: Exclude<MarkVariant, 'mono'> | 'mono';
  className?: string;
}

/** Mark + "jumi" wordmark. Wordmark color follows the background it sits on. */
export function JumiLockup({ size = 28, variant = 'onLight', className = '' }: JumiLockupProps) {
  const text = variant === 'onDark' ? 'text-cream' : variant === 'mono' ? '' : 'text-forest';
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <JumiMark size={size} variant={variant} title="" />
      <span
        className={`font-display font-extrabold tracking-tight ${text}`}
        style={{ fontSize: size * 0.9, lineHeight: 1 }}
      >
        jumi
      </span>
      <span className="sr-only">Jumi</span>
    </span>
  );
}
