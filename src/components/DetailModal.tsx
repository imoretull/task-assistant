import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { useUI } from "../App";
import {
  useCreateTag,
  useDeleteItem,
  useItems,
  useTags,
  useUpdateItem,
} from "../lib/queries";
import {
  DIFFICULTIES,
  PRIORITIES,
  STATUSES,
  type Item,
} from "../lib/types";
import { RichTextEditor } from "./RichTextEditor";
import { AssistantPanel } from "./AssistantPanel";
import { Plus, Star, Trash, X } from "./icons";
import { TagChip } from "./ui";

export function DetailModal() {
  const ui = useUI();
  const { data: items = [] } = useItems();
  const item = items.find((i) => i.id === ui.openItemId) ?? null;

  return (
    <Dialog.Root open={item !== null} onOpenChange={(open) => !open && ui.openItem(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[min(960px,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-subtle bg-popover shadow-3"
          aria-describedby={undefined}
        >
          {item && <DetailBody key={item.id} item={item} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DetailBody({ item }: { item: Item }) {
  const ui = useUI();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  // Local draft + ~500ms debounced autosave for title/body.
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

  // Flush pending save on unmount (modal close).
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

  const isTask = item.status !== null;

  return (
    <>
      <header className="flex items-center gap-3 border-b border-subtle px-5 py-3">
        <span className="font-mono text-sm text-ink-muted">{item.id}</span>
        <span className="text-xs text-ink-muted">{saved ? "Saved" : "Saving…"}</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            className={`icon-btn ${item.starred ? "text-[var(--priority-high)]" : ""}`}
            aria-label="Star"
            onClick={() => updateItem.mutate({ id: item.id, starred: !item.starred })}
          >
            <Star size={15} filled={item.starred} />
          </button>
          <button
            className="icon-btn"
            aria-label="Move to trash"
            onClick={() => {
              deleteItem.mutate(item.id);
              ui.openItem(null);
            }}
          >
            <Trash size={15} />
          </button>
          <Dialog.Close asChild>
            <button className="icon-btn" aria-label="Close">
              <X size={15} />
            </button>
          </Dialog.Close>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left: title + markdown editor */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-5">
          <Dialog.Title asChild>
            <input
              className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-ink-muted"
              placeholder="Untitled"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                queueSave();
              }}
            />
          </Dialog.Title>
          <RichTextEditor
            item={item}
            value={body}
            onChange={(v) => {
              setBody(v);
              queueSave();
            }}
          />
          <AssistantPanel item={item} draftBody={body} onReplaceBody={(v) => {
            setBody(v);
            queueSave();
          }} />
        </div>

        {/* Right: metadata */}
        <aside className="w-60 shrink-0 space-y-4 overflow-y-auto border-l border-subtle bg-overlay p-4">
          <Field label="Status">
            {isTask ? (
              <select
                className="input py-1"
                value={item.status ?? "todo"}
                onChange={(e) => updateItem.mutate({ id: item.id, status: e.target.value as Item["status"] })}
              >
                {STATUSES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            ) : (
              <button
                className="btn-ghost w-full justify-center"
                onClick={() => updateItem.mutate({ id: item.id, status: "todo" })}
              >
                Convert to task
              </button>
            )}
          </Field>
          {isTask && item.type === "note" && (
            <p className="text-xs text-ink-muted">
              Converted note — keeps its {item.id.startsWith("N") ? "N-" : ""}id.
            </p>
          )}

          <Field label="Priority">
            <select
              className="input py-1"
              value={item.priority}
              onChange={(e) => updateItem.mutate({ id: item.id, priority: e.target.value as Item["priority"] })}
            >
              {PRIORITIES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Difficulty">
            <div className="flex gap-1">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.key}
                  onClick={() => updateItem.mutate({ id: item.id, difficulty: d.key })}
                  className={`flex-1 rounded-sm border px-1 py-1 text-xs transition-colors duration-fast ${
                    item.difficulty === d.key
                      ? "border-[var(--accent)] bg-accent-soft font-medium text-ink"
                      : "border-subtle text-ink-muted hover:border-strong hover:text-ink"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Due date">
            <input
              type="date"
              className="input py-1"
              value={item.dueDate ?? ""}
              onChange={(e) => updateItem.mutate({ id: item.id, dueDate: e.target.value || null })}
            />
          </Field>

          <Field label="Tags">
            <TagPicker item={item} />
          </Field>

          <div className="space-y-1 border-t border-subtle pt-3 text-xs text-ink-muted">
            <p>Created {new Date(item.createdAt).toLocaleString()}</p>
            <p>Updated {new Date(item.updatedAt).toLocaleString()}</p>
          </div>
        </aside>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="label">{label}</p>
      {children}
    </div>
  );
}

function TagPicker({ item }: { item: Item }) {
  const { data: tags = [] } = useTags();
  const updateItem = useUpdateItem();
  const createTag = useCreateTag();
  const [query, setQuery] = useState("");

  const itemTags = tags.filter((t) => item.tags.includes(t.id));
  const available = tags.filter(
    (t) => !item.tags.includes(t.id) && t.name.toLowerCase().includes(query.toLowerCase())
  );

  const addTag = (tagId: number) =>
    updateItem.mutate({ id: item.id, tags: [...item.tags, tagId] });
  const removeTag = (tagId: number) =>
    updateItem.mutate({ id: item.id, tags: item.tags.filter((t) => t !== tagId) });

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {itemTags.map((t) => (
        <span key={t.id} className="chip">
          {t.name}
          <button aria-label={`Remove tag ${t.name}`} onClick={() => removeTag(t.id)}>
            <X size={10} />
          </button>
        </span>
      ))}
      <Popover.Root onOpenChange={() => setQuery("")}>
        <Popover.Trigger asChild>
          <button className="chip cursor-pointer hover:border-strong" aria-label="Add tag">
            <Plus size={11} /> Add
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            className="z-[60] w-52 rounded-md border border-subtle bg-popover p-2 shadow-2"
          >
            <input
              autoFocus
              className="input mb-1.5 py-1 text-sm"
              placeholder="Search or create…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  const existing = tags.find(
                    (t) => t.name.toLowerCase() === query.trim().toLowerCase()
                  );
                  if (existing) {
                    if (!item.tags.includes(existing.id)) addTag(existing.id);
                  } else {
                    createTag.mutate(
                      { name: query.trim() },
                      { onSuccess: (tag) => addTag(tag.id) }
                    );
                  }
                  setQuery("");
                }
              }}
            />
            <div className="max-h-44 space-y-0.5 overflow-y-auto">
              {available.map((t) => (
                <button
                  key={t.id}
                  className="block w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-overlay"
                  onClick={() => addTag(t.id)}
                >
                  {t.name}
                </button>
              ))}
              {available.length === 0 && (
                <p className="px-2 py-1 text-xs text-ink-muted">
                  {query.trim() ? "Press Enter to create" : "No more tags"}
                </p>
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
