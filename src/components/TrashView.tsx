import { useEmptyTrash, usePermanentDelete, useRestoreItem, useTrash } from "../lib/queries";
import { bodyPreview, formatDate } from "../lib/filters";
import { Restore, Trash } from "./icons";
import { EmptyState, Skeleton } from "./ui";

export function TrashView() {
  const { data: items = [], isLoading } = useTrash();
  const restore = useRestoreItem();
  const destroy = usePermanentDelete();
  const empty = useEmptyTrash();

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return <EmptyState title="Trash is empty" hint="Deleted items land here and can be restored." />;
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {items.length} item{items.length === 1 ? "" : "s"} in trash
        </p>
        <button
          className="btn-ghost text-[var(--priority-urgent)]"
          onClick={() => {
            if (confirm("Permanently delete everything in the trash?")) empty.mutate();
          }}
        >
          <Trash size={13} /> Empty trash
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="card flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-medium">
                {item.title || <span className="text-ink-muted">Untitled</span>}
              </p>
              <p className="truncate text-sm text-ink-muted">
                <span className="font-mono">{item.id}</span> · deleted {formatDate(item.deletedAt)}
                {item.body ? ` · ${bodyPreview(item.body, 80)}` : ""}
              </p>
            </div>
            <button className="btn-ghost" onClick={() => restore.mutate(item.id)}>
              <Restore size={13} /> Restore
            </button>
            <button
              className="icon-btn text-[var(--priority-urgent)]"
              aria-label="Delete forever"
              onClick={() => {
                if (confirm(`Permanently delete ${item.id}?`)) destroy.mutate(item.id);
              }}
            >
              <Trash size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
