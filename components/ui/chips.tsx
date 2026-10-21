import type { FactorStatus, Priority } from '@/lib/types';
import { IconAlert, IconCheck, IconFeather, IconHalf, IconLock } from './icons';

/*
 * Essential vs Preferred must be unmissable and never rely on color alone:
 * Essential = solid dark chip with a lock; Preferred = dashed outline with a feather.
 */
export function PriorityChip({ priority, size = 'md' }: { priority: Priority; size?: 'sm' | 'md' }) {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  if (priority === 'essential') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-forest font-bold tracking-wide text-lime uppercase ${pad}`}>
        <IconLock className="size-3" /> Essential
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-[1.5px] border-dashed border-ink-muted font-bold tracking-wide text-ink-muted uppercase ${pad}`}
    >
      <IconFeather className="size-3" /> Preferred
    </span>
  );
}

const STATUS_STYLE: Record<FactorStatus, { cls: string; label: string; Icon: typeof IconCheck }> = {
  met: { cls: 'bg-lime text-forest', label: 'Met', Icon: IconCheck },
  partial: { cls: 'bg-warn-soft text-warn', label: 'Partial', Icon: IconHalf },
  gap: { cls: 'bg-danger-soft text-danger', label: 'Gap', Icon: IconAlert },
};

export function StatusBadge({ status }: { status: FactorStatus }) {
  const { cls, label, Icon } = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

/** Skill chip: required skills are solid, preferred are outlined; a check shows the other side has it. */
export function SkillChip({ name, required, has }: { name: string; required: boolean; has?: boolean }) {
  const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium';
  const look = required ? 'bg-forest-2 text-cream' : 'border border-line bg-paper text-ink';
  return (
    <span className={`${base} ${look}`}>
      {has !== undefined &&
        (has ? (
          <IconCheck className={`size-3.5 ${required ? 'text-lime' : 'text-moss'}`} label="you have this" />
        ) : (
          <span className="sr-only">(not yet)</span>
        ))}
      {name}
      {required && <span className="sr-only">(required)</span>}
    </span>
  );
}
