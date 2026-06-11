import { useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useUI } from "../App";
import { useCreateTag, useDeleteTag, useItems, useTags, useUpdateTag } from "../lib/queries";
import { tagCounts } from "../lib/filters";
import type { Tag, TagKind, View } from "../lib/types";
import { Board, Dots, Inbox, Layers, Note, Plus, Star, Trash, X } from "./icons";
import { TAG_COLORS, tagDotColor } from "./ui";

const NAV: { key: View; label: string; icon: typeof Board }[] = [
  { key: "all", label: "All", icon: Layers },
  { key: "board", label: "Tasks", icon: Board },
  { key: "notes", label: "Notes", icon: Note },
  { key: "starred", label: "Starred", icon: Star },
  { key: "trash", label: "Trash", icon: Trash },
];

// Sidebar tag groups, in display order: projects first, then people, then the rest.
const SECTIONS: { kind: TagKind; label: string; addHint: string }[] = [
  { kind: "project", label: "Projects", addHint: "Project name…" },
  { kind: "person", label: "People", addHint: "Person name…" },
  { kind: "tag", label: "Tags", addHint: "Tag name…" },
];

export function Sidebar() {
  const ui = useUI();
  const { data: items = [] } = useItems();
  const { data: tags = [] } = useTags();

  const counts = useMemo(() => tagCounts(items), [items]);
  const navCounts: Record<View, number> = useMemo(
    () => ({
      all: items.length,
      board: items.filter((i) => i.status !== null).length,
      notes: items.filter((i) => i.type === "note" && i.status === null).length,
      starred: items.filter((i) => i.starred).length,
      trash: 0,
    }),
    [items]
  );

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-subtle bg-canvas">
      <div className="flex h-12 items-center gap-2 px-4">
        <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-accent text-xs font-semibold text-accent-fg">
          T
        </span>
        <span className="text-base font-semibold">TaskNotes</span>
      </div>

      <nav className="px-2 pb-2">
        {NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => ui.setView(key)}
            className={`flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm transition-colors duration-fast ${
              ui.view === key
                ? "bg-accent-soft font-medium text-ink"
                : "text-ink-secondary hover:bg-overlay hover:text-ink"
            }`}
          >
            <Icon size={15} className={ui.view === key ? "text-accent" : "text-ink-muted"} />
            {label}
            {key !== "trash" && (
              <span className="ml-auto text-xs text-ink-muted">{navCounts[key]}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Active-filter controls, shown once any tag is selected in any section. */}
      {ui.activeTagIds.length > 0 && (
        <div className="mx-2 mt-1 flex items-center justify-between rounded-sm bg-accent-soft px-2 py-1">
          <span className="text-xs text-ink-secondary">
            {ui.activeTagIds.length} filter{ui.activeTagIds.length === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              className="rounded-sm px-1.5 py-0.5 text-xs font-medium text-ink-secondary hover:text-ink"
              onClick={() => ui.setTagMode(ui.tagMode === "and" ? "or" : "and")}
              title="Toggle AND/OR tag matching"
            >
              {ui.tagMode.toUpperCase()}
            </button>
            <button
              className="rounded-sm px-1.5 py-0.5 text-xs text-ink-secondary hover:text-ink"
              onClick={ui.clearTags}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto pb-2">
        {SECTIONS.map((section) => (
          <TagSection
            key={section.kind}
            section={section}
            tags={tags.filter((t) => t.kind === section.kind)}
            counts={counts}
          />
        ))}
      </div>

      <footer className="border-t border-subtle px-4 py-2 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <Inbox size={12} /> ⌘/Ctrl-N capture · ⌘/Ctrl-K palette
        </span>
      </footer>
    </aside>
  );
}

function TagSection({
  section,
  tags,
  counts,
}: {
  section: { kind: TagKind; label: string; addHint: string };
  tags: Tag[];
  counts: Map<number, number>;
}) {
  const createTag = useCreateTag();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const submitNewTag = () => {
    const name = newName.trim();
    if (name) createTag.mutate({ name, kind: section.kind });
    setNewName("");
    setAdding(false);
  };

  return (
    <section aria-label={section.label}>
      <div className="mt-3 flex items-center justify-between px-4 pb-1">
        <span className="label">{section.label}</span>
        <button
          className="icon-btn h-6 w-6"
          aria-label={`Add ${section.label.toLowerCase()}`}
          onClick={() => setAdding(true)}
        >
          <Plus size={13} />
        </button>
      </div>
      <div className="px-2">
        {adding && (
          <form
            className="px-2 py-1"
            onSubmit={(e) => {
              e.preventDefault();
              submitNewTag();
            }}
          >
            <input
              autoFocus
              className="input py-1 text-sm"
              placeholder={section.addHint}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={submitNewTag}
              onKeyDown={(e) => e.key === "Escape" && setAdding(false)}
            />
          </form>
        )}
        {tags.map((tag) => (
          <TagRow key={tag.id} tag={tag} count={counts.get(tag.id) ?? 0} />
        ))}
        {tags.length === 0 && !adding && (
          <p className="px-2 py-1 text-xs text-ink-muted">None yet — add with +.</p>
        )}
      </div>
    </section>
  );
}

function TagRow({ tag, count }: { tag: Tag; count: number }) {
  const ui = useUI();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(tag.name);
  const active = ui.activeTagIds.includes(tag.id);

  const submitRename = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== tag.name) updateTag.mutate({ id: tag.id, name: trimmed });
    setRenaming(false);
  };

  if (renaming) {
    return (
      <form
        className="px-2 py-0.5"
        onSubmit={(e) => {
          e.preventDefault();
          submitRename();
        }}
      >
        <input
          autoFocus
          className="input py-1 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={submitRename}
          onKeyDown={(e) => e.key === "Escape" && setRenaming(false)}
        />
      </form>
    );
  }

  return (
    <div
      className={`group flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors duration-fast ${
        active ? "bg-accent-soft text-ink" : "text-ink-secondary hover:bg-overlay hover:text-ink"
      }`}
    >
      <button
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
        onClick={() => ui.toggleTag(tag.id)}
        aria-pressed={active}
      >
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: tagDotColor(tag.color) }} />
        <span className="truncate">{tag.name}</span>
        <span className="ml-auto text-xs text-ink-muted">{count}</span>
      </button>
      {active && <X size={11} className="shrink-0 text-ink-muted" onClick={() => ui.toggleTag(tag.id)} />}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="icon-btn h-5 w-5 opacity-0 transition-opacity duration-fast focus-visible:opacity-100 group-hover:opacity-100"
            aria-label={`Tag options for ${tag.name}`}
          >
            <Dots size={13} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={4}
            className="z-50 min-w-[170px] rounded-md border border-subtle bg-popover p-1 shadow-2"
          >
            <DropdownMenu.Item
              className="cursor-pointer rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-overlay"
              onSelect={() => {
                setName(tag.name);
                setRenaming(true);
              }}
            >
              Rename
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-subtle)]" />
            {SECTIONS.filter((s) => s.kind !== tag.kind).map((s) => (
              <DropdownMenu.Item
                key={s.kind}
                className="cursor-pointer rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-overlay"
                onSelect={() => updateTag.mutate({ id: tag.id, kind: s.kind })}
              >
                Move to {s.label}
              </DropdownMenu.Item>
            ))}
            <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-subtle)]" />
            <div className="flex gap-1 px-2 py-1.5">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  aria-label={`Color ${c}`}
                  className={`h-4 w-4 rounded-full border ${tag.color === c ? "border-[var(--text-primary)]" : "border-transparent"}`}
                  style={{ background: tagDotColor(c) }}
                  onClick={() => updateTag.mutate({ id: tag.id, color: c })}
                />
              ))}
            </div>
            <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-subtle)]" />
            <DropdownMenu.Item
              className="cursor-pointer rounded-sm px-2 py-1.5 text-sm text-[var(--priority-urgent)] outline-none data-[highlighted]:bg-overlay"
              onSelect={() => deleteTag.mutate(tag.id)}
            >
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
