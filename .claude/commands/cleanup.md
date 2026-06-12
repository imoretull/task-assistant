---
description: Clean up a task/note's body — grammar, spelling, sentence structure — and write it straight to the DB
argument-hint: <item-id> [--db main|demo]
allowed-tools: Bash(node scripts/item-body.mjs:*)
---

Clean up the prose of item `$1` in the TaskNotes database, then write it back.

Steps:

1. Read the current item. Run:
   `node scripts/item-body.mjs get $ARGUMENTS`
   (Pass the id and any `--db` flag straight through. Default db is `main`.)

2. Rewrite **only the body's prose** for grammar, spelling, punctuation, and
   sentence structure. This is a copy-edit, not a rewrite:
   - Keep the meaning, facts, names, numbers, URLs, and code exactly as-is.
   - Preserve all markdown structure: headings, bullet/numbered lists,
     `- [ ]` / `- [x]` checkboxes (keep their checked state), code spans and
     fenced blocks (never edit code), links, blockquotes, and a `→ T-0001`
     style task link if present.
   - Don't add, remove, or reorder list items or todos. Don't invent content.
   - Fix run-ons, capitalization, tense, and obvious typos. Tighten clunky
     phrasing, but keep the author's voice and terse note style.
   - If the body is empty or already clean, say so and make no write.

3. Write it back. Pipe the cleaned markdown into:
   `node scripts/item-body.mjs set $1 [same --db]`
   The script reads the new body from stdin. Use a heredoc or printf — do not
   pass the body as an argument.

4. Report a one-line summary of what changed (e.g. "fixed 3 typos, split two
   run-on sentences"). The change is applied immediately; it can be undone by
   editing the item in the app.

Notes:
- The body is raw markdown, exactly as the editor stores it.
- Leave the title alone unless the user explicitly asks to clean it too (then
  add `--title "…"` to the `set` call).
- If `get` reports the item doesn't exist, check whether it's in the other
  workspace and suggest re-running with `--db demo`.
