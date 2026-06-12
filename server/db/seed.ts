import { sql } from "drizzle-orm";
import * as schema from "./schema.js";
import type { DB } from "./client.js";
import type { DatabaseId } from "./databases.js";
import { mainSeed } from "./seeds/main.js";
import { demoSeed } from "./seeds/demo.js";

export interface SeedTag {
  name: string;
  color: string | null;
  kind?: "project" | "person" | "tag";
}

export interface SeedItem {
  id: string;
  type: "task" | "note";
  title: string;
  body: string;
  status: "backlog" | "today" | "done" | null;
  priority?: "low" | "medium" | "high" | "urgent";
  difficulty?: "xs" | "s" | "m" | "l" | "xl";
  starred?: boolean;
  dueDate?: string | null;
  sortOrder?: number;
  /** Day offset from "now" for created/updated timestamps (negative = past). */
  ageDays?: number;
  /** Today tasks: days since the task entered Today (age badge). Default 0. */
  carriedDays?: number;
  /** Done tasks: days ago the task was completed (History day). Default 0. */
  doneDaysAgo?: number;
  tags?: string[];
}

export interface SeedData {
  tags: SeedTag[];
  items: SeedItem[];
}

const SEEDS: Record<DatabaseId, () => SeedData> = {
  main: mainSeed,
  demo: demoSeed,
};

/** Seed a database from its definition, but only if it is currently empty.
 *  Idempotent: re-running the server never duplicates rows. */
export async function seedDatabase(id: DatabaseId, db: DB): Promise<void> {
  const [{ count }] = await db.all<{ count: number }>(
    sql`select count(*) as count from items`
  );
  if (count > 0) return;

  const data = SEEDS[id]();
  const now = Date.now();

  await db
    .insert(schema.tags)
    .values(data.tags.map((t) => ({ ...t, kind: t.kind ?? "tag" })));
  const tagRows = await db.select().from(schema.tags);
  const tagId = (name: string) => {
    const row = tagRows.find((t) => t.name === name);
    if (!row) throw new Error(`Seed references unknown tag "${name}" in db "${id}"`);
    return row.id;
  };

  // Track a per-column sort cursor so seeded order is stable and sensible.
  const columnCursor = new Map<string, number>();
  const nextSort = (status: string | null) => {
    const key = status ?? "__notes__";
    const v = (columnCursor.get(key) ?? 0) + 1000;
    columnCursor.set(key, v);
    return v;
  };

  const localDate = (offsetDays: number) => {
    const d = new Date(now - offsetDays * 86_400_000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  const itemValues: (typeof schema.items.$inferInsert)[] = data.items.map((it) => {
    const ts = new Date(now + (it.ageDays ?? 0) * 86_400_000).toISOString();
    return {
      id: it.id,
      type: it.type,
      title: it.title,
      body: it.body,
      status: it.status,
      priority: it.priority ?? "medium",
      difficulty: it.difficulty ?? "m",
      starred: it.starred ?? false,
      dueDate: it.dueDate ?? null,
      enteredToday: it.status === "today" ? localDate(it.carriedDays ?? 0) : null,
      completedAt:
        it.status === "done"
          ? new Date(now - (it.doneDaysAgo ?? 0) * 86_400_000).toISOString()
          : null,
      sortOrder: it.sortOrder ?? nextSort(it.status),
      createdAt: ts,
      updatedAt: ts,
      deletedAt: null,
    };
  });
  await db.insert(schema.items).values(itemValues);

  const joins: { itemId: string; tagId: number }[] = [];
  for (const it of data.items) {
    for (const tag of it.tags ?? []) {
      joins.push({ itemId: it.id, tagId: tagId(tag) });
    }
  }
  if (joins.length > 0) await db.insert(schema.itemTags).values(joins);
}
