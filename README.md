# TaskNotes

A **local-first, prompt-driven task & notes manager** for one person on a software team.
Capture a thought in two keystrokes mid-meeting, organize everything with tags, manage
tasks on a JIRA/Linear-style board, keep notes as clean modular cards — and run **LLM
prompts against any items by ID** (clean up grammar, summarize, consolidate, suggest
tasks) through a swappable provider. Everything stays on your machine.

> 📸 *Screenshots / GIF coming soon.*

---

## 🚀 2-step install

**The only prerequisite is [Node.js LTS](https://nodejs.org) (≥ 18.18).** Nothing else —
no admin rights, no Python, no C/C++ build tools, no Docker, no database server.
Works identically on **Mac and Windows**, including locked-down corporate machines
behind proxies. Every dependency is pure JS / prebuilt; `npm install` compiles nothing.

```sh
git clone <repo>   # or download the zip
npm install
npm run dev        # opens http://localhost:5173
```

First run requires **no API key and no internet** for app features — the Assistant uses a
deterministic **MockProvider** by default, and the SQLite database is created and
seeded automatically at `data/app.db`.

`npm run dev` starts both processes:

| Process | What | Where |
|---|---|---|
| `web` | Vite + React UI | http://localhost:5173 |
| `server` | Express sidecar (DB + LLM provider) | http://localhost:8787 (proxied at `/api`) |

---

## What's inside

- **Board** — Backlog → Todo → In Progress → Blocked → Done. Drag between columns to
  change status, drag within a column to reorder, star to pin to the top.
- **Notes** — Apple-Notes-style card grid. Markdown editor with live preview,
  auto-saved (~500 ms debounce). A note converts to a task in one click (keeps its `N-` id).
- **Tags in three sections** — the sidebar groups tags into **Projects**, **People**,
  and **Tags** (each tag has a `kind`). Multi-select filtering across all sections
  (AND/OR toggle), full CRUD, counts everywhere, and a "Move to…" menu to re-section
  a tag. Filter by a project, a person, or any combination.
- **Command palette** — `Cmd/Ctrl-K`: quick-add, jump to any item by id/title, switch
  views, toggle theme.
- **Quick capture** — `Cmd/Ctrl-N` drops a note into the `inbox` tag instantly;
  `Cmd/Ctrl-Shift-N` creates a task. On a focused card: `s` star, `[` / `]` move
  column, `Delete` trash, `Enter` open.
- **Assistant** — saved prompts that act on one or more item IDs (see below).
- **Light/dark mode** — system default on first run, persisted, token-driven.
- **Trash** — soft delete with restore; nothing is destroyed without confirmation.
- **Multiple databases** — a header dropdown switches between independent SQLite
  files. Ships with **My workspace** (your data) and a richly-seeded **Demo —
  Director of SW Dev** (a full day across 5 projects). Each database is its own file,
  so the two never bleed into each other (see below).

## Stack

| Layer | Choice |
|---|---|
| Frontend | Vite + React + TypeScript, Tailwind CSS over CSS-variable design tokens, Radix UI primitives, `@dnd-kit`, TanStack Query, `react-markdown` |
| Sidecar | Node + Express (owns the DB and the LLM key — the key never reaches the browser) |
| Database | SQLite via **`@libsql/client`** (no native build) + **Drizzle ORM**, local file `data/app.db` |
| LLM | `LLMProvider` interface → `MockProvider` (default) or `ClaudeProvider` |

> **Why libsql, not better-sqlite3?** `better-sqlite3` compiles C++ on install (needs
> Python + VS Build Tools / Xcode CLT) and fails on locked-down machines. libsql
> installs as plain JS, keeps a real local SQLite file, and is the documented path to
> Turso sync later (not implemented — see Phase 2).

## Databases & migrations

The app supports **multiple independent databases**, switchable from the header
dropdown. Each is its own SQLite file under `data/` and is migrated + seeded on server
start:

| Database | File | Contents |
|---|---|---|
| **My workspace** | `data/app.db` | Your own tasks and notes |
| **Demo — Director of SW Dev** | `data/demo.db` | A seeded day-in-the-life: ~20 tasks across all board columns + 11 meeting notes, spanning 5 projects (`phoenix`, `atlas`, `ledger`, `mobile-v3`, `platform`) and the usual director work — incidents, hiring loops, 1-1s, exec syncs, budget, roadmap |

**Switching is atomic.** The active database is sent as an `X-Database` request header;
the sidecar keeps one connection per file and routes every read/write to the selected
one. A write to *demo* never touches *app.db*, and IDs are sequenced per database.
React Query caches are namespaced by database, so switching shows the right data with no
bleed-through. Register more databases in
[server/db/databases.ts](server/db/databases.ts) with a matching seed in
`server/db/seeds/`.

- Delete a `data/*.db` file to start that database fresh — it re-creates and re-seeds on
  next start (seeding is idempotent and skipped when the database already has items).
- Schema lives in [server/db/schema.ts](server/db/schema.ts); SQL migrations are
  generated into `drizzle/` and **applied automatically when the server starts**.
- Scripts: `npm run db:generate` (new migration after a schema change),
  `npm run db:migrate` (apply manually), `npm run db:studio` (browse the DB in
  Drizzle Studio).

### Data model — one table, two views

Tasks and notes share **one `items` table**. A *task* is an item with a `status`
(`backlog | todo | in_progress | blocked | done`); a *note* has `status = null`. That's
why a note can become a task instantly and tags work uniformly.

| field | notes |
|---|---|
| `id` | `T-0012` / `N-0004` — stable for life, shorthand `T-12` accepted in lookups |
| `type` | `task` \| `note` |
| `title`, `body` | body is raw markdown, autosaved |
| `status` | board column, `null` for notes |
| `priority` | `low / medium / high / urgent` |
| `difficulty` | `xs / s / m / l / xl` |
| `starred` | pinned to top |
| `due_date`, `sort_order` | manual drag order persists in `sort_order` |
| `created_at`, `updated_at`, `deleted_at` | soft delete → Trash |

Plus `tags` (id, unique name, color) and `item_tags` (many-to-many).

## The Assistant (LLM prompts)

One endpoint: `POST /api/assistant` with `{ promptId | promptText, itemIds?, tagIds? }`.
The sidecar loads those items (+ tags), builds the prompt, calls the configured
`LLMProvider`, and returns the result. Results are **always previewed** — Accept /
Discard before anything overwrites content.

Built-in saved prompts:

1. **Clean up grammar & spelling** — preview, then replace the body.
2. **Summarize & extract next steps** — one item.
3. **Make sense of meeting notes** — paste a raw transcript into a note, get
   summary + decisions + next steps.
4. **Consolidate across notes** — multi-item; pick items (⌘/Ctrl-click cards) or scope
   by tags (e.g. all notes tagged `standup` **and** `olympic`).
5. **Suggest tasks** — proposes tasks from a note; one-click creates them on the board.

Runnable from: the detail modal's Assistant panel, multi-select in any view, and the
command palette lists the prompt library.

### Plugging in a real LLM

```sh
cp .env.example .env
# in .env:
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-...
# optional: ANTHROPIC_MODEL=claude-opus-4-8
npm run dev
```

Providers implement one interface (`generate({ system, messages }) → text`) in
[server/llm/provider.ts](server/llm/provider.ts). The mock provider keeps the entire UX
working offline; the Claude provider is wired but optional. Add another vendor by
dropping in a third implementation.

## Scope

**Phase 1 (this repo):** everything above.

**Phase 2 (explicitly not built):** Outlook/Teams sync or message ingestion (the meeting
feature is paste-text only), real-time collaboration / multi-user / auth, cloud sync
(libsql → Turso is the documented upgrade path), any required LLM key.

## Troubleshooting

- **Corporate proxy:** `npm install` honors standard npm proxy config
  (`npm config set proxy http://… / https-proxy http://…`). After install, the app
  itself needs no internet (MockProvider).
- **TLS-inspecting proxy** (`UNABLE_TO_VERIFY_LEAF_SIGNATURE` during install): point
  npm at your company root CA — `npm config set cafile <path-to-corp-root-ca.pem>` —
  or, as a last resort for the install only, `npm install --strict-ssl=false`.
- **Node version:** requires Node ≥ 18.18 — check with `node --version`; install the
  current LTS from nodejs.org (user-level install, no admin needed).
- **Port in use:** the sidecar uses `8787`, the UI `5173`. Set `PORT` in `.env`
  (and adjust the proxy in [vite.config.ts](vite.config.ts)) if either collides.
- **Reset the database:** stop the app and delete `data/app.db`.

## License

[MIT](LICENSE)
