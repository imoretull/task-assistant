import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
import type { Priority, Status, Tag } from "../lib/types";
import { PRIORITIES, STATUSES } from "../lib/types";

export function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <TooltipPrimitive.Root delayDuration={400}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className="z-50 rounded-sm border border-subtle bg-popover px-2 py-1 text-xs text-ink shadow-2"
        >
          {label}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

const TAG_DOT: Record<string, string> = {
  gray: "var(--text-muted)",
  blue: "var(--status-todo)",
  green: "var(--status-done)",
  amber: "var(--status-in_progress)",
  red: "var(--status-blocked)",
  purple: "#9d7cd8",
};
export const TAG_COLORS = Object.keys(TAG_DOT);

export function tagDotColor(color: string | null): string {
  return TAG_DOT[color ?? "gray"] ?? TAG_DOT.gray;
}

export function TagChip({
  tag,
  active,
  onClick,
}: {
  tag: Tag;
  active?: boolean;
  onClick?: () => void;
}) {
  const dot = (
    <span className="h-1.5 w-1.5 rounded-full" style={{ background: tagDotColor(tag.color) }} />
  );
  const activeCls = active ? "border-[var(--accent)] bg-accent-soft text-ink" : "";
  if (onClick) {
    return (
      <button
        onClick={onClick}
        aria-pressed={active}
        className={`chip cursor-pointer transition-colors duration-fast hover:border-strong ${activeCls}`}
      >
        {dot}
        {tag.name}
      </button>
    );
  }
  return (
    <span className={`chip ${activeCls}`}>
      {dot}
      {tag.name}
    </span>
  );
}

export function PriorityChip({ priority }: { priority: Priority }) {
  const label = PRIORITIES.find((p) => p.key === priority)?.label ?? priority;
  return (
    <span className="chip" style={{ color: `var(--priority-${priority})` }}>
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: `var(--priority-${priority})` }}
      />
      {label}
    </span>
  );
}

export function StatusChip({ status }: { status: Status }) {
  const label = STATUSES.find((s) => s.key === status)?.label ?? status;
  return (
    <span className="chip" style={{ color: `var(--status-${status})` }}>
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: `var(--status-${status})` }}
      />
      {label}
    </span>
  );
}

/** Section divider used when a sort groups items (e.g. "Today", "Urgent"). */
export function GroupDivider({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 pt-1" role="heading" aria-level={3}>
      <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-ink-secondary">
        {label}
      </span>
      <span className="text-xs text-ink-muted">{count}</span>
      <span className="h-px min-w-3 flex-1 bg-[var(--border-strong)] opacity-60" />
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-1 p-8 text-center">
      <p className="text-base text-ink-secondary">{title}</p>
      {hint && <p className="text-sm text-ink-muted">{hint}</p>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-overlay ${className}`} />;
}
