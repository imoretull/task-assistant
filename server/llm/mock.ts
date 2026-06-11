import type { GenerateOptions, LLMProvider } from "./provider.js";

/**
 * Deterministic offline provider — the default. Parses the same prompt the
 * real provider would receive (items are wrapped in <item> blocks by
 * prompts.renderItems) and applies canned transforms so every Assistant flow
 * works with no API key and no internet.
 */
export class MockProvider implements LLMProvider {
  readonly name = "mock";

  async generate({ messages, promptId }: GenerateOptions): Promise<string> {
    const text = messages.map((m) => m.content).join("\n");
    const items = parseItems(text);

    switch (promptId) {
      case "cleanup":
        return cleanup(items[0]?.body ?? text);
      case "summarize":
        return summarize(items[0] ?? { id: "?", title: "", body: text });
      case "meeting_notes":
        return meetingNotes(items[0]?.body ?? text);
      case "consolidate":
        return consolidate(items);
      case "suggest_tasks":
        return suggestTasks(items[0]?.body ?? text);
      default:
        // Free-form prompt: echo a deterministic acknowledgement.
        return [
          "_MockProvider (offline) — set LLM_PROVIDER=claude and ANTHROPIC_API_KEY for real responses._",
          "",
          summarizeText(items.map((i) => i.body).join("\n") || text),
        ].join("\n");
    }
  }
}

interface ParsedItem {
  id: string;
  title: string;
  body: string;
}

function parseItems(text: string): ParsedItem[] {
  const out: ParsedItem[] = [];
  const re = /<item id="([^"]*)" title="([^"]*)"[^>]*>\n?([\s\S]*?)\n?<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push({ id: m[1], title: m[2], body: m[3] });
  }
  return out;
}

/** Light, deterministic grammar pass: spacing, capitalization, common typos. */
function cleanup(body: string): string {
  return body
    .split("\n")
    .map((line) => {
      if (/^\s*([-*>#]|\d+\.|\[|```)/.test(line)) {
        // leave markdown structure lines mostly alone, just trim doubles
        return line.replace(/ {2,}/g, " ");
      }
      let s = line.replace(/ {2,}/g, " ").trimEnd();
      s = s.replace(/\bi\b/g, "I");
      s = s.replace(/\bdont\b/gi, "don't").replace(/\bcant\b/gi, "can't").replace(/\bwont\b/gi, "won't");
      s = s.replace(/\bteh\b/gi, "the").replace(/\brecieve\b/gi, "receive");
      s = s.replace(/\s+([,.;:!?])/g, "$1");
      // Capitalize sentence starts.
      s = s.replace(/(^|[.!?]\s+)([a-z])/g, (_all, pre: string, ch: string) => pre + ch.toUpperCase());
      // Terminal punctuation for prose sentences.
      if (s && !/[.!?:]$/.test(s)) s += ".";
      return s;
    })
    .join("\n");
}

function firstSentence(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  const m = /^.*?[.!?](\s|$)/.exec(flat);
  return (m ? m[0] : flat.slice(0, 140)).trim();
}

function summarizeText(text: string): string {
  return firstSentence(text) || "(empty)";
}

function actionLines(body: string): string[] {
  const verbs = /\b(todo|follow up|need to|needs|should|will|fix|review|ping|ask|send|draft|confirm|check|update|finish|schedule|prepare|investigate)\b/i;
  return body
    .split("\n")
    .map((l) => l.replace(/^\s*(?:[-*]|\d+\.)\s*(?:\[[ xX]?\]\s*)?/, "").trim())
    .filter((l) => l.length > 3 && verbs.test(l));
}

function summarize(item: ParsedItem): string {
  const steps = actionLines(item.body);
  return [
    `**Summary of ${item.id}${item.title ? ` — ${item.title}` : ""}**`,
    "",
    summarizeText(item.body),
    "",
    "**Next steps**",
    ...(steps.length > 0
      ? steps.map((s) => `- [ ] ${s}`)
      : ["- [ ] Review this item and decide the next action"]),
  ].join("\n");
}

function meetingNotes(body: string): string {
  const lines = body
    .split(/\n|(?<=[.!?])\s+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const decisions = lines.filter((l) => /\b(decided|agreed|approved|chose|go with|won't do|will not)\b/i.test(l));
  const steps = actionLines(body);
  return [
    "## Summary",
    summarizeText(body),
    "",
    "## Decisions",
    ...(decisions.length > 0 ? decisions.map((d) => `- ${d}`) : ["- No explicit decisions captured"]),
    "",
    "## Next steps",
    ...(steps.length > 0 ? steps.map((s) => `- [ ] ${s}`) : ["- [ ] Circulate these notes"]),
  ].join("\n");
}

function consolidate(items: ParsedItem[]): string {
  if (items.length === 0) return "No items provided.";
  return [
    "## Consolidated summary",
    ...items.map((i) => `- (${i.id}) ${i.title || "Untitled"}: ${summarizeText(i.body)}`),
    "",
    "## Themes",
    "- Recurring follow-ups and blockers appear across these items",
    "",
    "## Recommendations",
    ...items
      .flatMap((i) => actionLines(i.body).slice(0, 2).map((s) => `- [ ] ${s} (${i.id})`))
      .slice(0, 8),
  ].join("\n");
}

function suggestTasks(body: string): string {
  const steps = actionLines(body);
  const fallback = [`Review and triage: ${firstSentence(body).slice(0, 60)}`];
  const titles = (steps.length > 0 ? steps : fallback).slice(0, 7).map((s) =>
    s.length > 80 ? s.slice(0, 77) + "..." : s
  );
  return titles.map((t) => `- ${t.replace(/[.]+$/, "")}`).join("\n");
}
