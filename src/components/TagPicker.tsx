import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useCreateTag, useTags, useUpdateItem } from "../lib/queries";
import type { Item } from "../lib/types";
import { Plus, X } from "./icons";

/** Inline chip list + popover to add/remove an item's tags. */
export function TagPicker({ item }: { item: Item }) {
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
