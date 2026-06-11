# Build Spec — "TaskNotes" (working title)

A local-first, prompt-driven **task & notes manager** for an individual on a software
team (developer, QA, manager, VP). Single-user. Runs on localhost from VS Code.
Designed to be LLM-ready so prompts can clean up, summarize, and synthesize tasks
and notes — provider-swappable (Claude API or GitHub Copilot), but **no real LLM
calls are required for Phase 1** (use a mock/stub).

Build the whole of **Phase 1** below. Do **not** build anything marked Phase 2.

---

## 0. Install constraints (HARD requirement — non-negotiable)

This must be **plug-and-play for corporate work users on Mac AND Windows**, including
machines **without admin rights, without a C/C++ compiler, without Python**, and behind
corporate proxies. The entire setup must be:

```
git clone <repo>      # (or download zip)
npm install           # pure JS — compiles nothing
npm run dev           # opens localhost, app runs
```

Rules the build MUST follow:
- **Only Node.js is a prerequisite** (a single official installer; LTS). Nothing else.
- **No native/compiled dependencies.** Do not use any package that runs node-gyp or
  builds C/C++ on install (this is why `better-sqlite3` is banned — see §2).
- **No global installs, no admin/sudo, no system services**, no Docker, no separate DB
  engine. Everything is local files inside the project folder.
- **Identical commands on Mac and Windows.** No OS-specific shell scripts in the happy
  path; npm scripts must be cross-platform (use `cross-env` if an env var is needed).
- App runs fully **offline** with the **MockProvider** — first run requires no API key
  and no internet.
- If any chosen library turns out to need a compiler, **replace it** with a pure-JS
  equivalent rather than documenting a build-tools workaround.

---

## 1. Goals (what "done" means)

1. Capture a task or note in **one or two keystrokes**, mid-meeting, without friction.
2. Organize everything with **tags** (Apple-Notes-style multi-select filtering).
3. Manage tasks on a **JIRA/Linear-style board** (drag between columns, reorder by
   priority, star to pin).
4. Manage notes as **clean modular cards** (not long documents), markdown, auto-saved.
5. Run **LLM prompts against one or more items by ID** to clean up grammar, summarize,
   extract next steps, consolidate, or suggest tasks — through a swappable provider.
6. Feel like a **premium paid tool**: clean, minimal, modern, fast, light/dark mode.

---

## 2. Tech stack (use exactly this)

- **Frontend:** Vite + React + TypeScript. Launchable from VS Code via `npm run dev`
  on `localhost`.
- **Backend sidecar:** a small **Node + Express** server (run with `npm run server`,
  or concurrently via `npm run dev`). It owns the database and the LLM provider so the
  API key is never exposed to the browser.
- **Database:** **SQLite via `@libsql/client` (pure-JS, NO native build) + Drizzle
  ORM**, local file `data/app.db`, zero external server. Drizzle Kit for migrations.
  **Do NOT use `better-sqlite3`** — it compiles C++ on install (needs Python +
  VS Build Tools / Xcode CLT) and fails on locked-down corporate machines. libsql
  installs as plain JS, keeps a real local SQLite file, and is also the documented
  Turso sync upgrade path (do not implement sync now). See §0 install constraints.
- **Styling:** **Tailwind CSS** with **CSS-variable design tokens** for theming
  (light/dark). Drive Tailwind theme from the token variables in §4 (Design system) — do not hardcode
  colors/spacing in components. (Decision locked: Tailwind, not CSS Modules.)
- **UI primitives:** **Radix UI** (unstyled, accessible) for modal/dropdown/popover/
  tooltip/command-palette, styled with the tokens. Don't hand-roll a11y behavior.
- **Drag & drop:** `@dnd-kit` (board columns + within-column reordering).
- **Markdown editor:** keep it simple, Apple-Notes-like. A lightweight markdown
  textarea with live preview and bold/italic/list/checkbox toolbar (e.g. a small
  editor lib or a controlled textarea). Store raw markdown.
- **State/data fetching:** TanStack Query (React Query) against the Express API.

