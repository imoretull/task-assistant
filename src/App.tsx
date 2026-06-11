import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Sidebar } from "./components/Sidebar";
import { DatabaseSwitcher } from "./components/DatabaseSwitcher";
import { BoardView } from "./components/Board";
import { NotesGrid } from "./components/NotesGrid";
import { TrashView } from "./components/TrashView";
import { DetailModal } from "./components/DetailModal";
import { CommandPalette } from "./components/CommandPalette";
import { QuickCapture } from "./components/QuickCapture";
import { SelectionBar } from "./components/SelectionBar";
import { Moon, PanelLeft, Plus, Sun } from "./components/icons";
import { Tip } from "./components/ui";
import { useCreateItem, useItems } from "./lib/queries";
import { bucketOf, filterItems, sortBuckets, sortItems } from "./lib/filters";
import { getTheme, toggleTheme, type Theme } from "./lib/theme";
import type { SortKey, View } from "./lib/types";

interface UIState {
  view: View;
  setView: (v: View) => void;
  activeTagIds: number[];
  toggleTag: (id: number) => void;
  clearTags: () => void;
  tagMode: "and" | "or";
  setTagMode: (m: "and" | "or") => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  openItemId: string | null;
  openItem: (id: string | null) => void;
  selection: string[];
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  setPaletteOpen: (open: boolean) => void;
  setQuickOpen: (open: boolean) => void;
}

const UIContext = createContext<UIState | null>(null);

export function useUI(): UIState {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI outside provider");
  return ctx;
}

const VIEW_TITLES: Record<View, string> = {
  all: "All items",
  board: "Tasks",
  notes: "Notes",
  starred: "Starred",
  trash: "Trash",
};

