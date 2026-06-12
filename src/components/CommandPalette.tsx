import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { useUI } from "../App";
import { useCreateItem, useItems } from "../lib/queries";
import { toggleTheme } from "../lib/theme";
import type { View } from "../lib/types";
import { History, Layers, Note, Plus, Search, SquareCheck, Star, Sun, Trash } from "./icons";


const VIEWS: { key: View; label: string; icon: typeof Layers }[] = [
  { key: "today", label: "Go to Today", icon: SquareCheck },
  { key: "history", label: "Go to History", icon: History },
  { key: "all", label: "Go to All", icon: Layers },
  { key: "notes", label: "Go to Notes", icon: Note },
  { key: "starred", label: "Go to Starred", icon: Star },
  { key: "trash", label: "Go to Trash", icon: Trash },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const ui = useUI();
  const { data: items = [] } = useItems();
  const createItem = useCreateItem();

  const close = () => onOpenChange(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/35" />
        <Dialog.Content
          className="fixed left-1/2 top-[18%] z-50 w-[min(560px,92vw)] -translate-x-1/2 overflow-hidden rounded-lg border border-subtle bg-popover shadow-3"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Command label="Command palette" loop>
            <div className="flex items-center gap-2 border-b border-subtle px-3">
              <Search size={15} className="text-ink-muted" />
              <Command.Input
                autoFocus
                placeholder="Type a command, or search items by id / title…"
                className="h-11 w-full bg-transparent text-base outline-none placeholder:text-ink-muted"
              />
            </div>
            <Command.List className="max-h-[330px] overflow-y-auto p-1.5">
              <Command.Empty className="px-3 py-6 text-center text-sm text-ink-muted">
                No results.
              </Command.Empty>

              <Command.Group heading="Create" className="cmdk-group">
                <PaletteItem
                  icon={<Plus size={14} />}
                  onSelect={() => {
                    close();
                    createItem.mutate(
                      { type: "task", title: "", status: "today" },
                      { onSuccess: (it) => ui.openItem(it.id) }
                    );
                  }}
                >
                  New task
                </PaletteItem>
                <PaletteItem
                  icon={<Plus size={14} />}
                  onSelect={() => {
                    close();
                    createItem.mutate(
                      { type: "note", title: "" },
                      { onSuccess: (it) => ui.openItem(it.id) }
                    );
                  }}
                >
                  New note
                </PaletteItem>
                <PaletteItem
                  icon={<Plus size={14} />}
                  onSelect={() => {
                    close();
                    ui.setQuickOpen(true);
                  }}
                >
                  Quick capture (⌘/Ctrl-N)
                </PaletteItem>
              </Command.Group>

              <Command.Group heading="Navigate" className="cmdk-group">
                {VIEWS.map(({ key, label, icon: Icon }) => (
                  <PaletteItem
                    key={key}
                    icon={<Icon size={14} />}
                    onSelect={() => {
                      ui.setView(key);
                      close();
                    }}
                  >
                    {label}
                  </PaletteItem>
                ))}
                <PaletteItem
                  icon={<Sun size={14} />}
                  onSelect={() => {
                    toggleTheme();
                    close();
                  }}
                >
                  Toggle light / dark mode
                </PaletteItem>
              </Command.Group>

              <Command.Group heading="Jump to item" className="cmdk-group">
                {items.slice(0, 60).map((it) => (
                  <PaletteItem
                    key={it.id}
                    icon={it.status !== null ? <SquareCheck size={14} /> : <Note size={14} />}
                    value={`${it.id} ${it.title}`}
                    onSelect={() => {
                      ui.openItem(it.id);
                      close();
                    }}
                  >
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="shrink-0 font-mono text-xs text-ink-muted">{it.id}</span>
                      <span className="truncate">{it.title || "Untitled"}</span>
                    </span>
                  </PaletteItem>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PaletteItem({
  children,
  icon,
  onSelect,
  value,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onSelect: () => void;
  value?: string;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-ink-secondary data-[selected=true]:bg-overlay data-[selected=true]:text-ink"
    >
      <span className="text-ink-muted">{icon}</span>
      {children}
    </Command.Item>
  );
}
