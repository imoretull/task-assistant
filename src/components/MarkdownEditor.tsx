import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Apple-Notes-style lightweight editor: a controlled textarea with a small
 * formatting toolbar and a live markdown preview toggle. Raw markdown is stored.
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write something…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = (before: string, after = before) => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end } = ta;
    const selected = value.slice(start, end) || "text";
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const prefixLines = (prefix: string) => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end } = ta;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const block = value.slice(lineStart, end);
    const prefixed = block
      .split("\n")
      .map((l) => (l.startsWith(prefix) ? l.slice(prefix.length) : prefix + l))
      .join("\n");
    onChange(value.slice(0, lineStart) + prefixed + value.slice(end));
    requestAnimationFrame(() => ta.focus());
  };

  const toolBtn =
    "rounded-sm px-1.5 py-0.5 text-sm text-ink-muted transition-colors duration-fast hover:bg-overlay hover:text-ink";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-1.5 flex items-center gap-0.5">
        <button className={toolBtn} title="Bold" onClick={() => wrapSelection("**")}>
          <strong>B</strong>
        </button>
        <button className={toolBtn} title="Italic" onClick={() => wrapSelection("*")}>
          <em>I</em>
        </button>
        <button className={toolBtn} title="Code" onClick={() => wrapSelection("`")}>
          <span className="font-mono">{"<>"}</span>
        </button>
        <button className={toolBtn} title="Bulleted list" onClick={() => prefixLines("- ")}>
          •&nbsp;list
        </button>
        <button className={toolBtn} title="Checkbox" onClick={() => prefixLines("- [ ] ")}>
          ☐&nbsp;todo
        </button>
        <div className="ml-auto flex rounded-sm border border-subtle p-0.5">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-[4px] px-2 py-0.5 text-xs capitalize transition-colors duration-fast ${
                tab === t ? "bg-overlay font-medium text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {tab === "write" ? (
        <textarea
          ref={ref}
          className="min-h-[220px] w-full flex-1 resize-none rounded-sm border border-subtle bg-raised p-3 font-sans text-base leading-relaxed placeholder:text-ink-muted focus:border-strong"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="prose-tn min-h-[220px] flex-1 overflow-y-auto rounded-sm border border-subtle bg-raised p-3">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-ink-muted">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  );
}
