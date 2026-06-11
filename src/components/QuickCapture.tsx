import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useCreateTag, useCreateItem, useTags } from "../lib/queries";
import { Inbox } from "./icons";

/**
 * One-shortcut capture (⌘/Ctrl-N): first line becomes the title, the rest the
 * body. Saved as a note tagged `inbox` for later triage.
 */
export function QuickCapture({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [text, setText] = useState("");
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();
  const createItem = useCreateItem();

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      onOpenChange(false);
      return;
    }
    const [first, ...rest] = trimmed.split("\n");
    const payload = { type: "note" as const, title: first.trim(), body: rest.join("\n").trim() };

    const inbox = tags.find((t) => t.name === "inbox");
    if (inbox) {
      createItem.mutate({ ...payload, tags: [inbox.id] });
    } else {
      createTag.mutate(
        { name: "inbox" },
        { onSuccess: (tag) => createItem.mutate({ ...payload, tags: [tag.id] }) }
      );
    }
    setText("");
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/25" />
        <Dialog.Content
          className="fixed left-1/2 top-[22%] z-50 w-[min(520px,92vw)] -translate-x-1/2 overflow-hidden rounded-lg border border-subtle bg-popover shadow-3"
          aria-describedby={undefined}
        >
          <Dialog.Title className="flex items-center gap-2 border-b border-subtle px-4 py-2.5 text-sm font-medium text-ink-secondary">
            <Inbox size={14} className="text-accent" /> Quick capture → inbox
          </Dialog.Title>
          <textarea
            autoFocus
            rows={4}
            className="w-full resize-none bg-transparent p-4 text-base outline-none placeholder:text-ink-muted"
            placeholder={"Thought, task, meeting note…\nFirst line becomes the title. Enter to save, Shift-Enter for a new line."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                save();
              }
            }}
          />
          <footer className="flex items-center justify-end gap-2 border-t border-subtle px-4 py-2">
            <span className="mr-auto text-xs text-ink-muted">Tagged #inbox — triage later</span>
            <button className="btn-ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save}>
              Capture
            </button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
