import { useEffect, useMemo, useRef, useState } from "react";
import { useUI } from "../App";
import {
  useCreateItem,
  useCreateTag,
  useDeleteItem,
  useTags,
  useUpdateItem,
} from "../lib/queries";
import { carriedDays, isDoneToday } from "../lib/filters";
import type { Item } from "../lib/types";
import { Inbox, Plus, SquareCheck } from "./icons";
import { EmptyState, Skeleton, TAG_COLORS, tagDotColor } from "./ui";
import { TaskRow } from "./TaskRow";
import { SortableList } from "./SortableList";
import { CarryTriage } from "./CarryTriage";

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
  const ui = useUI();
  const { data: tags = [] } = useTags();
  const createItem = useCreateItem();
  const createTag = useCreateTag();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const [text, setText] = useState("");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
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

  const carried = useMemo(() => open.filter((it) => carriedDays(it) > 0), [open]);
  const carriedCount = carried.length;

  const projects = useMemo(() => tags.filter((t) => t.kind === "project"), [tags]);

  // Live read of the quick-add box: routing destination, parsed project, and a
  // typed-but-not-yet-delimited token to autocomplete against project tags.
  const preview = useMemo(() => {
    const parsed = parseQuickAdd(text);
    const toBacklog = parsed.toBacklog || showingBacklog;
    // The leading token before any " - " is a candidate project prefix; while
    // there's no delimiter yet we offer matching projects as completions.
    const head = text.replace(/^>+\s*/, "");
    const hasDelimiter = /\s+-\s+/.test(head);
    const token = hasDelimiter ? "" : head.split(/\s+/)[0] ?? "";
    const suggestions =
      token.length >= 1 && !parsed.project
        ? projects.filter(
            (p) =>
              p.name.toLowerCase().startsWith(token.toLowerCase()) &&
              p.name.toLowerCase() !== token.toLowerCase()
          )
        : [];
    const knownProject = parsed.project
      ? projects.find((p) => p.name.toLowerCase() === parsed.project!.toLowerCase()) ?? null
      : null;
    return { parsed, toBacklog, suggestions, knownProject };
  }, [text, showingBacklog, projects]);

  const [suggestIndex, setSuggestIndex] = useState(0);
  // Reset the highlighted suggestion whenever the suggestion set changes.
  useEffect(() => setSuggestIndex(0), [preview.suggestions.length, text]);

  const applySuggestion = (name: string) => {
    setText(`${name} - `);
    inputRef.current?.focus();
  };

  // Keyboard navigation operates over the rows visible in the active column:
  // Today shows open tasks then done-today; Backlog shows the pile.
  const navList = useMemo(
    () => (showingBacklog ? backlog : [...open, ...doneToday]),
    [showingBacklog, backlog, open, doneToday]
  );

  // Keep the focused id valid as the list changes (completing a task, a move,
  // a delete). Falls back to the nearest surviving row, or clears.
  const focusIndex = focusedId ? navList.findIndex((it) => it.id === focusedId) : -1;
  // Remember where the cursor was so a vanished row lands on its neighbour.
  const prevIndex = useRef(0);
  if (focusIndex >= 0) prevIndex.current = focusIndex;
  useEffect(() => {
    if (focusedId && focusIndex === -1) {
      setFocusedId(
        navList.length ? navList[Math.min(prevIndex.current, navList.length - 1)].id : null
      );
    }
  }, [focusedId, focusIndex, navList]);

  // Switching column or database clears the cursor — ids don't carry across.
  useEffect(() => setFocusedId(null), [showingBacklog]);

  const moveFocus = (delta: number) => {
    if (navList.length === 0) return;
    const next = focusIndex < 0 ? (delta > 0 ? 0 : navList.length - 1) : focusIndex + delta;
    const clamped = Math.max(0, Math.min(navList.length - 1, next));
    setFocusedId(navList[clamped].id);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack typing in the quick-add box, the editor, or any field.
      const t = e.target as HTMLElement | null;
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        (t &&
          (t.tagName === "INPUT" ||
            t.tagName === "TEXTAREA" ||
            t.isContentEditable))
      ) {
        return;
      }

      const focused = focusIndex >= 0 ? navList[focusIndex] : null;
      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          moveFocus(1);
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          moveFocus(-1);
          break;
        case "x":
        case " ":
          if (focused) {
            e.preventDefault();
            const done = focused.status === "done";
            updateItem.mutate({ id: focused.id, status: done ? "today" : "done" });
          }
          break;
        case "e":
        case "Enter":
          if (focused) {
            e.preventDefault();
            ui.openItem(focused.id);
          }
          break;
        case "b":
          if (focused && focused.status !== "done") {
            e.preventDefault();
            updateItem.mutate({
              id: focused.id,
              status: focused.status === "backlog" ? "today" : "backlog",
            });
          }
          break;
        case "Delete":
          // Delete only (not Backspace) — deliberate, and soft (to Trash).
          if (focused) {
            e.preventDefault();
            deleteItem.mutate(focused.id);
            if (ui.openItemId === focused.id) ui.openItem(null);
          }
          break;
        case "Escape":
          if (focused) {
            e.preventDefault();
            setFocusedId(null);
          }
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navList, focusIndex, ui]);

  // Scroll the focused row into view when it moves off-screen.
  useEffect(() => {
    if (!focusedId) return;
    listRef.current
      ?.querySelector('[data-focused]')
      ?.scrollIntoView({ block: "nearest" });
  }, [focusedId]);

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
        <div className="relative mt-3">
          <form
            className="flex items-center gap-2 rounded-md border border-subtle bg-raised px-3 py-1 focus-within:border-[var(--accent)]"
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
              onKeyDown={(e) => {
                const sugg = preview.suggestions;
                if (sugg.length > 0 && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                  e.preventDefault();
                  setSuggestIndex((i) =>
                    e.key === "ArrowDown"
                      ? (i + 1) % sugg.length
                      : (i - 1 + sugg.length) % sugg.length
                  );
                } else if (sugg.length > 0 && (e.key === "Tab" || e.key === "Enter")) {
                  // Tab always completes; Enter completes only while the head
                  // token is still being typed (no task text yet to submit).
                  const justToken = !/\s+-\s+/.test(text.replace(/^>+\s*/, ""));
                  if (e.key === "Tab" || justToken) {
                    e.preventDefault();
                    applySuggestion(sugg[suggestIndex].name);
                  }
                }
              }}
            />
            {/* Live routing/project preview, right-aligned inside the box. */}
            {text.trim() && (
              <div className="flex shrink-0 items-center gap-1.5 pl-2">
                {preview.knownProject ? (
                  <span className="chip">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: tagDotColor(preview.knownProject.color) }}
                    />
                    <span className="max-w-[90px] truncate">{preview.knownProject.name}</span>
                  </span>
                ) : preview.parsed.project ? (
                  <span className="chip text-ink-muted" title="New project tag">
                    + {preview.parsed.project}
                  </span>
                ) : null}
                <span
                  className={`chip ${preview.toBacklog ? "text-ink-muted" : "text-accent"}`}
                  title={preview.toBacklog ? "Routes to Backlog" : "Adds to Today"}
                >
                  {preview.toBacklog ? <Inbox size={11} /> : <SquareCheck size={11} />}
                  {preview.toBacklog ? "Backlog" : "Today"}
                </span>
              </div>
            )}
          </form>

          {/* Project autocomplete — appears as you type a known project prefix. */}
          {preview.suggestions.length > 0 && (
            <ul
              className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-subtle bg-popover py-1 shadow-2"
              role="listbox"
              aria-label="Project suggestions"
            >
              {preview.suggestions.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === suggestIndex}
                    onMouseEnter={() => setSuggestIndex(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applySuggestion(p.name);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                      i === suggestIndex ? "bg-overlay" : ""
                    }`}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: tagDotColor(p.color) }}
                    />
                    <span className="truncate">{p.name}</span>
                    <span className="ml-auto text-xs text-ink-muted">{p.name} - …</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Morning carry-over triage — only in Today, only when something rolled
            over. Dismisses itself for the day. */}
        {!showingBacklog && carried.length > 0 && <CarryTriage carried={carried} />}
      </div>

      {/* The active list. */}
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
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
            <SortableList items={backlog} variant="backlog" focusedId={focusedId} />
          )
        ) : open.length === 0 && doneToday.length === 0 ? (
          <EmptyState
            title="Nothing on today's plate"
            hint="Type above to add a task, or pull one in from the Backlog."
          />
        ) : (
          <div className="space-y-1.5">
            {/* Open tasks reorder by drag; done ones are fixed at the bottom. */}
            <SortableList items={open} variant="today" focusedId={focusedId} />
            {doneToday.length > 0 && (
              <div className="pt-2" aria-hidden>
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Done today
                </span>
              </div>
            )}
            {doneToday.map((item) => (
              <TaskRow
                key={item.id}
                item={item}
                variant="today"
                focused={item.id === focusedId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Keyboard legend. A quiet one-line prompt at rest (so the feature is
          discoverable), expanding to the full key map once a row is focused. */}
      {!loading && navList.length > 0 && (
        <div className="shrink-0 border-t border-subtle px-5 py-1.5">
          {focusedId ? (
            <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-muted">
              <Kbd>j</Kbd>
              <Kbd>k</Kbd>
              <span>move</span>
              <Kbd>x</Kbd>
              <span>done</span>
              <Kbd>e</Kbd>
              <span>open</span>
              <Kbd>b</Kbd>
              <span>{showingBacklog ? "→ today" : "→ backlog"}</span>
              <Kbd>del</Kbd>
              <span>trash</span>
              <Kbd>esc</Kbd>
              <span>clear</span>
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-[11px] text-ink-muted">
              <span>Press</span>
              <Kbd>j</Kbd>
              <span>to navigate with the keyboard</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-subtle bg-overlay px-1 font-mono text-[10px] text-ink-secondary">
      {children}
    </kbd>
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
