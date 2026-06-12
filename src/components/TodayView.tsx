import { useMemo, useRef, useState } from "react";
import { useCreateItem, useCreateTag, useTags } from "../lib/queries";
import { carriedDays, isDoneToday } from "../lib/filters";
import type { Item } from "../lib/types";
import { Inbox, Plus, SquareCheck } from "./icons";
import { EmptyState, Skeleton, TAG_COLORS } from "./ui";
import { TaskRow } from "./TaskRow";
import { SortableList } from "./SortableList";

/** "DMA - fix login test" → project shorthand "DMA" + title; "> task" → backlog. */
function parseQuickAdd(raw: string): { title: string; toBacklog: boolean; project: string | null } {
  let text = raw.trim();
  let toBacklog = false;
  if (text.startsWith(">")) {
    toBacklog = true;
    text = text.replace(/^>+\s*/, "");
  }
  let project: string | null = null;
  const m = text.match(/^(\S{1,24})\s+-\s+(.+)$/);
  if (m) {
    project = m[1];
    text = m[2].trim();
  }
  return { title: text, toBacklog, project };
}

/** Stable palette pick for auto-created project tags (skips gray). */
function colorFor(name: string): string {
  const colors = TAG_COLORS.filter((c) => c !== "gray");
  let hash = 0;
  for (const ch of name.toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return colors[hash % colors.length];
}

export function TodayView({
  items,
  loading,
  mode,
  onModeChange,
}: {
  items: Item[];
  loading: boolean;
  mode: "today" | "backlog";
  onModeChange: (mode: "today" | "backlog") => void;
}) {
  const { data: tags = [] } = useTags();
  const createItem = useCreateItem();
  const createTag = useCreateTag();

  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const showingBacklog = mode === "backlog";

  const { open, doneToday, backlog } = useMemo(() => {
    const open = items
      .filter((it) => it.status === "today")
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const doneToday = items
      .filter((it) => isDoneToday(it))
      .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
    const backlog = items
      .filter((it) => it.status === "backlog")
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return { open, doneToday, backlog };
  }, [items]);

  const carriedCount = open.filter((it) => carriedDays(it) > 0).length;

  // Quick-add routes by the active column (Backlog tab adds to the pile),
  // overridden by an explicit "> " prefix.
  const add = () => {
    const parsed = parseQuickAdd(text);
    if (!parsed.title) return;
    const status = parsed.toBacklog || showingBacklog ? "backlog" : "today";
    const create = (tagIds: number[]) =>
      createItem.mutate({ type: "task", title: parsed.title, status, tags: tagIds });

    if (parsed.project) {
      const existing = tags.find((t) => t.name.toLowerCase() === parsed.project!.toLowerCase());
      if (existing) {
        create([existing.id]);
      } else {
        createTag.mutate(
          { name: parsed.project, kind: "project", color: colorFor(parsed.project) },
          { onSuccess: (tag) => create([tag.id]) }
        );
      }
    } else {
      create([]);
    }
    setText("");
    inputRef.current?.focus();
  };

  const today = new Date();
  const dateLabel = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-5 pt-5">
        {/* Today / Backlog segmented toggle — swaps this column's content. */}
        <div
          className="inline-flex rounded-md border border-subtle bg-overlay p-0.5 text-sm"
          role="tablist"
          aria-label="Task list"
        >
          <SegTab
            active={!showingBacklog}
            onClick={() => onModeChange("today")}
            icon={<SquareCheck size={13} />}
          >
            Today
            <span className="text-ink-muted">{open.length}</span>
          </SegTab>
          <SegTab
            active={showingBacklog}
            onClick={() => onModeChange("backlog")}
            icon={<Inbox size={13} />}
          >
            Backlog
            <span className="text-ink-muted">{backlog.length}</span>
          </SegTab>
        </div>

        {!showingBacklog ? (
          <div className="mt-3 flex items-baseline gap-2.5">
            <h2 className="text-lg font-semibold">{dateLabel}</h2>
            <span className="text-sm text-ink-muted">
              {doneToday.length} done
              {carriedCount > 0 ? ` · ${carriedCount} carried` : ""}
            </span>
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">
            Undated holding pile. Pull anything into Today with “→ Today”.
          </p>
        )}

        {/* Quick-add — auto-focused; the home for capture. */}
        <form
          className="mt-3 flex items-center gap-2 rounded-md border border-subtle bg-raised px-3 py-1 focus-within:border-[var(--accent)]"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <Plus size={15} className="shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            autoFocus
            className="h-9 w-full bg-transparent text-base outline-none placeholder:text-ink-muted"
            placeholder={
              showingBacklog
                ? "Add to the backlog pile…"
                : 'Add a task… "DMA - …" tags a project'
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </form>
      </div>

      {/* The active list. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : showingBacklog ? (
          backlog.length === 0 ? (
            <EmptyState
              title="Backlog is empty"
              hint='Add ideas here, or send a task back from Today with "← Backlog".'
            />
          ) : (
            <SortableList items={backlog} variant="backlog" />
          )
        ) : open.length === 0 && doneToday.length === 0 ? (
          <EmptyState
            title="Nothing on today's plate"
            hint="Type above to add a task, or pull one in from the Backlog."
          />
        ) : (
          <div className="space-y-1.5">
            {/* Open tasks reorder by drag; done ones are fixed at the bottom. */}
            <SortableList items={open} variant="today" />
            {doneToday.length > 0 && (
              <div className="pt-2" aria-hidden>
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Done today
                </span>
              </div>
            )}
            {doneToday.map((item) => (
              <TaskRow key={item.id} item={item} variant="today" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SegTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 transition-colors duration-fast ${
        active
          ? "bg-raised font-medium text-ink shadow-1"
          : "text-ink-secondary hover:text-ink"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
