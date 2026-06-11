import type { ItemRow } from "../db/schema.js";

export type PromptMode = "replace_body" | "text" | "suggest_tasks";

export interface SavedPrompt {
  id: string;
  name: string;
  description: string;
  /** Can this prompt take more than one item? */
  multi: boolean;
  /** What the UI should do with the result. */
  mode: PromptMode;
  system: string;
}

export const PROMPTS: SavedPrompt[] = [
  {
    id: "cleanup",
    name: "Clean up grammar & spelling",
    description: "Rewrite the body with fixed grammar, spelling and punctuation. Preview before replacing.",
    multi: false,
    mode: "replace_body",
    system:
      "You are an editor. Rewrite the provided text with corrected grammar, spelling, capitalization and punctuation. Preserve the meaning, the markdown structure, and the author's voice. Return ONLY the corrected text, no commentary.",
  },
  {
    id: "summarize",
    name: "Summarize & extract next steps",
    description: "A short summary of the item plus a checklist of next steps.",
    multi: false,
    mode: "text",
    system:
      "Summarize the provided item in 2-3 sentences, then list concrete next steps as a markdown checklist (- [ ] ...). Return only markdown.",
  },
  {
    id: "meeting_notes",
    name: "Make sense of meeting notes",
    description: "Turn a pasted raw transcript into summary, decisions and next steps.",
    multi: false,
    mode: "text",
    system:
      "The provided text is a raw meeting transcript or rough meeting notes. Produce clean markdown with three sections: ## Summary (short paragraph), ## Decisions (bullets), ## Next steps (markdown checklist with owners when mentioned). Return only markdown.",
  },
  {
    id: "consolidate",
    name: "Consolidate across notes",
    description: "Read several items (picked by id or tags) and consolidate into one brief with recommendations.",
    multi: true,
    mode: "text",
    system:
      "You will receive several items. Consolidate them into a single brief: ## Consolidated summary, ## Themes, ## Recommendations. Reference item ids like (N-0004) where useful. Return only markdown.",
  },
  {
    id: "suggest_tasks",
    name: "Suggest tasks from this note",
    description: "Propose actionable tasks; create them on the board with one click.",
    multi: false,
    mode: "suggest_tasks",
    system:
      "Read the provided item and propose 3-7 concrete, actionable tasks. Return ONLY a markdown list, one task per line, each line starting with '- ' and containing a short imperative task title (max 80 chars). No other text.",
  },
];

export function getPrompt(id: string): SavedPrompt | undefined {
  return PROMPTS.find((p) => p.id === id);
}

export function renderItems(itemsWithTags: (ItemRow & { tagNames: string[] })[]): string {
  return itemsWithTags
    .map((item) => {
      const tags = item.tagNames.length > 0 ? ` tags="${item.tagNames.join(", ")}"` : "";
      return `<item id="${item.id}" title="${item.title}"${tags}>\n${item.body}\n</item>`;
    })
    .join("\n\n");
}

/** Lines that look like tasks, for the suggest_tasks post-processing step. */
export function extractSuggestedTasks(result: string): { title: string }[] {
  const out: { title: string }[] = [];
  for (const raw of result.split("\n")) {
    const m = /^\s*(?:[-*]|\d+\.)\s*(?:\[[ xX]?\]\s*)?(.+)$/.exec(raw);
    if (m) {
      const title = m[1].trim().replace(/\*\*/g, "");
      if (title) out.push({ title });
    }
  }
  return out;
}
