import { useEffect, useRef, useState } from "react";
import { EditorContent, Extension, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Markdown } from "tiptap-markdown";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";
import {
  useCreateItem,
  useCreatePin,
  useDeletePin,
  usePins,
  useUpdatePin,
} from "../lib/queries";
import type { Item, Pin as PinType } from "../lib/types";
import { Pin, SquareCheck } from "./icons";

/** Block types that can carry a pin. List/task items take priority over the
 *  paragraphs nested inside them so the whole row is highlighted. */
const PINNABLE = new Set([
  "paragraph",
  "heading",
  "listItem",
  "taskItem",
  "blockquote",
  "codeBlock",
]);

/** Invisible per-block attribute holding the pin id. Never serialized to
 *  markdown — pins re-anchor by text match when an item is reopened. The
 *  highlight is painted with node decorations rather than renderHTML because
 *  node views (task items) don't re-render attribute changes in place. */
const PinAttr = Extension.create({
  name: "pinAttr",
  addGlobalAttributes() {
    return [
      {
        types: [...PINNABLE],
        attributes: {
          pinId: { default: null, keepOnSplit: false, rendered: false },
        },
      },
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("pinHighlight"),
        props: {
          decorations(state) {
            const decos: Decoration[] = [];
            state.doc.descendants((node, pos) => {
              if (node.attrs?.pinId != null) {
                decos.push(
                  Decoration.node(pos, pos + node.nodeSize, { class: "pinned-block" })
                );
              }
              return true;
            });
            return DecorationSet.create(state.doc, decos);
          },
        },
      }),
    ];
  },
});

/** tiptap-markdown only marks bullet/ordered lists as tight; without this,
 *  task lists serialize with a blank line between every checkbox. */
const TaskListTight = Extension.create({
  name: "taskListTight",
  addGlobalAttributes() {
    return [
      {
        types: ["taskList"],
        attributes: { tight: { default: true, rendered: false } },
      },
    ];
  },
});

interface HoverInfo {
  /** Pos before the pinnable block (list/task item or top-level block). */
  pinPos: number;
  pinText: string;
  pinId: number | null;
  /** Trimmed text of the deepest textblock under the cursor — task title source. */
  lineText: string;
  top: number;
}

function resolveHover(view: EditorView, pos: number): Omit<HoverInfo, "top"> | null {
  const $pos = view.state.doc.resolve(pos);
  if ($pos.depth === 0) return null;

  let pinDepth = 1;
  for (let d = $pos.depth; d >= 1; d--) {
    const name = $pos.node(d).type.name;
    if (name === "taskItem" || name === "listItem") {
      pinDepth = d;
      break;
    }
  }
  const pinNode = $pos.node(pinDepth);
  if (!PINNABLE.has(pinNode.type.name)) return null;

  return {
    pinPos: $pos.before(pinDepth),
    pinText: pinNode.textContent.trim(),
    pinId: (pinNode.attrs.pinId as number | null) ?? null,
    lineText: $pos.parent.isTextblock ? $pos.parent.textContent.trim() : "",
  };
}

/** First block matching `text` exactly (list/task items before their inner
 *  paragraphs, doc order otherwise). */
function findBlockByText(
  doc: PMNode,
  text: string,
  pred: (node: PMNode) => boolean
): { node: PMNode; pos: number } | null {
  let found: { node: PMNode; pos: number } | null = null;
  doc.descendants((node, pos) => {
    if (found) return false;
    if (PINNABLE.has(node.type.name) && node.textContent.trim() === text && pred(node)) {
      found = { node, pos };
      return false;
    }
    return true;
  });
  return found;
}

