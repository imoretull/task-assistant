#!/usr/bin/env node
/**
 * Read or write a single item's title/body directly in a workspace SQLite DB.
 * Used by the /cleanup slash command: Claude reads the body, rewrites the prose,
 * and writes it straight back — no app API or LLM key involved.
 *
 *   node scripts/item-body.mjs get T-0012 [--db main]
 *       → prints { id, type, title, body } as JSON
 *
 *   node scripts/item-body.mjs set T-0012 [--db main] [--title "…"]
 *       → reads the new body from stdin, writes it (and optional --title)
 *
 *   node scripts/item-body.mjs list-today [--db main]
 *       → prints the open Today tasks (status 'today', not done) as a JSON
 *         array of { id, type, title, body } — used by /cleanup-today
 *
 * DB ids: main → data/app.db, demo → data/demo.db (see server/db/databases.ts).
 * Body is stored as raw markdown, exactly as the editor saves it.
 */
import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

const DB_FILES = { main: "app.db", demo: "demo.db" };

function normalizeId(raw) {
  const m = /^([tnTN])-?(\d{1,6})$/.exec(String(raw).trim());
  return m ? `${m[1].toUpperCase()}-${m[2].padStart(4, "0")}` : raw;
}

function parseArgs(argv) {
  const [cmd, ...tail] = argv;
  // list-today takes no id; get/set take one. Pull a leading non-flag token as
  // the id only when it isn't a flag.
  let rawId;
  const rest = [...tail];
  if (rest.length && !rest[0].startsWith("--")) rawId = rest.shift();
  const opts = { db: "main", title: undefined };
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--db") opts.db = rest[++i];
    else if (rest[i] === "--title") opts.title = rest[++i];
  }
  return { cmd, rawId, opts };
}

function die(msg) {
  console.error(`item-body: ${msg}`);
  process.exit(1);
}

const { cmd, rawId, opts } = parseArgs(process.argv.slice(2));
if (!cmd || (cmd !== "list-today" && !rawId)) {
  die('usage: item-body.mjs <get|set|list-today> [id] [--db main|demo] [--title "…"]');
}

const file = DB_FILES[opts.db];
if (!file) die(`unknown --db "${opts.db}" (expected: ${Object.keys(DB_FILES).join(", ")})`);

const id = rawId ? normalizeId(rawId) : undefined;
const client = createClient({ url: `file:data/${file}` });

if (cmd === "list-today") {
  const res = await client.execute({
    sql: "select id, type, title, body from items where status = 'today' and deleted_at is null order by sort_order",
    args: [],
  });
  const rows = res.rows.map((r) => ({ id: r.id, type: r.type, title: r.title, body: r.body }));
  process.stdout.write(JSON.stringify(rows, null, 2));
} else if (cmd === "get") {
  const res = await client.execute({
    sql: "select id, type, title, body from items where id = ? and deleted_at is null",
    args: [id],
  });
  if (res.rows.length === 0) die(`no live item "${id}" in db "${opts.db}"`);
  const r = res.rows[0];
  process.stdout.write(
    JSON.stringify({ id: r.id, type: r.type, title: r.title, body: r.body }, null, 2)
  );
} else if (cmd === "set") {
  const body = readFileSync(0, "utf8").replace(/^﻿/, ""); // stdin, strip BOM
  const now = new Date().toISOString();
  const sets = ["body = ?", "updated_at = ?"];
  const args = [body, now];
  if (opts.title !== undefined) {
    sets.splice(1, 0, "title = ?");
    args.splice(1, 0, opts.title);
  }
  args.push(id);
  const res = await client.execute({
    sql: `update items set ${sets.join(", ")} where id = ? and deleted_at is null`,
    args,
  });
  if (res.rowsAffected === 0) die(`no live item "${id}" in db "${opts.db}"`);
  console.log(`updated ${id} in ${opts.db}`);
} else {
  die(`unknown command "${cmd}" (expected: get | set)`);
}
