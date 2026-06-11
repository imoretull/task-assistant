import { Router } from "express";
import { eq, isNull } from "drizzle-orm";
import { items, pins } from "../db/schema.js";
import { normalizeId } from "../ids.js";

export const pinsRouter = Router();

// GET /api/pins → all pins on live (non-trashed) items, with item context
// for the Pinned quick-reference view.
pinsRouter.get("/", async (req, res) => {
  const rows = await req.db
    .select({
      id: pins.id,
      itemId: pins.itemId,
      content: pins.content,
      createdAt: pins.createdAt,
      itemTitle: items.title,
      itemType: items.type,
      itemStatus: items.status,
    })
    .from(pins)
    .innerJoin(items, eq(pins.itemId, items.id))
    .where(isNull(items.deletedAt));
  res.json(rows);
});

// POST /api/pins { itemId, content } → pin a line/section of an item
pinsRouter.post("/", async (req, res) => {
  const b = req.body ?? {};
  const itemId = typeof b.itemId === "string" ? normalizeId(b.itemId) : "";
  const content = typeof b.content === "string" ? b.content.trim() : "";
  if (!itemId || !content) {
    return res.status(400).json({ error: "itemId and content are required" });
  }
  const [item] = await req.db.select().from(items).where(eq(items.id, itemId));
  if (!item) return res.status(404).json({ error: "Item not found" });

  const [row] = await req.db
    .insert(pins)
    .values({ itemId, content, createdAt: new Date().toISOString() })
    .returning();
  res.status(201).json(row);
});

// PATCH /api/pins/:id { content } → editor keeps pinned text in sync on autosave
pinsRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
  if (!Number.isInteger(id) || !content) {
    return res.status(400).json({ error: "Valid id and content are required" });
  }
  const [row] = await req.db.update(pins).set({ content }).where(eq(pins.id, id)).returning();
  if (!row) return res.status(404).json({ error: "Pin not found" });
  res.json(row);
});

// DELETE /api/pins/:id → unpin
pinsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid pin id" });
  await req.db.delete(pins).where(eq(pins.id, id));
  res.status(204).end();
});
