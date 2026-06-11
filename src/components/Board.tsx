import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUI } from "../App";
import { useDeleteItem, usePins, useTags, useUpdateItem } from "../lib/queries";
import { bodyPreview, formatDate, groupItems, todoProgress } from "../lib/filters";
import { STATUSES, type Item, type Status } from "../lib/types";
import { Calendar, Pin, SquareCheck, Star } from "./icons";
import { GroupDivider, PriorityChip, Skeleton, TagChip } from "./ui";

export function BoardView({ items, loading }: { items: Item[]; loading: boolean }) {
  const ui = useUI();
  const updateItem = useUpdateItem();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const columns = useMemo(() => {
    const map = new Map<Status, Item[]>(STATUSES.map((s) => [s.key, []]));
    for (const it of items) {
      if (it.status) map.get(it.status)?.push(it);
    }
    return map;
  }, [items]);

  const activeItem = activeId ? items.find((i) => i.id === activeId) ?? null : null;

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const itemId = String(active.id);
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const overId = String(over.id);
    let targetStatus: Status;
    let targetIndex: number;

    if (overId.startsWith("col:")) {
      targetStatus = overId.slice(4) as Status;
      targetIndex = (columns.get(targetStatus) ?? []).filter((i) => i.id !== itemId).length;
    } else {
      const overItem = items.find((i) => i.id === overId);
      if (!overItem || !overItem.status) return;
      targetStatus = overItem.status;
      const list = (columns.get(targetStatus) ?? []).filter((i) => i.id !== itemId);
      targetIndex = list.findIndex((i) => i.id === overId);
      if (targetIndex === -1) targetIndex = list.length;
    }

    const list = (columns.get(targetStatus) ?? []).filter((i) => i.id !== itemId);
    const before = list[targetIndex - 1];
    const after = list[targetIndex];
    let sortOrder: number;
    if (!before && !after) sortOrder = 1000;
    else if (!before) sortOrder = after.sortOrder - 1000;
    else if (!after) sortOrder = before.sortOrder + 1000;
    else sortOrder = (before.sortOrder + after.sortOrder) / 2;

    if (item.status === targetStatus && item.sortOrder === sortOrder) return;
    updateItem.mutate({ id: itemId, status: targetStatus, sortOrder });
  };

  if (loading) {
    return (
      <div className="flex gap-4 p-4">
        {STATUSES.map((s) => (
          <div key={s.key} className="w-[272px] shrink-0 space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex h-full min-w-max gap-4 p-4">
        {STATUSES.map((s) => (
          <BoardColumn
            key={s.key}
            status={s.key}
            label={s.label}
            items={columns.get(s.key) ?? []}
            sort={ui.sort}
          />
        ))}
      </div>
      <DragOverlay>{activeItem ? <TaskCard item={activeItem} overlay /> : null}</DragOverlay>
    </DndContext>
  );
}

function BoardColumn({
  status,
  label,
  items,
  sort,
}: {
  status: Status;
  label: string;
  items: Item[];
  sort: ReturnType<typeof useUI>["sort"];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${status}` });
  // Partition the column by the active sort so groups read as clear sections.
  const groups = groupItems(items, sort);

  return (
    <section className="flex w-[272px] shrink-0 flex-col" aria-label={`${label} column`}>
      <header className="mb-2 flex items-center gap-2 px-1">
        <span className="h-2 w-2 rounded-full" style={{ background: `var(--status-${status})` }} />
        <h2 className="text-sm font-semibold text-ink-secondary">{label}</h2>
        <span className="text-xs text-ink-muted">{items.length}</span>
      </header>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex min-h-[140px] flex-1 flex-col gap-2.5 rounded-md p-1 transition-colors duration-fast ${
            isOver ? "bg-accent-soft" : ""
          }`}
        >
          {groups === null
            ? items.map((item) => <SortableTaskCard key={item.id} item={item} />)
            : groups.map((g) => (
                <div key={g.label} className="flex flex-col gap-2.5">
                  <GroupDivider label={g.label} count={g.items.length} />
                  {g.items.map((item) => (
                    <SortableTaskCard key={item.id} item={item} />
                  ))}
                </div>
              ))}
          {items.length === 0 && (
            <p className="rounded-md border border-dashed border-subtle p-4 text-center text-xs text-ink-muted">
              Drop tasks here
            </p>
          )}
        </div>
      </SortableContext>
    </section>
  );
}

function SortableTaskCard({ item }: { item: Item }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-40" : ""}
      {...attributes}
      {...listeners}
    >
      <TaskCard item={item} />
    </div>
  );
}

export function TaskCard({ item, overlay = false }: { item: Item; overlay?: boolean }) {
  const ui = useUI();
  const { data: tags = [] } = useTags();
  const { data: pins = [] } = usePins();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const itemTags = tags.filter((t) => item.tags.includes(t.id));
  const selected = ui.selection.includes(item.id);
  const extraTags = itemTags.length - 3;
  const progress = todoProgress(item.body);
  const pinCount = pins.filter((p) => p.itemId === item.id).length;

  const moveColumn = (dir: -1 | 1) => {
    if (!item.status) return;
    const idx = STATUSES.findIndex((s) => s.key === item.status);
    const next = STATUSES[idx + dir];
    if (next) updateItem.mutate({ id: item.id, status: next.key });
  };

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
        else if (e.key === "Delete" || e.key === "Backspace") deleteItem.mutate(item.id);
        else if (e.key === "[") moveColumn(-1);
        else if (e.key === "]") moveColumn(1);
      }}
      className={`card group flex min-h-[176px] cursor-pointer select-none flex-col gap-2 p-4 text-left ${
        overlay ? "shadow-3" : ""
      } ${selected ? "border-[var(--accent)] ring-1 ring-[var(--accent)]" : ""}`}
    >
      {/* Top row: id + star, out of the way of the content */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-ink-muted">{item.id}</span>
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

      <p className="line-clamp-2 text-base font-medium leading-snug">
        {item.title || <span className="text-ink-muted">Untitled</span>}
      </p>
      {bodyPreview(item.body, 120) && (
        <p className="line-clamp-2 text-sm text-ink-secondary">{bodyPreview(item.body, 120)}</p>
      )}

      {/* Footer: meta on one line, tags on their own line */}
      <div className="mt-auto flex flex-col gap-1.5 pt-1">
        <div className="flex items-center gap-2">
          <PriorityChip priority={item.priority} />
          {item.dueDate && (
            <span className="chip">
              <Calendar size={11} />
              {formatDate(item.dueDate)}
            </span>
          )}
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
        {itemTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {itemTags.slice(0, 3).map((t) => (
              <TagChip key={t.id} tag={t} />
            ))}
            {extraTags > 0 && <span className="text-xs text-ink-muted">+{extraTags}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
