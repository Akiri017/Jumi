'use client';

import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  flagged?: boolean; // essential gap: switch the ring to a warning color
  label?: string;
}

/** Animated circular score. Starts at 0 and fills to the score on mount. */
export function ScoreRing({ score, size = 132, flagged = false, label }: ScoreRingProps) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(score));
    return () => cancelAnimationFrame(id);
  }, [score]);

  const stroke = size * 0.1;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(214,255,110,0.18)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={flagged ? '#fff32f' : '#d6ff6e'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display font-extrabold text-cream" style={{ fontSize: size * 0.3, lineHeight: 1 }}>
            {score}
            <span style={{ fontSize: size * 0.14 }}>%</span>
          </div>
          {label && <div className="mt-1 text-xs font-semibold text-lime">{label}</div>}
        </div>
      </div>
      <span className="sr-only">
        {score}% match{label ? `, ${label}` : ''}
      </span>
    </div>
  );
}
