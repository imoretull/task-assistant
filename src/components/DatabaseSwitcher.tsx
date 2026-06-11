import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useActiveDbId, setActiveDbId } from "../lib/database";
import { useDatabases } from "../lib/queries";
import { Check, ChevronDown, Layers } from "./icons";

/**
 * Header dropdown that switches the active database. Each database is a
 * separate SQLite file on the server; switching changes the X-Database header
 * sent on every request, so the two stores never bleed into each other.
 */
export function DatabaseSwitcher({ onSwitch }: { onSwitch: () => void }) {
  const { data: databases = [] } = useDatabases();
  const activeId = useActiveDbId();
  const active = databases.find((d) => d.id === activeId);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-2 rounded-sm border border-subtle bg-raised px-2.5 py-1.5 text-sm transition-colors duration-fast hover:border-strong"
          aria-label="Switch database"
        >
          <Layers size={14} className="text-accent" />
          <span className="max-w-[180px] truncate font-medium">
            {active?.name ?? "Database"}
          </span>
          <ChevronDown size={13} className="text-ink-muted" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={5}
          className="z-50 w-72 rounded-md border border-subtle bg-popover p-1 shadow-3"
        >
          <DropdownMenu.Label className="px-2.5 pb-1 pt-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">
            Databases
          </DropdownMenu.Label>
          {databases.map((d) => {
            const isActive = d.id === activeId;
            return (
              <DropdownMenu.Item
                key={d.id}
                className="flex cursor-pointer items-start gap-2 rounded-sm px-2.5 py-2 outline-none data-[highlighted]:bg-overlay"
                onSelect={() => {
                  if (!isActive) {
                    setActiveDbId(d.id);
                    onSwitch();
                  }
                }}
              >
                <span className="mt-0.5 w-3.5 shrink-0 text-accent">
                  {isActive ? <Check size={14} /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{d.name}</span>
                  <span className="block truncate text-xs text-ink-muted">{d.description}</span>
                </span>
              </DropdownMenu.Item>
            );
          })}
          <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-subtle)]" />
          <p className="px-2.5 pb-1.5 pt-0.5 text-xs text-ink-muted">
            Each database is a separate local file.
          </p>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