> Rationale: a Node sidecar keeps the LLM key out of the browser and runs a real local
> DB. Using **pure-JS libsql** means the whole app installs with `npm install` alone —
> no compiler, no admin rights — on both Mac and Windows. Everything stays on the
> developer's machine.

> **Every dependency in this stack must be pure-JS / prebuilt — no module that compiles
> native code on install.** If a library needs node-gyp, pick an alternative. (libsql,
> @dnd-kit, Radix, TanStack Query, Tailwind, the markdown editor are all fine.)

---

## 3. Data model (one unified model, two views)

**Decision: tasks and notes share ONE table.** A *task* is just an item with a
`status`. A *note* is an item without board status (or `status = null`). This avoids
two tag systems and lets a note become a task instantly. Two views render the same
data differently.

### `items` table
| field        | type                                                                 | notes |
|--------------|----------------------------------------------------------------------|-------|
| `id`         | text PK                                                              | `T-0012` for tasks, `N-0004` for notes. Stable for the item's life; does not change if type changes (keep the original prefix). Zero-padded to 4 digits, accept `T-12` / `N-4` shorthand in lookups. |
| `type`       | `'task' \| 'note'`                                                    | |
| `title`      | text                                                                 | one line |
| `body`       | text (markdown)                                                      | autosaved |
| `status`     | `'backlog' \| 'todo' \| 'in_progress' \| 'blocked' \| 'done' \| null`| null for notes |
| `priority`   | `'low' \| 'medium' \| 'high' \| 'urgent'`                            | |
| `difficulty` | `'xs' \| 's' \| 'm' \| 'l' \| 'xl'` (or 1–5)                          | "how hard" sort |
| `starred`    | boolean                                                              | pinned to top |
| `due_date`   | date (nullable)                                                      | |
| `sort_order` | real / integer                                                       | manual order within a column or grid (drag up/down) |
| `created_at` | datetime                                                            | |
| `updated_at` | datetime                                                            | |
| `deleted_at` | datetime (nullable)                                                 | **soft delete** → trash, undo-able |

### `tags` table
`id` (PK), `name` (unique), `color` (optional). Project names are just tags.

### `item_tags` join table
`item_id`, `tag_id` (many-to-many).

### Counts
Provide tag counts (items per tag) and view counts (total tasks, total notes,
per-column counts).

---

## 4. Design system — "premium minimal" (build to this, not to vibes)

The premium-minimal look is achieved with **disciplined tokens**, a **tight monochrome
gray scale + exactly one accent**, and **typographic density** — not decoration.
Benchmarks: Linear (instrument-panel density, 1px borders, single accent), Apple Notes
(calm, content-first), Notion (generous whitespace). Define everything as **CSS
variables (primitive → semantic)** and drive Tailwind from them. No hardcoded
colors/spacing in components.

### Core principles
- **Monochrome + one accent.** A cool-gray scale carries the whole UI; **one** accent
  color, rationed to **one primary action per screen** (primary button, active nav,
  focus ring, selected tag). Status colors (priority/board) are the only other hues and
  stay muted.
- **Borders over fills.** Cards/surfaces get presence from **1px inset borders + subtle
  elevation**, not gray fills. Keep a narrow 4-step surface stack (canvas → raised →
  overlay → popover).
- **Dark mode = luminance hierarchy, not shadows.** On dark surfaces **shadows don't
  read** — elevate by making higher surfaces *lighter*, not by adding drop shadows.
  Light mode may use soft shadows; dark mode must not rely on them. Use slightly
  **heavier text weight** in dark mode for legibility.
- **Density with breathing room.** Compact, information-dense, but consistent spacing.
- **Accessibility floor:** WCAG **AA** contrast minimum (4.5:1 body text); visible focus
  rings on every interactive element; full keyboard operability.

### Tokens (starting values — tune, but keep the structure)
- **Type:** **Inter Variable** (system-ui fallback). Weights ~450/510/590. Sizes:
  12 / 13 / 14(base) / 16 / 20 / 24. Line-height 1.4–1.5. Tabular-nums for IDs/dates.
- **Spacing scale (4px base):** 4, 8, 12, 16, 20, 24, 32, 48.
- **Radius:** sm 6px, md 8px (cards), lg 12px (modals), full (chips/avatars).
- **Elevation (light):** subtle layered shadows; **(dark):** surface-lightening steps.
- **Motion:** 120–160ms ease-out for hover/press/expand; respect
  `prefers-reduced-motion`. No bouncy/long animations.
