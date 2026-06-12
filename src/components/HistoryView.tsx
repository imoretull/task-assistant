import { useMemo } from "react";
import { localDay } from "../lib/filters";
import type { Item } from "../lib/types";
import { EmptyState, GroupDivider, Skeleton } from "./ui";
import { TaskRow } from "./TaskRow";

/** Friendly day heading: "Yesterday — Tuesday, June 10". */
function dayLabel(day: string): string {
  const date = new Date(day + "T00:00:00");
  const pretty = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const diff = Math.round(
    (new Date(new Date().toDateString()).getTime() - date.getTime()) / 86_400_000
  );
  return diff === 1 ? `Yesterday — ${pretty}` : pretty;
}

/** Read-only archive of past completed days — the feel-good scroll. */
export function HistoryView({ items, loading }: { items: Item[]; loading: boolean }) {
  const days = useMemo(() => {
    const byDay = new Map<string, Item[]>();
    for (const it of items) {
      const day = localDay(it.completedAt ?? it.updatedAt);
      const list = byDay.get(day) ?? [];
      list.push(it);
      byDay.set(day, list);
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([day, list]) => ({
        day,
        items: list.sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")),
      }));
  }, [items]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-2 px-6 py-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    );
  }
  if (days.length === 0) {
    return (
      <EmptyState
        title="No history yet"
        hint="Tasks you complete roll in here overnight. Come back tomorrow."
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      {days.map(({ day, items: dayItems }) => (
        <section key={day} aria-label={day}>
          <GroupDivider label={dayLabel(day)} count={dayItems.length} />
          <div className="mt-2 space-y-1.5">
            {dayItems.map((item) => (
              <TaskRow key={item.id} item={item} variant="history" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