export function RichTextEditor({
  item,
  value,
  onChange,
  placeholder = "Write something…",
}: {
  item: Item;
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}) {
  const { data: allPins = [] } = usePins();
  const itemPins = allPins.filter((p) => p.itemId === item.id);
  const createPin = useCreatePin();
  const updatePin = useUpdatePin();
  const deletePin = useDeletePin();
  const createItem = useCreateItem();

  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [taskFlash, setTaskFlash] = useState<string | null>(null);

  const lastEmitted = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  // Pin ids currently anchored to a block in the open document. Only anchored
  // pins are synced/deleted on edit — unmatched ones are left untouched.
  const anchoredIds = useRef(new Set<number>());
  const pinsRef = useRef<PinType[]>(itemPins);
  pinsRef.current = itemPins;
  const syncTimer = useRef<ReturnType<typeof setTimeout>>();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder }),
      Markdown.configure({
        html: false,
        linkify: true,
        tightLists: true,
        transformPastedText: true,
      }),
      PinAttr,
      TaskListTight,
    ],
    content: value,
    editorProps: {
      attributes: { class: "prose-tn rte-content" },
    },
    onUpdate: ({ editor: ed }) => {
      const md = ed.storage.markdown.getMarkdown() as string;
      if (md !== lastEmitted.current) {
        lastEmitted.current = md;
        onChangeRef.current(md);
      }
      clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => syncPins(ed), 600);
    },
  });

  /** Push edits of pinned blocks back to the pins table; a deleted block unpins. */
  const syncPins = (ed: Editor) => {
    if (ed.isDestroyed) return;
    const current = new Map<number, string>();
    ed.state.doc.descendants((node) => {
      const pid = node.attrs?.pinId as number | null | undefined;
      if (pid != null && !current.has(pid)) current.set(pid, node.textContent.trim());
    });
    for (const pin of pinsRef.current) {
      if (!anchoredIds.current.has(pin.id)) continue;
      const text = current.get(pin.id);
      if (text === undefined) {
        anchoredIds.current.delete(pin.id);
        deletePin.mutate(pin.id);
      } else if (text && text !== pin.content) {
        updatePin.mutate({ id: pin.id, content: text });
      }
    }
  };

  /** Anchor saved pins onto blocks by text match; clear attrs for pins that no
   *  longer exist (e.g. unpinned from the Pinned view). */
  const reconcilePins = (ed: Editor, pins: PinType[]) => {
    if (ed.isDestroyed) return;
    const validIds = new Set(pins.map((p) => p.id));
    const seen = new Set<number>();
    const tr = ed.state.tr;
    let changed = false;

    ed.state.doc.descendants((node, pos) => {
      const pid = node.attrs?.pinId as number | null | undefined;
      if (pid == null) return true;
      if (!validIds.has(pid) || seen.has(pid)) {
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, pinId: null });
        changed = true;
      } else {
        seen.add(pid);
      }
      return true;
    });

    for (const pin of pins) {
      if (seen.has(pin.id)) continue;
      const match = findBlockByText(
        tr.doc,
        pin.content,
        (n) => (n.attrs?.pinId ?? null) === null
      );
      if (match) {
        tr.setNodeMarkup(match.pos, undefined, { ...match.node.attrs, pinId: pin.id });
        seen.add(pin.id);
        changed = true;
      }
    }

    anchoredIds.current = seen;
    if (changed) {
      tr.setMeta("addToHistory", false);
      ed.view.dispatch(tr);
    }
  };

  // External body replacement (assistant accept) → reload editor content.
  useEffect(() => {
    if (!editor || value === lastEmitted.current) return;
    lastEmitted.current = value;
    editor.commands.setContent(value, false);
    reconcilePins(editor, pinsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  // Re-anchor whenever the pin set changes (initial load, pin/unpin anywhere).
  const pinsFingerprint = itemPins.map((p) => `${p.id}:${p.content}`).join("\n");
  useEffect(() => {
    if (editor) reconcilePins(editor, pinsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, pinsFingerprint]);

  useEffect(() => () => clearTimeout(syncTimer.current), []);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!editor) return;
    const found = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
    if (!found) return setHover(null);
    const info = resolveHover(editor.view, found.pos);
    if (!info) return setHover(null);
    const dom = editor.view.nodeDOM(info.pinPos) as HTMLElement | null;
    const wrap = wrapRef.current;
    if (!dom?.getBoundingClientRect || !wrap) return setHover(null);
    const top = dom.getBoundingClientRect().top - wrap.getBoundingClientRect().top;
    setHover({ ...info, top });
  };

  const togglePin = () => {
    if (!editor || !hover || !hover.pinText) return;
    if (hover.pinId != null) {
      const pinId = hover.pinId;
      anchoredIds.current.delete(pinId);
      const tr = editor.state.tr;
      editor.state.doc.descendants((node, pos) => {
        if (node.attrs?.pinId === pinId) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, pinId: null });
          return false;
        }
        return true;
      });
      tr.setMeta("addToHistory", false);
      editor.view.dispatch(tr);
      deletePin.mutate(pinId);
      setHover({ ...hover, pinId: null });
    } else {
      createPin.mutate({ itemId: item.id, content: hover.pinText });
      // reconcilePins anchors it once the pins query refreshes.
    }
  };

  const makeTask = () => {
    if (!editor || !hover) return;
    const text = hover.lineText || hover.pinText;
    if (!text) return;
    createItem.mutate(
      { type: "task", title: text.slice(0, 200), status: "todo", tags: item.tags },
      {
        onSuccess: (task) => {
          // Stamp the source line with the new task's id so the link is visible.
          const match = findBlockByText(editor.state.doc, text, (n) => n.isTextblock);
          if (match) {
            editor
              .chain()
              .insertContentAt(match.pos + match.node.nodeSize - 1, {
                type: "text",
                text: ` → ${task.id}`,
              })
              .run();
          }
          setTaskFlash(task.id);
          setTimeout(() => setTaskFlash(null), 2000);
        },
      }
    );
  };

  if (!editor) return null;

  const toolBtn = (active: boolean) =>
    `rounded-sm px-1.5 py-0.5 text-sm transition-colors duration-fast hover:bg-overlay hover:text-ink ${
      active ? "bg-overlay text-ink" : "text-ink-muted"
    }`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-1.5 flex items-center gap-0.5">
        <button
          className={toolBtn(editor.isActive("bold"))}
          title="Bold (⌘/Ctrl-B)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </button>
        <button
          className={toolBtn(editor.isActive("italic"))}
          title="Italic (⌘/Ctrl-I)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </button>
        <button
          className={toolBtn(editor.isActive("code"))}
          title="Code"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <span className="font-mono">{"<>"}</span>
        </button>
        <button
          className={toolBtn(editor.isActive("heading", { level: 2 }))}
          title="Heading"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H
        </button>
        <button
          className={toolBtn(editor.isActive("bulletList"))}
          title="Bulleted list"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •&nbsp;list
        </button>
        <button
          className={toolBtn(editor.isActive("orderedList"))}
          title="Numbered list"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.&nbsp;list
        </button>
        <button
          className={toolBtn(editor.isActive("taskList"))}
          title="Todo checklist"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          ☐&nbsp;todo
        </button>
        <button
          className={toolBtn(editor.isActive("blockquote"))}
          title="Quote"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          &ldquo;
        </button>
        <span className="ml-auto text-xs text-ink-muted">
          {taskFlash
            ? `Task ${taskFlash} created`
            : "Hover a line to pin it or turn it into a task"}
        </span>
      </div>

      <div
        ref={wrapRef}
        className="relative min-h-[220px] flex-1 rounded-sm border border-subtle bg-raised"
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        <EditorContent editor={editor} className="rte-scroll h-full" />
        {hover && hover.pinText && (
          <div
            className="absolute right-1.5 z-10 flex items-center gap-0.5 rounded-sm border border-subtle bg-popover p-0.5 shadow-1"
            style={{ top: Math.max(hover.top, 2) }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <button
              className={`icon-btn h-6 w-6 ${hover.pinId != null ? "text-accent" : ""}`}
              title={hover.pinId != null ? "Unpin" : "Pin for quick reference"}
              aria-label={hover.pinId != null ? "Unpin line" : "Pin line"}
              onClick={togglePin}
            >
              <Pin size={13} filled={hover.pinId != null} />
            </button>
            <button
              className="icon-btn h-6 w-6"
              title="Create a task from this line"
              aria-label="Create task from line"
              onClick={makeTask}
            >
              <SquareCheck size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
