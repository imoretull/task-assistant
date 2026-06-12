---
description: Copy-edit every open task on today's plate — titles and bodies — and write them straight to the DB
argument-hint: [--db main|demo]
allowed-tools: Bash(node scripts/item-body.mjs:*)
---

Clean up the prose of **all open Today tasks** in the TaskNotes database, then
write each back. Takes no item id — it operates on the whole of today's plate.

Steps:

1. List the open Today tasks. Run:
   `node scripts/item-body.mjs list-today $ARGUMENTS`
   (Pass any `--db` flag straight through. Default db is `main`.) This prints a
   JSON array of `{ id, type, title, body }` — status `today`, not done, not
   trashed. If the array is empty, say "Nothing on today's plate to clean up"
   and stop.

2. For **each** item in the array, copy-edit its **title** and its **body**.
   This is a copy-edit, not a rewrite:
   - **Title:** fix grammar, spelling, punctuation, and capitalization. Keep it
     a short task title — don't expand it into a sentence or add detail. Keep a
     leading project shorthand if present (the app strips `DMA - ` style
     prefixes on entry, so most titles won't have one). Leave the meaning,
     names, and numbers exactly as-is.
   - **Body:** fix grammar, spelling, punctuation, run-ons, tense, and obvious
     typos; tighten clunky phrasing but keep the author's terse voice. Keep the
     meaning, facts, names, numbers, URLs, and code exactly as-is. Preserve all
     markdown: headings, bullet/numbered lists, `- [ ]` / `- [x]` checkboxes
     (keep their checked state), code spans and fenced blocks (never edit code),
     links, blockquotes, and any `→ T-0001` style task link.
   - Don't add, remove, or reorder list items or todos. Don't invent content.
   - If a title and body are both already clean, skip that item (no write).

3. Write each changed item back. Pipe the cleaned markdown body into:
   `node scripts/item-body.mjs set <id> [same --db] --title "<cleaned title>"`
   The script reads the new body from stdin — use a heredoc or printf, do not
   pass the body as an argument. Always pass `--title` so the cleaned title is
   saved alongside the body. If an item's body is empty, still pass an empty
   body on stdin so only the title updates.

4. Report a compact per-item summary, one line each, e.g.:
   - `T-0002 — fixed 2 typos in title; split a run-on in body`
   - `T-0007 — already clean, skipped`
   Then a one-line total (e.g. "Cleaned 3 of 5 tasks"). Changes apply
   immediately and can be undone by editing the task in the app.

Notes:
- Bodies are raw markdown, exactly as the editor stores them.
- `list-today` returns notes too if a note was pulled onto today's plate
  (`status = 'today'`); clean those the same way — title + body.
- For a single item by id (task or note), use `/cleanup <id>` instead.
