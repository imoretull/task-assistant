import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Dialog from "@radix-ui/react-dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUI } from "../App";
import { useCreateItem, usePrompts, useRunAssistant } from "../lib/queries";
import type { AssistantResponse } from "../lib/types";
import { Copy, Plus, Sparkle, X } from "./icons";

/**
 * Appears when items are multi-selected (⌘/Ctrl-click on cards).
 * Runs multi-item prompts (e.g. Consolidate) over the selection.
 */
export function SelectionBar() {
  const ui = useUI();
  const { data: prompts = [] } = usePrompts();
  const run = useRunAssistant();
  const createItem = useCreateItem();
  const [result, setResult] = useState<AssistantResponse | null>(null);

  if (ui.selection.length === 0 && !result) return null;

  const multiPrompts = prompts.filter((p) => p.multi || ui.selection.length === 1);

  return (
    <>
      {ui.selection.length > 0 && (
        <div className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-subtle bg-popover py-2 pl-4 pr-2 shadow-3">
          <span className="text-sm font-medium">
            {ui.selection.length} selected
          </span>
          <span className="font-mono text-xs text-ink-muted">
            {ui.selection.slice(0, 4).join(", ")}
            {ui.selection.length > 4 ? "…" : ""}
          </span>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="btn-primary">
                <Sparkle size={13} /> Run prompt
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                sideOffset={8}
                className="z-40 w-64 rounded-md border border-subtle bg-popover p-1 shadow-2"
              >
                {multiPrompts.map((p) => (
                  <button
                    key={p.id}
                    className="block w-full rounded-sm px-2.5 py-2 text-left text-sm hover:bg-overlay"
                    onClick={() =>
                      run.mutate(
                        { promptId: p.id, itemIds: ui.selection },
                        { onSuccess: setResult }
                      )
                    }
                  >
                    {p.name}
                    <span className="block text-xs text-ink-muted">{p.description}</span>
                  </button>
                ))}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <button className="icon-btn" aria-label="Clear selection" onClick={ui.clearSelection}>
            <X size={14} />
          </button>
        </div>
      )}

      {run.isPending && (
        <div className="fixed bottom-20 left-1/2 z-30 -translate-x-1/2 rounded-md border border-subtle bg-popover px-4 py-2 text-sm text-ink-muted shadow-2">
          Running prompt…
        </div>
      )}

      <Dialog.Root open={result !== null} onOpenChange={(o) => !o && setResult(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/35" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[80vh] w-[min(640px,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-subtle bg-popover shadow-3"
            aria-describedby={undefined}
          >
            <Dialog.Title className="flex items-center gap-2 border-b border-subtle px-4 py-3 text-sm font-medium">
              <Sparkle size={14} className="text-accent" />
              Assistant result
              <span className="ml-auto text-xs font-normal text-ink-muted">
                {result?.itemIds.join(", ")} · {result?.provider}
              </span>
            </Dialog.Title>
            <div className="prose-tn min-h-0 flex-1 overflow-y-auto p-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result?.result ?? ""}</ReactMarkdown>
            </div>
            <footer className="flex gap-2 border-t border-subtle px-4 py-3">
              <button
                className="btn-ghost"
                onClick={() => {
                  if (result) {
                    createItem.mutate({
                      type: "note",
                      title: "Assistant: consolidated result",
                      body: result.result,
                    });
                  }
                  setResult(null);
                  ui.clearSelection();
                }}
              >
                <Plus size={13} /> Save as new note
              </button>
              <button
                className="btn-ghost"
                onClick={() => result && navigator.clipboard.writeText(result.result)}
              >
                <Copy size={13} /> Copy
              </button>
              <button className="btn-ghost ml-auto" onClick={() => setResult(null)}>
                Close
              </button>
            </footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
