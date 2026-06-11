import { Router } from "express";
import { and, inArray, isNull } from "drizzle-orm";
import { items, itemTags, tags } from "../db/schema.js";
import { normalizeId } from "../ids.js";
import { getProvider } from "../llm/provider.js";
import { PROMPTS, getPrompt, renderItems, extractSuggestedTasks } from "../llm/prompts.js";

export const assistantRouter = Router();

assistantRouter.get("/prompts", (_req, res) => {
  res.json(
    PROMPTS.map(({ id, name, description, multi, mode }) => ({
      id,
      name,
      description,
      multi,
      mode,
    }))
  );
});

// POST /api/assistant
// { promptId? | promptText?, itemIds?: string[], tagIds?: number[] }
assistantRouter.post("/", async (req, res) => {
  const { promptId, promptText, itemIds, tagIds } = req.body ?? {};
  const prompt = typeof promptId === "string" ? getPrompt(promptId) : undefined;
  if (!prompt && typeof promptText !== "string") {
    return res.status(400).json({ error: "promptId or promptText is required" });
  }

  // Resolve scope: explicit ids, plus all live items carrying ALL given tags.
  const ids = new Set<string>(
    Array.isArray(itemIds) ? itemIds.map((i: string) => normalizeId(String(i))) : []
  );
  if (Array.isArray(tagIds) && tagIds.length > 0) {
    const joins = await req.db
      .select()
      .from(itemTags)
      .where(inArray(itemTags.tagId, tagIds.map(Number)));
    const counts = new Map<string, number>();
    for (const j of joins) counts.set(j.itemId, (counts.get(j.itemId) ?? 0) + 1);
    for (const [itemId, n] of counts) if (n === tagIds.length) ids.add(itemId);
  }
  if (ids.size === 0) {
    return res.status(400).json({ error: "No items matched (provide itemIds and/or tagIds)" });
  }

  const rows = await req.db
    .select()
    .from(items)
    .where(and(inArray(items.id, [...ids]), isNull(items.deletedAt)));
  if (rows.length === 0) return res.status(404).json({ error: "Items not found" });
  if (prompt && !prompt.multi && rows.length > 1) {
    return res.status(400).json({ error: `"${prompt.name}" runs on a single item` });
  }

  const allTags = await req.db.select().from(tags);
  const joins = await req.db
    .select()
    .from(itemTags)
    .where(inArray(itemTags.itemId, rows.map((r) => r.id)));
  const tagNamesFor = (itemId: string) =>
    joins
      .filter((j) => j.itemId === itemId)
      .map((j) => allTags.find((t) => t.id === j.tagId)?.name)
      .filter((n): n is string => Boolean(n));

  const rendered = renderItems(rows.map((r) => ({ ...r, tagNames: tagNamesFor(r.id) })));
  const userMessage = prompt
    ? rendered
    : `${promptText}\n\n${rendered}`;

  try {
    const provider = await getProvider();
    const result = await provider.generate({
      system: prompt?.system,
      messages: [{ role: "user", content: userMessage }],
      promptId: prompt?.id,
    });

    res.json({
      provider: provider.name,
      promptId: prompt?.id ?? null,
      mode: prompt?.mode ?? "text",
      itemIds: rows.map((r) => r.id),
      result,
      suggestedTasks:
        prompt?.mode === "suggest_tasks" ? extractSuggestedTasks(result) : undefined,
    });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "Provider error" });
  }
});
