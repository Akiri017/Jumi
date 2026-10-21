// Generated avatars (no photos in the prototype). Hue comes from seed data.

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

interface AvatarProps {
  name: string;
  hue: number;
  size?: number;
  shape?: 'circle' | 'square';
  ring?: boolean;
}

export function Avatar({ name, hue, size = 48, shape = 'circle', ring = false }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 place-items-center font-display font-bold ${
        shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
      } ${ring ? 'ring-4 ring-cream' : ''}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        // Fixed lightness keeps the dark initials readable for every hue.
        background: `linear-gradient(135deg, hsl(${hue} 70% 78%), hsl(${(hue + 40) % 360} 65% 66%))`,
        color: '#1a2213',
      }}
    >
      {initials(name)}
    </span>
  );
}
