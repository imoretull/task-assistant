import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
  id: text("id").primaryKey(), // T-0012 / N-0004
  type: text("type", { enum: ["task", "note"] }).notNull(),
  title: text("title").notNull().default(""),
  body: text("body").notNull().default(""),
  status: text("status", {
    enum: ["backlog", "today", "done"],
  }),
  priority: text("priority", { enum: ["low", "medium", "high", "urgent"] })
    .notNull()
    .default("medium"),
  difficulty: text("difficulty", { enum: ["xs", "s", "m", "l", "xl"] })
    .notNull()
    .default("m"),
  starred: integer("starred", { mode: "boolean" }).notNull().default(false),
  dueDate: text("due_date"),
  // Local date (YYYY-MM-DD) the task last entered Today — anchors the age
  // badge. Null for backlog tasks and notes; reset on every backlog→today move.
  enteredToday: text("entered_today"),
  // ISO timestamp of completion — History groups done tasks by its local day.
  completedAt: text("completed_at"),
  sortOrder: real("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  color: text("color"),
  // Sidebar section: projects and people get their own groups above plain tags.
  kind: text("kind", { enum: ["project", "person", "tag"] })
    .notNull()
    .default("tag"),
});

export const itemTags = sqliteTable(
  "item_tags",
  {
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.itemId, t.tagId] }),
  })
);

// A pinned line/section of an item's body: `content` is a plain-text snapshot
// of the pinned block, kept in sync by the editor while the item is edited.
export const pins = sqliteTable("pins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

export type ItemRow = typeof items.$inferSelect;
export type TagRow = typeof tags.$inferSelect;
export type PinRow = typeof pins.$inferSelect;
