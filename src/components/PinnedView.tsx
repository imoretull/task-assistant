import { useMemo } from "react";
import { useUI } from "../App";
import { useDeletePin, useItems, usePins } from "../lib/queries";
import { formatDate } from "../lib/filters";
import type { Pin as PinType } from "../lib/types";
import { Pin, X } from "./icons";
import { EmptyState, Skeleton, StatusChip } from "./ui";

/** Quick-reference view: every pinned line/section across all items, grouped
 *  by source item. Click anywhere to jump into the item; ✕ unpins. */
export function PinnedView() {
  const ui = useUI();
  const { data: pins = [], isLoading } = usePins();
  const { data: items = [] } = useItems();
  const deletePin = useDeletePin();

  // Group pins by item, respecting active tag filters so the sidebar filter
  // narrows this view like every other one.
  const groups = useMemo(() => {
    const byItem = new Map<string, PinType[]>();
    for (const pin of pins) {
      const item = items.find((i) => i.id === pin.itemId);
      if (item && ui.activeTagIds.length > 0) {
        const match =
          ui.tagMode === "and"
            ? ui.activeTagIds.every((t) => item.tags.includes(t))
            : ui.activeTagIds.some((t) => item.tags.includes(t));
        if (!match) continue;
      }
      const list = byItem.get(pin.itemId) ?? [];
      list.push(pin);
      byItem.set(pin.itemId, list);
    }
    return [...byItem.entries()].sort((a, b) => {
      const lastA = a[1].reduce((m, p) => (p.createdAt > m ? p.createdAt : m), "");
      const lastB = b[1].reduce((m, p) => (p.createdAt > m ? p.createdAt : m), "");
      return lastB.localeCompare(lastA);
    });
  }, [pins, items, ui.activeTagIds, ui.tagMode]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <EmptyState
        title="Nothing pinned yet"
        hint="Open a note or task and hover any line — the pin button flags it here for quick reference."
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      {groups.map(([itemId, itemPins]) => {
        const first = itemPins[0];
        return (
          <section key={itemId} className="card overflow-hidden" aria-label={first.itemTitle}>
            <button
              className="flex w-full items-center gap-2 border-b border-subtle px-4 py-2.5 text-left transition-colors duration-fast hover:bg-overlay"
              onClick={() => ui.openItem(itemId)}
            >
              <span className="font-mono text-xs text-ink-muted">{itemId}</span>
              <span className="truncate text-sm font-medium">
                {first.itemTitle || <span className="text-ink-muted">Untitled</span>}
              </span>
              {first.itemStatus && <StatusChip status={first.itemStatus} />}
              <span className="ml-auto shrink-0 text-xs text-ink-muted">
                {itemPins.length} pin{itemPins.length === 1 ? "" : "s"}
              </span>
            </button>
            <ul>
              {itemPins.map((pin) => (
                <li
                  key={pin.id}
                  className="group flex items-start gap-2.5 px-4 py-2 transition-colors duration-fast hover:bg-overlay"
                >
                  <Pin size={13} filled className="mt-0.5 shrink-0 text-accent" />
                  <button
                    className="min-w-0 flex-1 text-left text-sm leading-relaxed"
                    onClick={() => ui.openItem(itemId)}
                  >
                    {pin.content}
                  </button>
                  <span className="shrink-0 pt-0.5 text-xs text-ink-muted">
                    {formatDate(pin.createdAt)}
                  </span>
                  <button
                    className="shrink-0 pt-0.5 text-ink-muted opacity-0 transition-opacity duration-fast hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
                    aria-label="Unpin"
                    title="Unpin"
                    onClick={() => deletePin.mutate(pin.id)}
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
