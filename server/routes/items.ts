import { Router } from "express";
import { and, eq, isNull, isNotNull, max } from "drizzle-orm";
import type { DB } from "../db/client.js";
import { items, itemTags, pins, type ItemRow } from "../db/schema.js";
import { nextId, normalizeId } from "../ids.js";

export const itemsRouter = Router();

const STATUSES = ["backlog", "today", "done"] as const;
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const DIFFICULTIES = ["xs", "s", "m", "l", "xl"] as const;

/** Local calendar date (YYYY-MM-DD) — the server and browser share a machine. */
function localDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Carry-over bookkeeping for a status change: entering Today stamps the age
 *  anchor, leaving for Backlog drops it ("guilt-free"), completing stamps the
 *  History timestamp, and unchecking clears it again. */
function statusPatch(from: ItemRow["status"], to: ItemRow["status"]): Record<string, unknown> {
  if (from === to) return {};
  switch (to) {
    case "today":
      // Un-completing keeps the original age; a pull from Backlog starts fresh.
      return { status: to, completedAt: null, ...(from === "done" ? {} : { enteredToday: localDate() }) };
    case "backlog":
      return { status: to, enteredToday: null, completedAt: null };
    case "done":
      return { status: to, completedAt: new Date().toISOString() };
    default: // task → note
      return { status: null, enteredToday: null, completedAt: null };
  }
}

type ItemWithTags = ItemRow & { tags: number[] };

async function withTags(db: DB, rows: ItemRow[]): Promise<ItemWithTags[]> {
  const joins = await db.select().from(itemTags);
  const byItem = new Map<string, number[]>();
  for (const j of joins) {
    const list = byItem.get(j.itemId) ?? [];
    list.push(j.tagId);
    byItem.set(j.itemId, list);
  }
  return rows.map((r) => ({ ...r, tags: byItem.get(r.id) ?? [] }));
}

export async function loadItem(db: DB, rawId: string): Promise<ItemWithTags | null> {
  const id = normalizeId(rawId);
  const rows = await db.select().from(items).where(eq(items.id, id));
  if (rows.length === 0) return null;
  return (await withTags(db, rows))[0];
}

async function setItemTags(db: DB, itemId: string, tagIds: number[]) {
  await db.delete(itemTags).where(eq(itemTags.itemId, itemId));
  if (tagIds.length > 0) {
    await db
      .insert(itemTags)
      .values(tagIds.map((tagId) => ({ itemId, tagId })));
  }
}

/** Next manual sort position at the end of a status column (or the notes grid). */
async function nextSortOrder(db: DB, status: string | null): Promise<number> {
  const cond = status === null ? isNull(items.status) : eq(items.status, status as ItemRow["status"] & string);
  const [row] = await db.select({ m: max(items.sortOrder) }).from(items).where(cond);
  return (row?.m ?? 0) + 1000;
}

// GET /api/items            → all live items (with tag ids)
// GET /api/items?trash=true → soft-deleted items
itemsRouter.get("/", async (req, res) => {
  const trash = req.query.trash === "true";
  const rows = await req.db
    .select()
    .from(items)
    .where(trash ? isNotNull(items.deletedAt) : isNull(items.deletedAt));
  res.json(await withTags(req.db, rows));
});

itemsRouter.get("/:id", async (req, res) => {
  const item = await loadItem(req.db, req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

itemsRouter.post("/", async (req, res) => {
  const b = req.body ?? {};
  const type = b.type === "task" ? "task" : "note";
  const status =
    type === "task"
      ? STATUSES.includes(b.status) ? b.status : "today"
      : STATUSES.includes(b.status) ? b.status : null;
  const now = new Date().toISOString();
  const id = await nextId(req.db, type);

  const row = {
    id,
    type,
    title: typeof b.title === "string" ? b.title : "",
    body: typeof b.body === "string" ? b.body : "",
    status,
    priority: PRIORITIES.includes(b.priority) ? b.priority : "medium",
    difficulty: DIFFICULTIES.includes(b.difficulty) ? b.difficulty : "m",
    starred: Boolean(b.starred),
    dueDate: typeof b.dueDate === "string" && b.dueDate ? b.dueDate : null,
    enteredToday: status === "today" ? localDate() : null,
    completedAt: status === "done" ? now : null,
    sortOrder: await nextSortOrder(req.db, status),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  } as const;

  await req.db.insert(items).values(row);
  if (Array.isArray(b.tags)) {
    await setItemTags(req.db, id, b.tags.filter((t: unknown) => Number.isInteger(t)));
  }
  res.status(201).json(await loadItem(req.db, id));
});

itemsRouter.patch("/:id", async (req, res) => {
  const existing = await loadItem(req.db, req.params.id);
  if (!existing) return res.status(404).json({ error: "Item not found" });
  const b = req.body ?? {};

  const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (typeof b.title === "string") patch.title = b.title;
  if (typeof b.body === "string") patch.body = b.body;
  if (b.status === null || STATUSES.includes(b.status)) {
    Object.assign(patch, statusPatch(existing.status, b.status));
  }
  if (PRIORITIES.includes(b.priority)) patch.priority = b.priority;
  if (DIFFICULTIES.includes(b.difficulty)) patch.difficulty = b.difficulty;
  if (typeof b.starred === "boolean") patch.starred = b.starred;
  if (b.dueDate === null || typeof b.dueDate === "string") patch.dueDate = b.dueDate || null;
  if (typeof b.sortOrder === "number") patch.sortOrder = b.sortOrder;
  // Convert note → task keeps its N- id; just give it a status.
  if (b.type === "task" || b.type === "note") patch.type = b.type;

  await req.db.update(items).set(patch).where(eq(items.id, existing.id));
  if (Array.isArray(b.tags)) {
    await setItemTags(req.db, existing.id, b.tags.filter((t: unknown) => Number.isInteger(t)));
  }
  res.json(await loadItem(req.db, existing.id));
});

// Soft delete → trash
itemsRouter.delete("/:id", async (req, res) => {
  const existing = await loadItem(req.db, req.params.id);
  if (!existing) return res.status(404).json({ error: "Item not found" });
  await req.db
    .update(items)
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(items.id, existing.id));
  res.json(await loadItem(req.db, existing.id));
});

itemsRouter.post("/:id/restore", async (req, res) => {
  const existing = await loadItem(req.db, req.params.id);
  if (!existing) return res.status(404).json({ error: "Item not found" });
  await req.db.update(items).set({ deletedAt: null }).where(eq(items.id, existing.id));
  res.json(await loadItem(req.db, existing.id));
});

itemsRouter.delete("/:id/permanent", async (req, res) => {
  const existing = await loadItem(req.db, req.params.id);
  if (!existing) return res.status(404).json({ error: "Item not found" });
  await req.db.delete(itemTags).where(eq(itemTags.itemId, existing.id));
  await req.db.delete(pins).where(eq(pins.itemId, existing.id));
  await req.db.delete(items).where(eq(items.id, existing.id));
  res.status(204).end();
});

// Empty trash
itemsRouter.post("/trash/empty", async (req, res) => {
  const trashed = await req.db.select().from(items).where(isNotNull(items.deletedAt));
  for (const t of trashed) {
    await req.db.delete(itemTags).where(eq(itemTags.itemId, t.id));
    await req.db.delete(pins).where(eq(pins.itemId, t.id));
    await req.db.delete(items).where(eq(items.id, t.id));
  }
  res.json({ deleted: trashed.length });
});
