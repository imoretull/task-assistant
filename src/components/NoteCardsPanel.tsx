import { useMemo, useState } from "react";
import { useUI } from "../App";
import { useCreateItem, usePins, useTags, useUpdateItem } from "../lib/queries";
import { bodyPreview, formatDate, todoProgress } from "../lib/filters";
import type { Item } from "../lib/types";
import { SCRATCH_ID } from "../lib/types";
import { Note, Pin, Plus, Search, SquareCheck, Star, X } from "./icons";
import { TagChip } from "./ui";

/**
 * Far-right panel of standalone note cards (status === null), one per row.
 * Cards mirror the Notes-tab card — squarish, with tags, todo progress, pin
 * count, and the updated date. Clicking a card opens that note in the shared
 * middle editor (the same place a task's notes open); the active note is
 * highlighted.
 */
export function NoteCardsPanel({ items, loading }: { items: Item[]; loading: boolean }) {
  const ui = useUI();
  const createItem = useCreateItem();
  const [query, setQuery] = useState("");

  const allNotes = useMemo(
    () =>
      items
        .filter((it) => it.type === "note" && it.status === null)
        .sort((a, b) => {
          if (a.starred !== b.starred) return a.starred ? -1 : 1;
          return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
        }),
    [items]
  );

  // Search matches the title and the note body (raw markdown, so it finds text
  // anywhere — list items, links, code). Case-insensitive substring.
  const notes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allNotes;
    return allNotes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
    );
  }, [allNotes, query]);

  const newNote = () =>
    createItem.mutate(
      { type: "note", title: "", tags: ui.activeTagIds },
      { onSuccess: (item) => ui.openItem(item.id) }
    );

  const searching = query.trim().length > 0;

  return (
    <aside aria-label="Notes" className="flex h-full flex-col bg-canvas">
      <header className="shrink-0 border-b border-subtle">
        <div className="flex h-11 items-center gap-2 px-3">
          <Note size={14} className="text-ink-muted" />
          <span className="text-sm font-semibold">Notes</span>
          <span className="text-sm text-ink-muted">
            {searching ? `${notes.length}/${allNotes.length}` : allNotes.length}
          </span>
          <button className="btn-ghost ml-auto shrink-0 text-xs" onClick={newNote}>
            <Plus size={12} /> New
          </button>
        </div>
        <div className="flex items-center gap-2 px-3 pb-2.5">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-subtle bg-raised px-2.5 py-1 focus-within:border-[var(--accent)]">
            <Search size={13} className="shrink-0 text-ink-muted" />
            <input
              className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-ink-muted"
              placeholder="Search notes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQuery("")}
              aria-label="Search notes by title and content"
            />
            {searching && (
              <button
                className="shrink-0 text-ink-muted hover:text-ink"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Always-on scratchpad — a single rough-notes surface that just retains.
          Opens in the shared middle editor; not a real note or task. */}
      <button
        onClick={() => ui.openItem(SCRATCH_ID)}
        aria-pressed={ui.openItemId === SCRATCH_ID}
        className={`flex shrink-0 items-center gap-2 border-b border-subtle px-3 py-2 text-left text-sm transition-colors duration-fast hover:bg-overlay ${
          ui.openItemId === SCRATCH_ID ? "bg-accent-soft text-ink" : "text-ink-secondary"
        }`}
      >
        <Note size={14} className="shrink-0 text-accent" />
        <span className="font-medium">Scratchpad</span>
        <span className="truncate text-xs text-ink-muted">jot something quickly</span>
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-md bg-overlay" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-ink-muted">
            {searching
              ? `No notes match “${query.trim()}”.`
              : "No notes yet. Capture a thought with “New”."}
          </p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} active={ui.openItemId === note.id} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function NoteCard({ note, active }: { note: Item; active: boolean }) {
  const ui = useUI();
  const { data: tags = [] } = useTags();
  const { data: pins = [] } = usePins();
  const updateItem = useUpdateItem();
  const itemTags = tags.filter((t) => note.tags.includes(t.id));
  const preview = bodyPreview(note.body);
  const extraTags = itemTags.length - 3;
  const progress = todoProgress(note.body);
  const pinCount = pins.filter((p) => p.itemId === note.id).length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => ui.openItem(note.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") ui.openItem(note.id);
        else if (e.key === "s") updateItem.mutate({ id: note.id, starred: !note.starred });
      }}
      aria-pressed={active}
      className={`card group flex min-h-[176px] cursor-pointer select-none flex-col gap-2 p-4 text-left transition-colors duration-fast ${
        active ? "border-[var(--accent)] ring-1 ring-[var(--accent)]" : "hover:border-strong"
      }`}
    >
      {/* Top row: id + star */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-ink-muted">{note.id}</span>
        <button
          aria-label={note.starred ? "Unstar" : "Star"}
          className={`ml-auto shrink-0 transition-colors duration-fast ${
            note.starred
              ? "text-[var(--priority-high)]"
              : "text-ink-muted opacity-0 hover:text-ink group-hover:opacity-100"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            updateItem.mutate({ id: note.id, starred: !note.starred });
          }}
        >
          <Star size={15} filled={note.starred} />
        </button>
      </div>

      <h3 className="line-clamp-2 text-base font-medium leading-snug">
        {note.title || <span className="text-ink-muted">Untitled</span>}
      </h3>
      {preview && <p className="line-clamp-3 text-sm text-ink-secondary">{preview}</p>}

      <div className="mt-auto flex flex-col gap-1.5 pt-1">
        {(progress !== null || pinCount > 0) && (
          <div className="flex items-center gap-2">
            {progress !== null && (
              <span
                className={`chip ${progress.done === progress.total ? "text-[var(--status-done)]" : ""}`}
                title={`${progress.done} of ${progress.total} todos done`}
              >
                <SquareCheck size={11} />
                {progress.done}/{progress.total}
              </span>
            )}
            {pinCount > 0 && (
              <span className="chip" title={`${pinCount} pinned line${pinCount === 1 ? "" : "s"}`}>
                <Pin size={11} />
                {pinCount}
              </span>
            )}
          </div>
        )}
        {itemTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {itemTags.slice(0, 3).map((t) => (
              <TagChip key={t.id} tag={t} />
            ))}
            {extraTags > 0 && <span className="text-xs text-ink-muted">+{extraTags}</span>}
          </div>
        )}
        <span className="text-xs text-ink-muted">Updated {formatDate(note.updatedAt)}</span>
      </div>
    </div>
  );
}