export default function App() {
  const [view, setView] = useState<View>("board");
  const [activeTagIds, setActiveTagIds] = useState<number[]>([]);
  const [tagMode, setTagMode] = useState<"and" | "or">("and");
  const [sort, setSort] = useState<SortKey>("priority");
  // Bucket filter scoped to the active sort (e.g. only "High" when sorted by
  // priority). Cleared whenever the sort changes — buckets belong to a sort.
  const [sortFilter, setSortFilter] = useState<string[]>([]);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [theme, setThemeState] = useState<Theme>(getTheme);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => localStorage.getItem("tasknotes-sidebar") !== "closed"
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((open) => {
      localStorage.setItem("tasknotes-sidebar", open ? "closed" : "open");
      return !open;
    });
  }, []);

  const { data: items = [], isLoading } = useItems();
  const createItem = useCreateItem();

  // Switching databases resets transient UI that references the old store's
  // ids/tags (filters, selection, open modal).
  const onDatabaseSwitch = useCallback(() => {
    setActiveTagIds([]);
    setSelection([]);
    setOpenItemId(null);
    setSortFilter([]);
  }, []);

  const changeSort = useCallback((s: SortKey) => {
    setSort(s);
    setSortFilter([]);
  }, []);

  const toggleBucket = useCallback((label: string) => {
    setSortFilter((prev) =>
      prev.includes(label) ? prev.filter((b) => b !== label) : [...prev, label]
    );
  }, []);

  const toggleTag = useCallback((id: number) => {
    setActiveTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelection((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const ui = useMemo<UIState>(
    () => ({
      view,
      setView: (v) => {
        setView(v);
        setSelection([]);
      },
      activeTagIds,
      toggleTag,
      clearTags: () => setActiveTagIds([]),
      tagMode,
      setTagMode,
      sort,
      setSort: changeSort,
      openItemId,
      openItem: setOpenItemId,
      selection,
      toggleSelect,
      clearSelection: () => setSelection([]),
      setPaletteOpen,
      setQuickOpen,
    }),
    [view, activeTagIds, tagMode, sort, openItemId, selection, toggleTag, toggleSelect, changeSort]
  );

  // Global shortcuts: ⌘/Ctrl-K palette, ⌘/Ctrl-N quick capture, ⌘/Ctrl-Shift-N new task.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createItem.mutate(
          { type: "task", title: "New task", status: "todo" },
          { onSuccess: (item) => setOpenItemId(item.id) }
        );
      } else if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setQuickOpen(true);
      } else if (mod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [createItem, toggleSidebar]);

  // Items after tag/view filtering and sorting, before the bucket pills.
  const sorted = useMemo(
    () => sortItems(filterItems(items, { view, activeTagIds, tagMode, sort }), sort),
    [items, view, activeTagIds, tagMode, sort]
  );

  // Pills: only buckets that actually occur in the current items, with counts.
  const buckets = useMemo(() => {
    const order = sortBuckets(sort);
    if (!order || view === "trash") return null;
    const counts = new Map<string, number>();
    for (const it of sorted) {
      const b = bucketOf(it, sort)!;
      counts.set(b, (counts.get(b) ?? 0) + 1);
    }
    const present = order.filter((b) => counts.has(b));
    return present.length > 0 ? present.map((b) => ({ label: b, count: counts.get(b)! })) : null;
  }, [sorted, sort, view]);

  const visible = useMemo(
    () =>
      sortFilter.length === 0
        ? sorted
        : sorted.filter((it) => sortFilter.includes(bucketOf(it, sort)!)),
    [sorted, sortFilter, sort]
  );

  const newButton =
    view === "notes" ? (
      <button
        className="btn-primary"
        onClick={() =>
          createItem.mutate(
            { type: "note", title: "", tags: activeTagIds },
            { onSuccess: (item) => setOpenItemId(item.id) }
          )
        }
      >
        <Plus size={14} /> New note
      </button>
    ) : view !== "trash" ? (
      <button
        className="btn-primary"
        onClick={() =>
          createItem.mutate(
            { type: "task", title: "", status: "todo", tags: activeTagIds },
            { onSuccess: (item) => setOpenItemId(item.id) }
          )
        }
      >
        <Plus size={14} /> New task
      </button>
    ) : null;

  return (
    <UIContext.Provider value={ui}>
      <Tooltip.Provider>
        <div className="flex h-full">
          {sidebarOpen && <Sidebar />}
          <main className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-12 shrink-0 items-center gap-3 border-b border-subtle bg-canvas px-4">
              <Tip label={`${sidebarOpen ? "Hide" : "Show"} sidebar (⌘/Ctrl-B)`}>
                <button
                  className={`icon-btn ${sidebarOpen ? "" : "text-accent"}`}
                  aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                  aria-pressed={!sidebarOpen}
                  onClick={toggleSidebar}
                >
                  <PanelLeft size={15} />
                </button>
              </Tip>
              <DatabaseSwitcher onSwitch={onDatabaseSwitch} />
              <span className="h-5 w-px bg-[var(--border-subtle)]" />
              <h1 className="text-md font-semibold">{VIEW_TITLES[view]}</h1>
              <span className="text-sm text-ink-muted">{visible.length}</span>
              <div className="ml-auto flex min-w-0 items-center gap-2">
                {buckets && (
                  <div
                    className="flex max-w-[44vw] items-center gap-1 overflow-x-auto"
                    role="group"
                    aria-label="Filter by sort group"
                  >
                    {buckets.map(({ label, count }) => {
                      const active = sortFilter.includes(label);
                      return (
                        <button
                          key={label}
                          aria-pressed={active}
                          onClick={() => toggleBucket(label)}
                          className={`chip shrink-0 cursor-pointer transition-colors duration-fast hover:border-strong ${
                            active ? "border-[var(--accent)] bg-accent-soft font-medium text-ink" : ""
                          }`}
                        >
                          {label}
                          <span className="text-ink-muted">{count}</span>
                        </button>
                      );
                    })}
                    {sortFilter.length > 0 && (
                      <button
                        className="shrink-0 rounded-sm px-1.5 py-0.5 text-xs text-ink-muted hover:text-ink"
                        onClick={() => setSortFilter([])}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
                {view !== "trash" && (
                  <label className="flex items-center gap-1.5 text-sm text-ink-muted">
                    Sort
                    <select
                      className="rounded-sm border border-subtle bg-raised px-1.5 py-1 text-sm text-ink"
                      value={sort}
                      onChange={(e) => changeSort(e.target.value as SortKey)}
                    >
                      <option value="manual">Manual</option>
                      <option value="priority">Priority</option>
                      <option value="dueDate">Due date</option>
                      <option value="difficulty">Difficulty</option>
                      <option value="createdAt">Created</option>
                    </select>
                  </label>
                )}
                <Tip label={theme === "dark" ? "Light mode" : "Dark mode"}>
                  <button
                    className="icon-btn"
                    aria-label="Toggle theme"
                    onClick={() => setThemeState(toggleTheme())}
                  >
                    {theme === "dark" ? <Sun /> : <Moon />}
                  </button>
                </Tip>
                {newButton}
              </div>
            </header>
            <div className="min-h-0 flex-1 overflow-auto">
              {view === "board" ? (
                <BoardView items={visible} loading={isLoading} />
              ) : view === "trash" ? (
                <TrashView />
              ) : (
                <NotesGrid items={visible} loading={isLoading} />
              )}
            </div>
          </main>
        </div>
        <DetailModal />
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        <QuickCapture open={quickOpen} onOpenChange={setQuickOpen} />
        <SelectionBar />
      </Tooltip.Provider>
    </UIContext.Provider>
  );
}
