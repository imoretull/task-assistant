import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCreateItem, usePrompts, useRunAssistant, useTags } from "../lib/queries";
import type { AssistantResponse, Item } from "../lib/types";
import { Check, Copy, Plus, Sparkle, X } from "./icons";
import { TagChip } from "./ui";

/**
 * Runs saved prompts against this item (and, for multi-item prompts, an
 * optional tag scope). Results always preview before anything is overwritten.
 */
export function AssistantPanel({
  item,
  draftBody,
  onReplaceBody,
}: {
  item: Item;
  draftBody: string;
  onReplaceBody: (body: string) => void;
}) {
  const { data: prompts = [] } = usePrompts();
  const { data: tags = [] } = useTags();
  const run = useRunAssistant();
  const createItem = useCreateItem();

  const [open, setOpen] = useState(false);
  const [promptId, setPromptId] = useState("cleanup");
  const [scopeTagIds, setScopeTagIds] = useState<number[]>([]);
  const [result, setResult] = useState<AssistantResponse | null>(null);
  const [created, setCreated] = useState<string[]>([]);

  const prompt = prompts.find((p) => p.id === promptId);

  const execute = () => {
    setResult(null);
    setCreated([]);
    run.mutate(
      {
        promptId,
        itemIds: [item.id],
        tagIds: prompt?.multi && scopeTagIds.length > 0 ? scopeTagIds : undefined,
      },
      { onSuccess: setResult }
    );
  };

  return (
    <section className="rounded-md border border-subtle bg-overlay">
      <button
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-ink-secondary transition-colors duration-fast hover:text-ink"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <Sparkle size={14} className="text-accent" />
        Assistant
        <span className="ml-auto text-xs text-ink-muted">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-subtle p-3">
          <div className="flex gap-2">
            <select
              className="input flex-1 py-1"
              value={promptId}
              onChange={(e) => {
                setPromptId(e.target.value);
                setResult(null);
              }}
            >
              {prompts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button className="btn-primary" onClick={execute} disabled={run.isPending}>
              {run.isPending ? "Running…" : "Run"}
            </button>
          </div>
          {prompt && <p className="text-xs text-ink-muted">{prompt.description}</p>}

          {prompt?.multi && (
            <div className="space-y-1.5">
              <p className="label">Also include items with all of these tags</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <TagChip
                    key={t.id}
                    tag={t}
                    active={scopeTagIds.includes(t.id)}
                    onClick={() =>
                      setScopeTagIds((prev) =>
                        prev.includes(t.id) ? prev.filter((i) => i !== t.id) : [...prev, t.id]
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {run.isError && (
            <p className="rounded-sm border border-[var(--priority-urgent)] px-2 py-1.5 text-sm text-[var(--priority-urgent)]">
              {run.error.message}
            </p>
          )}

          {run.isPending && (
            <div className="space-y-2">
              <div className="h-3 w-3/4 animate-pulse rounded-sm bg-raised" />
              <div className="h-3 w-1/2 animate-pulse rounded-sm bg-raised" />
            </div>
          )}

          {result && (
            <div className="space-y-2 rounded-md border border-subtle bg-raised p-3">
              <p className="text-xs text-ink-muted">
                Result · provider: <span className="font-mono">{result.provider}</span> · items:{" "}
                {result.itemIds.join(", ")}
              </p>

              {result.mode === "suggest_tasks" && result.suggestedTasks ? (
                <div className="space-y-1.5">
                  {result.suggestedTasks.map((t, i) => {
                    const done = created.includes(t.title);
                    return (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="min-w-0 flex-1">{t.title}</span>
                        <button
                          className="btn-ghost px-2 py-0.5 text-xs"
                          disabled={done}
                          onClick={() =>
                            createItem.mutate(
                              { type: "task", title: t.title, status: "todo", tags: item.tags },
                              { onSuccess: () => setCreated((c) => [...c, t.title]) }
                            )
                          }
                        >
                          {done ? <Check size={12} /> : <Plus size={12} />}
                          {done ? "Created" : "Create task"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="prose-tn max-h-64 overflow-y-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.result}</ReactMarkdown>
                </div>
              )}

              <div className="flex flex-wrap gap-2 border-t border-subtle pt-2">
                {result.mode === "replace_body" && (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      onReplaceBody(result.result);
                      setResult(null);
                    }}
                  >
                    <Check size={13} /> Accept & replace body
                  </button>
                )}
                {result.mode === "text" && (
                  <>
                    <button
                      className="btn-ghost"
                      onClick={() => {
                        onReplaceBody(`${draftBody.trimEnd()}\n\n---\n\n${result.result}\n`);
                        setResult(null);
                      }}
                    >
                      <Plus size={13} /> Append to body
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={() =>
                        createItem.mutate({
                          type: "note",
                          title: `Assistant: ${prompt?.name ?? "result"}`,
                          body: result.result,
                          tags: item.tags,
                        })
                      }
                    >
                      <Plus size={13} /> Save as new note
                    </button>
                  </>
                )}
                <button
                  className="btn-ghost"
                  onClick={() => navigator.clipboard.writeText(result.result)}
                >
                  <Copy size={13} /> Copy
                </button>
                <button className="btn-ghost" onClick={() => setResult(null)}>
                  <X size={13} /> Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