- **Semantic color tokens** (define for both themes):
  `--bg-canvas`, `--bg-raised`, `--bg-overlay`, `--bg-popover`,
  `--border-subtle`, `--border-strong`,
  `--text-primary`, `--text-secondary`, `--text-muted`,
  `--accent`, `--accent-fg`, `--focus-ring`,
  `--priority-{low,medium,high,urgent}`, `--status-{backlog,todo,in_progress,blocked,done}`.
  Reference primitives (raw gray/accent ramp) underneath; components use **semantic**
  tokens only.

### Component conventions
- **Cards:** 1px border, md radius, hover = faint border/elevation lift only. No heavy
  fills. Star/priority/tags as small muted chips.
- **Chips/tags:** low-saturation, rounded-full, count badges in muted gray.
- **Buttons:** one accent primary; everything else ghost/secondary (border or text).
- **Empty/loading states** designed (skeletons, calm empty prompts) — part of premium.

---

## 5. Layout & UI

### Three-pane shell
- **Left pane — Tags & navigation**
  - Top: nav — **All**, **Tasks** (board), **Notes** (grid), **Starred**, **Trash**.
  - Tag list with **CRUD** (add / rename / recolor / delete) and a **count** next to
    each tag.
  - **Multi-select tags** Apple-Notes-style: click to toggle on/off, multiple active
    at once, clear-all. Active tags filter the main pane (AND semantics; expose an
    AND/OR toggle if cheap).
- **Center pane — the active view** (Board or Notes grid, see §6/§7).
- **Right pane / modal — detail + LLM** (opens when a card is clicked, see §8/§9).

### Global
- **Command palette** (`Cmd/Ctrl-K`): quick-add task, quick-add note, jump to item by
  ID/title, run a saved prompt. This is the "premium tool" centerpiece — keyboard-first.
- **Quick capture**: a single shortcut (e.g. `Cmd/Ctrl-N`) drops a new note into an
  inbox so a thought is captured instantly during a meeting; tag/triage later.
- **Light/Dark mode** toggle, persisted. System-default on first run.
- **Auto-save** everywhere (debounced ~500ms). No explicit save button.
- Keyboard shortcuts for star, move column, archive/delete, new item.

---

## 6. Task view — board

- **Columns:** Backlog → Todo → In Progress → Blocked → Done.
- **Drag a card between columns** to change status; **also** change status via a
  dropdown inside the card detail.
- **Drag up/down within a column** to set priority/emphasis (persists `sort_order`).
- **Mini card (closed state):** clean and minimal — title, ID (`T-0012`), priority
  chip, due date, tag chips, **star** toggle. Starred cards sort to the top of their
  column.
- **Filtering & sorting:** filter by active tags (incl. project tag), starred, status.
  Sort by **priority**, **due date**, **difficulty**, **created date**. Must be able to
  see *all cards across all projects* or filter to one project — multiple convenient
  filters combine.
- **Click a card** → opens the detail modal (§8).

---

## 7. Notes view — card grid

- **Modular note cards**, Apple-Notes-style — short, taggable, not long Confluence docs.
- Filtering by active tags shows the matching cards; click a card to open its editor.
- **Counts** shown (total notes, per active filter).
- **Click a card** → opens a slightly larger detail modal with a markdown editor (§8),
  bold/italic/lists/checkboxes, live preview. Auto-saves.
- A note can be **converted to a task** (gets a board status; keeps its `N-` id or
  optionally re-issues — keep `N-` for simplicity and just set a status).

---

## 8. Detail modal (shared by tasks & notes)

- Title, ID, markdown body editor, tags (add/remove inline), priority, difficulty,
  due date, status dropdown (tasks), star, created/updated timestamps.
- **Auto-save** on change. **Soft-delete** to Trash with undo.
- An **"Assistant" panel** (§9) to run prompts on this item.

---

## 9. LLM prompt integration (provider-swappable, mock in Phase 1)

