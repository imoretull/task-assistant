import { useUI } from "../App";
import { usePins, useTags, useUpdateItem } from "../lib/queries";
import { bodyPreview, formatDate, groupItems, todoProgress } from "../lib/filters";
import type { Item } from "../lib/types";
import { Pin, SquareCheck, Star } from "./icons";
import { EmptyState, GroupDivider, Skeleton, StatusChip, TagChip } from "./ui";

/** Card grid used by the Notes, All and Starred views. When a sort is active,
 *  the grid is split into clearly-divided sections (Today / Urgent / …). */
export function NotesGrid({ items, loading }: { items: Item[]; loading: boolean }) {
  const ui = useUI();

  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,264px)] gap-4 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing here yet"
        hint="Create a note (⌘/Ctrl-N) or adjust the active tag filters."
      />
    );
  }

  const groups = groupItems(items, ui.sort);

  if (groups === null) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,264px)] gap-4 p-4">
        {items.map((item) => (
          <NoteCard key={item.id} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4">
      {groups.map((g) => (
        <section key={g.label} aria-label={g.label}>
          <GroupDivider label={g.label} count={g.items.length} />
          <div className="mt-2.5 grid grid-cols-[repeat(auto-fill,264px)] gap-4">
            {g.items.map((item) => (
              <NoteCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function NoteCard({ item }: { item: Item }) {
  const ui = useUI();
  const { data: tags = [] } = useTags();
  const { data: pins = [] } = usePins();
  const updateItem = useUpdateItem();
  const itemTags = tags.filter((t) => item.tags.includes(t.id));
  const selected = ui.selection.includes(item.id);
  const preview = bodyPreview(item.body);
  const extraTags = itemTags.length - 3;
  const progress = todoProgress(item.body);
  const pinCount = pins.filter((p) => p.itemId === item.id).length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey) ui.toggleSelect(item.id);
        else ui.openItem(item.id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") ui.openItem(item.id);
        else if (e.key === "s") updateItem.mutate({ id: item.id, starred: !item.starred });
      }}
      className={`card group flex min-h-[176px] cursor-pointer select-none flex-col gap-2 p-4 text-left ${
        selected ? "border-[var(--accent)] ring-1 ring-[var(--accent)]" : ""
      }`}
    >
      {/* Top row: id + status + star */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-ink-muted">{item.id}</span>
        {item.status && <StatusChip status={item.status} />}
        <button
          aria-label={item.starred ? "Unstar" : "Star"}
          className={`ml-auto shrink-0 transition-colors duration-fast ${
            item.starred
              ? "text-[var(--priority-high)]"
              : "text-ink-muted opacity-0 hover:text-ink group-hover:opacity-100"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            updateItem.mutate({ id: item.id, starred: !item.starred });
          }}
        >
          <Star size={15} filled={item.starred} />
        </button>
      </div>

      <h3 className="line-clamp-2 text-base font-medium leading-snug">
        {item.title || <span className="text-ink-muted">Untitled</span>}
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
        <span className="text-xs text-ink-muted">Updated {formatDate(item.updatedAt)}</span>
      </div>
    </div>
  );
}
