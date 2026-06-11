import { like } from "drizzle-orm";
import type { DB } from "./db/client.js";
import { items } from "./db/schema.js";

/** Normalize shorthand ids like "t-12" / "N-4" to "T-0012" / "N-0004". */
export function normalizeId(raw: string): string {
  const m = /^([tnTN])-?(\d{1,6})$/.exec(raw.trim());
  if (!m) return raw;
  return `${m[1].toUpperCase()}-${m[2].padStart(4, "0")}`;
}

/** Next id for a type within a database: scans existing ids and increments
 *  the max suffix. Scoped to the given db so ids are independent per database. */
export async function nextId(db: DB, type: "task" | "note"): Promise<string> {
  const prefix = type === "task" ? "T" : "N";
  const rows = await db
    .select({ id: items.id })
    .from(items)
    .where(like(items.id, `${prefix}-%`));
  let max = 0;
  for (const r of rows) {
    const n = parseInt(r.id.slice(2), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}
