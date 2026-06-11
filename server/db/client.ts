import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "./schema.js";
import { DATABASES, DEFAULT_DB_ID, isDatabaseId, type DatabaseId } from "./databases.js";
import { seedDatabase } from "./seed.js";

const DATA_DIR = path.resolve(process.cwd(), "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

export type DB = LibSQLDatabase<typeof schema>;

/** One libsql client + drizzle handle per database file. Atomic: a query
 *  against one database never touches another's file. */
const handles = new Map<DatabaseId, DB>();

function handleFor(id: DatabaseId): DB {
  const existing = handles.get(id);
  if (existing) return existing;
  const meta = DATABASES.find((d) => d.id === id)!;
  const client = createClient({ url: `file:data/${meta.file}` });
  const handle = drizzle(client, { schema });
  handles.set(id, handle);
  return handle;
}

/** Resolve the active database for a request. Falls back to the default. */
export function resolveDb(id: string | undefined): { id: DatabaseId; db: DB } {
  const dbId = isDatabaseId(id) ? id : DEFAULT_DB_ID;
  return { id: dbId, db: handleFor(dbId) };
}

export async function initDb() {
  // Migrate + seed every known database up front so the dropdown can switch
  // instantly and each file is self-contained.
  for (const meta of DATABASES) {
    const db = handleFor(meta.id);
    await migrate(db, { migrationsFolder: "drizzle" });
    await seedDatabase(meta.id, db);
  }
}
