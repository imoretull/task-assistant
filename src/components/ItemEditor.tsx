import { useEffect, useRef, useState } from "react";
import { useUI } from "../App";
import { useDeleteItem, useUpdateItem } from "../lib/queries";
import { carriedDays } from "../lib/filters";
import { DIFFICULTIES, PRIORITIES, type Item } from "../lib/types";
import { RichTextEditor } from "./RichTextEditor";
import { ArrowLeft, ArrowRight, SquareCheck, Star, Trash, X } from "./icons";
import { TagPicker } from "./TagPicker";
import { Tip } from "./ui";

/**
 * The shared middle editor. Both a task (clicked in the task column) and a
 * note (clicked in the note-cards panel) open here, in the same place — the
 * surrounding columns don't move. A task shows its status + Today/Backlog
 * moves; a note shows star, priority/difficulty/due, and "convert to task".
 * Autosaves continuously.
 */
export function ItemEditor({ item }: { item: Item }) {
  const ui = useUI();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const isNote = item.status === null;

  // Local draft + ~500ms debounced autosave for title/body (write-and-forget).
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body);
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const latest = useRef({ title, body });
  latest.current = { title, body };

  const queueSave = () => {
    setSaved(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      updateItem.mutate(
        { id: item.id, ...latest.current },
        { onSuccess: () => setSaved(true) }
      );
    }, 500);
  };

  // Flush pending save on unmount (close / switch to another item).
  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
      const { title: t, body: b } = latest.current;
      if (t !== item.title || b !== item.body) {
        updateItem.mutate({ id: item.id, title: t, body: b });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carried = item.status === "today" ? carriedDays(item) : 0;

  return (
    <section
      aria-label={`${isNote ? "Note" : "Notes for"} ${item.id}`}
      className="flex h-full min-w-0 flex-1 flex-col bg-raised"
    >
      <header className="flex h-11 shrink-0 items-center gap-2.5 border-b border-subtle px-4">
        <span className="font-mono text-sm text-ink-muted">{item.id}</span>
        {isNote ? (
          <span className="chip text-ink-secondary">Note</span>
        ) : (
          <span className="chip" style={{ color: `var(--status-${item.status})` }}>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: `var(--status-${item.status})` }}
            />
            {item.status === "today" ? "Today" : item.status === "backlog" ? "Backlog" : "Done"}
            {carried > 0 ? ` · ${carried}d` : ""}
          </span>
        )}
        <span className="text-xs text-ink-muted">{saved ? "Saved" : "Saving…"}</span>
        <div className="ml-auto flex items-center gap-1">
          {isNote && (
            <Tip label={item.starred ? "Unstar" : "Star"}>
              <button
                className={`icon-btn ${item.starred ? "text-[var(--priority-high)]" : ""}`}
                aria-label="Star"
                onClick={() => updateItem.mutate({ id: item.id, starred: !item.starred })}
              >
                <Star size={15} filled={item.starred} />
              </button>
            </Tip>
          )}
          <Tip label="Move to trash">
            <button
              className="icon-btn"
              aria-label="Move to trash"
              onClick={() => {
                deleteItem.mutate(item.id);
                ui.openItem(null);
              }}
            >
              <Trash size={14} />
            </button>
          </Tip>
          <button className="icon-btn" aria-label="Close" onClick={() => ui.openItem(null)}>
            <X size={15} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <input
          className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-ink-muted"
          placeholder="Untitled"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            queueSave();
          }}
        />

        {/* Action row — adapts to task vs note. */}
        <div className="flex flex-wrap items-center gap-2">
          <TagPicker item={item} />
          {item.status === "today" && (
            <button
              className="btn-ghost ml-auto shrink-0 text-xs"
              onClick={() => updateItem.mutate({ id: item.id, status: "backlog" })}
            >
              <ArrowLeft size={11} /> Backlog
            </button>
          )}
          {item.status === "backlog" && (
            <button
              className="btn-ghost ml-auto shrink-0 text-xs text-accent"
              onClick={() => updateItem.mutate({ id: item.id, status: "today" })}
            >
              <ArrowRight size={11} /> Today
            </button>
          )}
          {isNote && (
            <button
              className="btn-ghost ml-auto shrink-0 text-xs text-accent"
              onClick={() => updateItem.mutate({ id: item.id, status: "today" })}
            >
              <SquareCheck size={11} /> Make a task
            </button>
          )}
        </div>

        {/* Notes carry priority/difficulty/due metadata (tasks stay lean). */}
        {isNote && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-subtle bg-overlay px-3 py-2">
            <label className="flex items-center gap-1.5 text-xs text-ink-muted">
              Priority
              <select
                className="rounded-sm border border-subtle bg-raised px-1.5 py-1 text-sm text-ink"
                value={item.priority}
                onChange={(e) =>
                  updateItem.mutate({ id: item.id, priority: e.target.value as Item["priority"] })
                }
              >
                {PRIORITIES.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-ink-muted">
              Difficulty
              <select
                className="rounded-sm border border-subtle bg-raised px-1.5 py-1 text-sm text-ink"
                value={item.difficulty}
                onChange={(e) =>
                  updateItem.mutate({ id: item.id, difficulty: e.target.value as Item["difficulty"] })
                }
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-ink-muted">
              Due
              <input
                type="date"
                className="rounded-sm border border-subtle bg-raised px-1.5 py-1 text-sm text-ink"
                value={item.dueDate ?? ""}
                onChange={(e) => updateItem.mutate({ id: item.id, dueDate: e.target.value || null })}
              />
            </label>
          </div>
        )}

        <RichTextEditor
          item={item}
          value={body}
          onChange={(v) => {
            setBody(v);
            queueSave();
          }}
        />
      </div>

      <footer className="shrink-0 space-y-0.5 border-t border-subtle px-4 py-2 text-xs text-ink-muted">
        <p>Created {new Date(item.createdAt).toLocaleString()}</p>
        {item.completedAt && <p>Completed {new Date(item.completedAt).toLocaleString()}</p>}
      </footer>
    </section>
  );
}