The defining feature. LLM features are **discrete prompts that act on one or more item
IDs**, routed through the Express sidecar.

### Architecture
- A single endpoint, e.g. `POST /api/assistant`, body `{ promptId | promptText,
  itemIds: ["N-0004", "N-0007"] }`.
- The sidecar loads those items (+ their tags), builds the prompt, calls a
  **`LLMProvider` interface** (`generate(messages) → text`), and returns the result.
- Ship **two providers** behind the interface: a **`MockProvider`** (default,
  deterministic canned/echo transforms so the full UX works with no key) and a stubbed
  **`ClaudeProvider`** (reads `ANTHROPIC_API_KEY` from env; wired but optional). Select
  via env var. **Do not require a real key to run the app.**

### Built-in saved prompts (a small prompt library — presets the user can pick)
1. **Clean up grammar/spelling** — rewrites the body of an item in place (with a
   confirm/preview before replacing). The "fix grammar quickly during meetings" case.
2. **Summarize & extract next steps** — for one item.
3. **Make sense of pasted meeting notes** — user pastes raw Teams audio-transcript
   text into a note; prompt produces a clean summary + decisions + next steps. (Just a
   note + this preset — no Teams integration.)
4. **Consolidate across notes** — run over *multiple* items selected by ID or by
   tag(s), e.g. "read all notes with tag `standup` + tag `olympic` and consolidate /
   recommend." Multi-select items or pick tags as the prompt scope.
5. **Suggest tasks / next steps** — propose tasks from a note; user can one-click
   create them as task cards.

### UX
- Prompts are runnable from: the detail modal Assistant panel, multi-select in a view,
  the command palette, and a tag-scoped action ("run prompt on all items with these
  tags").
- Always **preview** an LLM result before it overwrites content; offer Accept / Discard.

---

## 10. Explicitly OUT of scope (Phase 2 — do NOT build)

- Outlook / Teams sync or message ingestion (the meeting feature is only paste-text).
- Real-time collaboration, multi-user, accounts/auth.
- Cloud sync (libsql/Turso) — leave the swap path documented only.
- A real shipped LLM key requirement — mock provider must suffice to run everything.

---

## 11. Project setup & deliverables

- **Open source**, ready for a GitHub repo.
- **README.md** with: what it is, screenshots/gif placeholder, the stack, a
  **prominent "2-step install" section** (`npm install` → `npm run dev`) stating the
  **only prerequisite is Node.js LTS** and that it works on Mac + Windows with **no
  admin rights and no build tools** (per §0), how the SQLite DB and migrations work,
  how to plug in a real LLM provider via env (`ANTHROPIC_API_KEY`), the data model, and
  the Phase-1 / Phase-2 scope split. Include a short Troubleshooting note (proxy / Node
  version).
- Sensible defaults so a fresh clone runs immediately with the **MockProvider** and a
  freshly migrated empty (or lightly seeded) database.
- `.gitignore` (node_modules, `data/*.db`, `.env`), `.env.example`, scripts in
  `package.json` (`dev`, `server`, `build`, `db:migrate`, `db:studio`).
- LICENSE (MIT).

---

## 12. Suggested build order

1. Scaffold Vite+React+TS, Tailwind, **Radix UI**, and the **design-token layer (§4)**:
   define the CSS-variable primitives + semantic tokens for light/dark first, wire
   Tailwind to them, build a tiny token/theme preview page. Establish this before any
   feature UI so nothing hardcodes color/spacing.
2. Express sidecar + **libsql (pure-JS)** + Drizzle schema/migrations; seed a few
   items/tags. Verify `npm install` compiles nothing on a clean Mac and Windows.
3. REST API: items CRUD, tags CRUD, tagging, soft-delete/trash, reorder.
4. Three-pane shell + left tag pane (CRUD, counts, multi-select filtering).
5. Notes grid + detail modal + markdown editor + autosave.
6. Task board (@dnd-kit): columns, drag between/within, star, filters, sorts.
7. Command palette + quick capture + keyboard shortcuts.
8. Assistant: `/api/assistant`, `LLMProvider` interface, MockProvider, saved prompts,
   preview/accept flow; stub ClaudeProvider.
9. Polish, README, license, repo.
