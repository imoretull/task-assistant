import { useMemo, useState } from "react";
import { useUI } from "../App";
import { useDeleteItem, useUpdateItem } from "../lib/queries";
import { useActiveDbId } from "../lib/database";
import { carriedDays, todayDay } from "../lib/filters";
import type { Item } from "../lib/types";
import { ArrowLeft, Check, Sunrise, Trash, X } from "./icons";
import { Tip } from "./ui";

/**
 * Morning triage strip. On a new day, carried-over tasks (open `today` tasks
 * that entered before today) get a once-a-day prompt to consciously re-commit
 * or clear them — the spec's antidote to silent pile-up (§7).
 *
 * Per task: Keep (acknowledge — stays in Today with its age badge intact, since
 * "this has lingered N days" is signal worth keeping), Backlog (to the pile,
 * dropping the badge), or Drop (to Trash). "Keep all" dismisses for the day.
 *
 * Dismissal is remembered per-database per-day in localStorage, so it doesn't
 * nag again until tomorrow.
 */
export function CarryTriage({ carried }: { carried: Item[] }) {
  const ui = useUI();
  const db = useActiveDbId();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const dismissKey = `tasknotes-triage-dismissed:${db}`;
  const [dismissedDay, setDismissedDay] = useState<string | null>(() =>
    localStorage.getItem(dismissKey)
  );
  // Tasks individually "kept" this session — hidden from the strip without
  // dismissing the whole thing.
  const [kept, setKept] = useState<Set<string>>(() => new Set());

  const today = todayDay();
  const pending = useMemo(
    () => carried.filter((it) => !kept.has(it.id)),
    [carried, kept]
  );

  const dismiss = () => {
    localStorage.setItem(dismissKey, today);
    setDismissedDay(today);
  };

  // Hidden once dismissed today, or when nothing's left to triage.
  if (dismissedDay === today || pending.length === 0) return null;

  const keep = (id: string) => setKept((prev) => new Set(prev).add(id));
  const toBacklog = (id: string) => updateItem.mutate({ id, status: "backlog" });
  const drop = (id: string) => {
    deleteItem.mutate(id);
    if (ui.openItemId === id) ui.openItem(null);
  };

  return (
    <section
      className="mt-3 overflow-hidden rounded-md border border-[var(--accent)] bg-accent-soft"
      aria-label="Carried-over tasks to triage"
    >
      <header className="flex items-center gap-2 px-3 py-2">
        <Sunrise size={15} className="shrink-0 text-accent" />
        <span className="text-sm font-medium">
          {pending.length} carried over from earlier
        </span>
        <span className="text-xs text-ink-muted">— keep, shelve, or drop</span>
        <button
          className="btn-ghost ml-auto shrink-0 text-xs"
          onClick={() => pending.forEach((it) => keep(it.id))}
        >
          Keep all
        </button>
        <Tip label="Dismiss until tomorrow">
          <button
            className="icon-btn h-6 w-6 shrink-0 text-ink-muted hover:text-ink"
            aria-label="Dismiss triage until tomorrow"
            onClick={dismiss}
          >
            <X size={13} />
          </button>
        </Tip>
      </header>
      <ul className="border-t border-[var(--accent)]/30">
        {pending.map((it) => {
          const age = carriedDays(it);
          return (
            <li
              key={it.id}
              className="flex items-center gap-2 px-3 py-1.5 text-sm odd:bg-black/[0.015] dark:odd:bg-white/[0.02]"
            >
              <button
                className="min-w-0 flex-1 truncate text-left hover:text-accent"
                onClick={() => ui.openItem(it.id)}
                title={it.title || "Open notes"}
              >
                {it.title || <span className="text-ink-muted">Untitled</span>}
              </button>
              {age > 0 && (
                <span
                  className="shrink-0 rounded-full px-1 text-[11px] font-medium tabular-nums text-ink-muted"
                  title={`Carried for ${age} day${age === 1 ? "" : "s"}`}
                >
                  {age}d
                </span>
              )}
              <div className="flex shrink-0 items-center gap-0.5">
                <Tip label="Keep in Today">
                  <button
                    aria-label="Keep in Today"
                    className="icon-btn h-6 w-6 text-ink-muted hover:text-[var(--status-done)]"
                    onClick={() => keep(it.id)}
                  >
                    <Check size={14} />
                  </button>
                </Tip>
                <Tip label="Move to Backlog">
                  <button
                    aria-label="Move to Backlog"
                    className="icon-btn h-6 w-6 text-ink-muted hover:text-ink"
                    onClick={() => toBacklog(it.id)}
                  >
                    <ArrowLeft size={13} />
                  </button>
                </Tip>
                <Tip label="Drop (to Trash)">
                  <button
                    aria-label="Drop to Trash"
                    className="icon-btn h-6 w-6 text-ink-muted hover:text-[var(--priority-urgent)]"
                    onClick={() => drop(it.id)}
                  >
                    <Trash size={13} />
                  </button>
                </Tip>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
