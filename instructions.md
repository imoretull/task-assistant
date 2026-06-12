# Build Spec — "TaskNotes" (working title)

A local-first **personal task tracker** (Vite + SQLite, localhost) for an individual on
a software team. Single-user. Runs on localhost from VS Code.

**Core principle: Lean.** No due dates, no subtasks, no priorities on tasks. Tasks are
bite-size (5–20 min). The killer feature is **automatic carry-over of unfinished
tasks**. A Notes tab already exists alongside (kept from the v1 build).

> v2 note: this spec replaces the v1 JIRA-style board and the LLM assistant. The
> install constraints (§0), tech stack (§2), data layer, design system (§4), and the
> Notes / Starred / Pinned / Trash views from v1 are kept.

---

## 0. Install constraints (HARD requirement — non-negotiable)

Plug-and-play for corporate work users on Mac AND Windows, including machines
**without admin rights, without a C/C++ compiler, without Python**, behind corporate
proxies:

```
git clone <repo>      # (or download zip)
npm install           # pure JS — compiles nothing
npm run dev           # opens localhost, app runs
```

- **Only Node.js LTS is a prerequisite.** No native/compiled dependencies (no
  node-gyp; `better-sqlite3` stays banned — use pure-JS libsql).
- No global installs, no admin/sudo, no system services, no Docker, no separate DB
  engine. Everything is local files inside the project folder.
- Identical commands on Mac and Windows. App runs fully offline.

---

## 1. Tech stack (unchanged from v1)

- **Frontend:** Vite + React + TypeScript, Tailwind with CSS-variable design tokens,
  Radix UI primitives, TanStack Query.
- **Backend sidecar:** Node + Express on localhost; owns the database.
- **Database:** SQLite via `@libsql/client` (pure JS) + Drizzle ORM, local files under
  `data/`. Drizzle Kit for migrations.
- **Editor:** TipTap (markdown in/out) for the notes areas.

---

## 2. The three surfaces

1. **Today (home screen)** — Date header, auto-focused quick-add box. Shows today's
   tasks only. **Unfinished tasks from prior days auto-roll into today.**
2. **Backlog (slide-out side panel)** — Collapsed by default with a count. Flat,
   undated holding pile for future ideas. One-press pull into Today.
3. **History (tucked behind a tap)** — Read-only archive of past completed days. For
   the feel-good scroll, not daily use.

---

## 3. Quick-add behavior

- Type `DMA - fix login test` → parses `DMA` as a **project tag** (colored chip),
  strips the prefix, adds to Today.
- A marker (`>` prefix or a toggle on the add box) routes the task to **Backlog**
  instead, without leaving the Today view.

---

## 4. Task rows

- Project shown as a small **colored chip** at the front (auto-assigned from
  shorthand).
- **Checkbox to complete** → strikethrough + dimmed, sinks to the bottom of the list.
- **Age badge** on carried tasks (e.g. "4d") showing days rolled over. Today only,
  never Backlog.
- Small **note indicator** (dot or icon) when a task has notes attached.
- Optional header count: "7 done · 2 carried."

---

## 5. Task detail / rough-notes panel

- Clicking a task's **text** (not the checkbox) opens a **right-side panel** with a
  free-form notes area scoped to that task.
- Used for scratch prep — URLs, data, meeting to-dos, etc.
- **Autosaves continuously.** Write-and-forget, but retained so it's searchable later
  in the archive.
- Notes travel with the task through carry-over, backlog moves, and into History.

---

## 6. Move between Today and Backlog (one-press, both directions)

- **Backlog → Today:** a "→ Today" button on the backlog row drops it into today's
  queue immediately. Main pull motion.
- **Today → Backlog:** the reverse button pushes a today task back to the backlog
  pile — "not today after all," without deleting.
- Single press, no drag, no confirm. Notes and project chip travel with the task.
  Sent to Backlog, it drops its age badge; pulled back into Today, the age starts
  fresh.

---

## 7. Behavior rules

- Carried tasks subtly highlighted on a new day so you consciously re-commit or
  dismiss them.
- Completed tasks roll into History overnight.
- Backlog items are undated and carry no age badge — a safe, guilt-free dump.

---

## 8. Layout

- The **notes panel owns the right side** (used most).
- **Backlog is a left slide-out** inside the Today view so the two don't fight for
  space.
- Left sidebar (kept from v1): Today, History, All, Notes, Starred, Pinned, Trash +
  tag sections (Projects / People / Tags) with multi-select filtering.

---

## 9. Data model notes (v2 changes)

- `items.status` is now `'backlog' | 'today' | 'done' | null` (null = note).
- `items.entered_today` (local date) anchors the age badge; set when a task enters
  Today, cleared on a move to Backlog.
- `items.completed_at` (timestamp) groups History by day; cleared when un-completed.
- Carry-over needs no cron: Today shows every open `today` task regardless of when it
  entered; "overnight" transitions fall out of date comparisons at render time.
- Workspaces: `main` (My workspace) + one `demo` workspace, each its own SQLite file.

---

## 10. Explicitly OUT of scope

- Due dates, subtasks, priorities on tasks (priority/difficulty fields remain on
  notes only).
- The kanban board, drag & drop, the LLM assistant (removed in v2).
- Real-time collab, multi-user, accounts, cloud sync.
