import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUpdateItem } from "../lib/queries";
import type { Item } from "../lib/types";
import { Grip } from "./icons";
import { TaskRow } from "./TaskRow";

/**
 * A reorderable list of task rows (Today's open queue or the Backlog). Drag a
 * row by its grip to set the manual order; the new position is persisted as a
 * fractional sortOrder so a single PATCH reorders without renumbering siblings.
 */
export function SortableList({
  items,
  variant,
  focusedId,
}: {
  items: Item[];
  variant: "today" | "backlog";
  /** Id of the keyboard-focused row, forwarded to TaskRow for the focus ring. */
  focusedId?: string | null;
}) {
  const updateItem = useUpdateItem();
  const sensors = useSensors(
    // A small distance gate so a plain click (open notes) isn't read as a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((it) => it.id === active.id);
    const newIndex = items.findIndex((it) => it.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    // Order after the move, to read the new neighbours' sortOrder.
    const reordered = arrayMove(items, oldIndex, newIndex);
    const before = reordered[newIndex - 1];
    const after = reordered[newIndex + 1];
    let sortOrder: number;
    if (!before) sortOrder = (after?.sortOrder ?? 1000) - 1000;
    else if (!after) sortOrder = before.sortOrder + 1000;
    else sortOrder = (before.sortOrder + after.sortOrder) / 2;

    updateItem.mutate({ id: String(active.id), sortOrder });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((it) => it.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1.5">
          {items.map((item) => (
            <SortableTask
              key={item.id}
              item={item}
              variant={variant}
              focused={item.id === focusedId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableTask({
  item,
  variant,
  focused,
}: {
  item: Item;
  variant: "today" | "backlog";
  focused: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    opacity: isDragging ? 0.85 : undefined,
  };

  const handle = (
    <button
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
      className="-ml-1 shrink-0 cursor-grab touch-none text-ink-muted opacity-0 transition-opacity duration-fast hover:text-ink focus-visible:opacity-100 group-hover:opacity-100 active:cursor-grabbing"
    >
      <Grip size={14} />
    </button>
  );

  return (
    <div ref={setNodeRef} style={style}>
      <TaskRow item={item} variant={variant} dragHandle={handle} focused={focused} />
    </div>
  );
}
