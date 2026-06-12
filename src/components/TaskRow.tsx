import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useUI } from "../App";
import { useDeleteItem, useTags, useUpdateItem } from "../lib/queries";
import { carriedDays } from "../lib/filters";
import type { Item, Tag } from "../lib/types";
import { ArrowLeft, ArrowRight, Check, Note, Trash } from "./icons";
import { tagDotColor, Tip } from "./ui";

/**
 * One task row, shared by Today, the Backlog slide-out, and History.
 * Checkbox completes, clicking the title opens the notes panel, and the move
 * button hops the task between Today and Backlog in a single press.
 *
 * Task text is left-aligned; the project label sits on the right edge as a
 * dropdown fed by the sidebar's Projects section — new project tags appear
 * in it automatically.
 */
export function TaskRow({
  item,
  variant,
  dragHandle,
  focused = false,
}: {
  item: Item;
  variant: "today" | "backlog" | "history";
  /** When sortable, the grip handle to render at the row's left edge. */
  dragHandle?: React.ReactNode;
  /** Keyboard-focused row: reveals the action cluster and rings the row, so
   *  the list is fully operable from the keyboard (see TodayView). */
  focused?: boolean;
}) {
  const ui = useUI();
  const { data: tags = [] } = useTags();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const remove = () => {
    deleteItem.mutate(item.id);
    if (ui.openItemId === item.id) ui.openItem(null);
  };

  const done = item.status === "done";
  // Strikethrough/dim only in Today (just-finished feedback); History reads
  // as a clean archive.
  const struck = done && variant === "today";
  const carried = variant === "today" && !done ? carriedDays(item) : 0;
  const projects = tags.filter((t) => t.kind === "project");
  const project = projects.find((t) => item.tags.includes(t.id));
  const hasNotes = item.body.trim().length > 0;

  // Swap the project label in place: keep the item's non-project tags, hold
  // at most one project.
  const setProject = (tagId: number | null) => {
    const rest = item.tags.filter((id) => !projects.some((p) => p.id === id));
    updateItem.mutate({ id: item.id, tags: tagId === null ? rest : [...rest, tagId] });
  };

  return (
    <div
      data-focused={focused || undefined}
      className={`group relative flex items-center gap-2.5 rounded-md border px-3 py-2 transition-colors duration-fast hover:border-strong ${
        focused ? "border-[var(--accent)] ring-1 ring-[var(--accent)]" : "border-subtle"
      } ${carried > 0 ? "bg-accent-soft" : "bg-raised"} ${struck ? "opacity-55" : ""}`}
    >
      {dragHandle}
      {variant === "today" && (
        <button
          aria-label={done ? "Mark not done" : "Mark done"}
          onClick={() => updateItem.mutate({ id: item.id, status: done ? "today" : "done" })}
          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-fast ${
            done
              ? "border-[var(--status-done)] bg-[var(--status-done)] text-white"
              : "border-strong hover:border-[var(--accent)]"
          }`}
        >
          {done && <Check size={12} />}
        </button>
      )}
      {variant === "history" && (
        <Check size={14} className="shrink-0 text-[var(--status-done)]" aria-hidden />
      )}

      <button
        className="min-w-0 flex-1 truncate text-left text-base"
        onClick={() => ui.openItem(item.id)}
        title={item.title || "Open notes"}
      >
        <span className={struck ? "line-through" : ""}>
          {item.title || <span className="text-ink-muted">Untitled</span>}
        </span>
      </button>

      {/* Resting metadata: note dot, age badge, project chip. Compact, always
          visible. The hover actions overlay this cluster (see below) so they
          don't steal width from the title at rest. */}
      <div className="flex shrink-0 items-center gap-2 transition-opacity duration-fast group-hover:opacity-0 group-data-[focused]:opacity-0">
        {hasNotes && <Note size={12} className="text-ink-muted" aria-label="Has notes" />}
        {carried > 0 && (
          <span
            className="rounded-full px-1 text-[11px] font-medium tabular-nums text-[var(--priority-high)]"
            title={`Carried over for ${carried} day${carried === 1 ? "" : "s"}`}
          >
            {carried}d
          </span>
        )}
        {project ? (
          <span className="chip">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: tagDotColor(project.color) }}
            />
            <span className="max-w-[110px] truncate">{project.name}</span>
          </span>
        ) : (
          variant !== "history" && <span className="w-2" aria-hidden />
        )}
      </div>

      {/* Hover/focus action cluster — overlaid on the right edge so it costs no
          title width at rest. Project menu lives here too (still clickable). */}
      {variant !== "history" && (
        <div className="absolute right-2 flex items-center gap-1 rounded-md bg-raised pl-2 opacity-0 shadow-1 transition-opacity duration-fast focus-within:opacity-100 group-hover:opacity-100 group-data-[focused]:opacity-100">
          <ProjectMenu projects={projects} current={project} onSelect={setProject} />
          {variant === "today" && !done && (
            <button
              className="btn-ghost px-1.5 py-0.5 text-xs"
              onClick={() => updateItem.mutate({ id: item.id, status: "backlog" })}
            >
              <ArrowLeft size={11} /> Backlog
            </button>
          )}
          {variant === "backlog" && (
            <button
              className="btn-ghost px-1.5 py-0.5 text-xs text-accent"
              onClick={() => updateItem.mutate({ id: item.id, status: "today" })}
            >
              <ArrowRight size={11} /> Today
            </button>
          )}
          <Tip label="Delete (to Trash)">
            <button
              aria-label="Delete task"
              className="icon-btn h-6 w-6 text-ink-muted hover:text-[var(--priority-urgent)]"
              onClick={remove}
            >
              <Trash size={13} />
            </button>
          </Tip>
        </div>
      )}
    </div>
  );
}

/** Right-aligned project label as a dropdown of the sidebar's project tags.
 *  Unlabeled rows show a hover-revealed "+ label" trigger. */
function ProjectMenu({
  projects,
  current,
  onSelect,
}: {
  projects: Tag[];
  current: Tag | undefined;
  onSelect: (tagId: number | null) => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={current ? `Project: ${current.name}` : "Set project label"}
          className={`chip shrink-0 cursor-pointer transition-all duration-fast hover:border-strong ${
            current
              ? ""
              : "opacity-0 focus-visible:opacity-100 group-hover:opacity-100 group-data-[focused]:opacity-100 data-[state=open]:opacity-100"
          }`}
        >
          {current ? (
            <>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: tagDotColor(current.color) }}
              />
              <span className="max-w-[120px] truncate">{current.name}</span>
            </>
          ) : (
            <span className="text-ink-muted">+ label</span>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[170px] rounded-md border border-subtle bg-popover p-1 shadow-2"
        >
          {projects.map((p) => (
            <DropdownMenu.Item
              key={p.id}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-overlay"
              onSelect={() => onSelect(p.id)}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: tagDotColor(p.color) }}
              />
              <span className="truncate">{p.name}</span>
              {p.id === current?.id && <Check size={13} className="ml-auto shrink-0 text-accent" />}
            </DropdownMenu.Item>
          ))}
          {projects.length === 0 && (
            <p className="px-2 py-1.5 text-xs text-ink-muted">
              No project labels yet — add one under Projects in the sidebar.
            </p>
          )}
          {current && (
            <>
              <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-subtle)]" />
              <DropdownMenu.Item
                className="cursor-pointer rounded-sm px-2 py-1.5 text-sm text-ink-muted outline-none data-[highlighted]:bg-overlay"
                onSelect={() => onSelect(null)}
              >
                Remove label
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
