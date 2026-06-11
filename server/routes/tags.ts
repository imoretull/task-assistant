import { Router } from "express";
import { eq } from "drizzle-orm";
import { tags, itemTags } from "../db/schema.js";

export const tagsRouter = Router();

const KINDS = ["project", "person", "tag"] as const;

tagsRouter.get("/", async (req, res) => {
  res.json(await req.db.select().from(tags));
});

tagsRouter.post("/", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (!name) return res.status(400).json({ error: "Tag name is required" });
  const existing = await req.db.select().from(tags).where(eq(tags.name, name));
  if (existing.length > 0) return res.json(existing[0]);
  const color = typeof req.body?.color === "string" ? req.body.color : null;
  const kind = KINDS.includes(req.body?.kind) ? req.body.kind : "tag";
  const [row] = await req.db.insert(tags).values({ name, color, kind }).returning();
  res.status(201).json(row);
});

tagsRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const patch: Record<string, unknown> = {};
  if (typeof req.body?.name === "string" && req.body.name.trim()) {
    patch.name = req.body.name.trim();
  }
  if (req.body?.color === null || typeof req.body?.color === "string") {
    patch.color = req.body.color;
  }
  if (KINDS.includes(req.body?.kind)) {
    patch.kind = req.body.kind;
  }
  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }
  const [row] = await req.db.update(tags).set(patch).where(eq(tags.id, id)).returning();
  if (!row) return res.status(404).json({ error: "Tag not found" });
  res.json(row);
});

tagsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await req.db.delete(itemTags).where(eq(itemTags.tagId, id));
  await req.db.delete(tags).where(eq(tags.id, id));
  res.status(204).end();
});
