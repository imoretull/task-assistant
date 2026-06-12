import type { SeedData } from "../seed.js";

/**
 * Demo workspace for the lean Today / Backlog / History model.
 *
 * Shows every behavior at a glance:
 *   - Today: fresh tasks, carried tasks with age badges (1d / 2d / 4d / 6d),
 *     and a couple finished today (struck through at the bottom).
 *   - Backlog: an undated, guilt-free pile ready to pull into Today.
 *   - History: a week of completed days for the feel-good scroll.
 *   - Notes attached to several tasks (note dot), plus standalone notes
 *     for the Notes tab.
 *
 * Projects are short shorthands (DMA, Atlas, Ledger, Mobile) so the
 * quick-add prefix syntax ("DMA - fix login test") matches them.
 */
export function demoSeed(): SeedData {
  return {
    tags: [
      // projects (colored chips at the front of task rows)
      { name: "DMA", color: "blue", kind: "project" },
      { name: "Atlas", color: "purple", kind: "project" },
      { name: "Ledger", color: "green", kind: "project" },
      { name: "Mobile", color: "amber", kind: "project" },
      // plain tags
      { name: "meeting", color: "gray" },
      { name: "ideas", color: "amber" },
      { name: "inbox", color: "gray" },
    ],
    items: [
      // ───────────────────────── TODAY — open ─────────────────────────
      {
        id: "T-0001",
        type: "task",
        title: "Fix login e2e flake",
        // Note: don't mix plain bullets and "- [ ]" checkboxes in one body —
        // tiptap-markdown renders a stray empty checkbox between the lists.
        body:
          "Fails ~1 in 5 runs on CI. Suspect a race in the session cookie setup.\n\n" +
          "CI run: https://ci.example.com/runs/48211\n\n" +
          "Repro: `npm run e2e -- --grep login` with `--repeat 10`\n\n" +
          "- [ ] Check if `waitForCookie` races the redirect\n" +
          "- [ ] Ask Sam if the seed user changed",
        status: "today",
        carriedDays: 4,
        ageDays: -4,
        tags: ["DMA"],
      },
      {
        id: "T-0002",
        type: "task",
        title: "Draft release notes for 2.14",
        body: "",
        status: "today",
        carriedDays: 6,
        ageDays: -6,
        tags: ["Mobile"],
      },
      {
        id: "T-0003",
        type: "task",
        title: "Bump staging TLS certs",
        body: "Expire Friday. Same runbook as last quarter — see the on-call wiki page.",
        status: "today",
        carriedDays: 2,
        ageDays: -2,
        tags: ["Ledger"],
      },
      {
        id: "T-0004",
        type: "task",
        title: "Review PR #482 — retry idempotency",
        body: "",
        status: "today",
        carriedDays: 1,
        ageDays: -1,
        tags: ["Atlas"],
      },
      {
        id: "T-0005",
        type: "task",
        title: "Prep 1-1 agenda for Sam",
        body:
          "- Flaky suite ownership — who takes it next sprint?\n" +
          "- Conference budget question\n" +
          "- Kudos for the payout fix",
        status: "today",
        tags: [],
      },
      {
        id: "T-0006",
        type: "task",
        title: "Send standup summary to the channel",
        body: "",
        status: "today",
        tags: ["meeting"],
      },

      // ─────────────────────── TODAY — done today ──────────────────────
      {
        id: "T-0007",
        type: "task",
        title: "Approve Datadog overage",
        body: "One-time ~$8.4k from the incident week. Approved; sampling rule requested.",
        status: "done",
        ageDays: -1,
        tags: ["Ledger"],
      },
      {
        id: "T-0008",
        type: "task",
        title: "Reply to vendor security questionnaire",
        body: "",
        status: "done",
        ageDays: -2,
        tags: [],
      },

      // ───────────────────────────── BACKLOG ───────────────────────────
      {
        id: "T-0009",
        type: "task",
        title: "Refactor auth retry helper",
        body: "Three near-identical copies across services. Extract into the shared client lib.",
        status: "backlog",
        ageDays: -9,
        tags: ["DMA"],
      },
      {
        id: "T-0010",
        type: "task",
        title: "Write ADR for queue consolidation",
        body: "",
        status: "backlog",
        ageDays: -12,
        tags: ["Atlas"],
      },
      {
        id: "T-0011",
        type: "task",
        title: "Clean up the flaky-test dashboard",
        body: "",
        status: "backlog",
        ageDays: -8,
        tags: ["DMA"],
      },
      {
        id: "T-0012",
        type: "task",
        title: "Spike: local-first sync for the mobile app",
        body: "Look at libsql embedded replicas vs. CRDT layer. Timebox to a day.",
        status: "backlog",
        ageDays: -15,
        tags: ["Mobile", "ideas"],
      },
      {
        id: "T-0013",
        type: "task",
        title: "Move CI to larger runners",
        body: "",
        status: "backlog",
        ageDays: -20,
        tags: [],
      },
      {
        id: "T-0014",
        type: "task",
        title: "Plan Q3 brown-bag schedule",
        body: "",
        status: "backlog",
        ageDays: -6,
        tags: ["ideas"],
      },
      {
        id: "T-0015",
        type: "task",
        title: "Archive stale feature branches",
        body: "",
        status: "backlog",
        ageDays: -11,
        tags: [],
      },

      // ───────────────────────────── HISTORY ───────────────────────────
      // yesterday
      {
        id: "T-0016",
        type: "task",
        title: "Ship hotfix 2.13.1",
        body: "Crash on resume when the token refresh raced the splash screen. Patched + released.",
        status: "done",
        doneDaysAgo: 1,
        ageDays: -2,
        tags: ["Mobile"],
      },
      {
        id: "T-0017",
        type: "task",
        title: "Fix null deref in payout worker",
        body: "",
        status: "done",
        doneDaysAgo: 1,
        ageDays: -3,
        tags: ["Ledger"],
      },
      {
        id: "T-0018",
        type: "task",
        title: "Triage inbox to zero",
        body: "",
        status: "done",
        doneDaysAgo: 1,
        ageDays: -1,
        tags: [],
      },
      {
        id: "T-0019",
        type: "task",
        title: "Pair with Sam on the flaky suite",
        body: "Found two tests sharing a seed user. Split the fixtures; one more suspect left.",
        status: "done",
        doneDaysAgo: 1,
        ageDays: -2,
        tags: ["DMA"],
      },
      // 2 days ago
      {
        id: "T-0020",
        type: "task",
        title: "Update the on-call runbook",
        body: "",
        status: "done",
        doneDaysAgo: 2,
        ageDays: -4,
        tags: ["Ledger"],
      },
      {
        id: "T-0021",
        type: "task",
        title: "Demo prep for stakeholder review",
        body: "",
        status: "done",
        doneDaysAgo: 2,
        ageDays: -3,
        tags: ["Atlas"],
      },
      {
        id: "T-0022",
        type: "task",
        title: "File expense report",
        body: "",
        status: "done",
        doneDaysAgo: 2,
        ageDays: -2,
        tags: [],
      },
      // 3 days ago
      {
        id: "T-0023",
        type: "task",
        title: "Quarterly access review",
        body: "",
        status: "done",
        doneDaysAgo: 3,
        ageDays: -5,
        tags: [],
      },
      {
        id: "T-0024",
        type: "task",
        title: "Write sprint retro notes",
        body: "Keep: pairing rotation. Drop: Friday deploys. Try: flaky-test budget per sprint.",
        status: "done",
        doneDaysAgo: 3,
        ageDays: -3,
        tags: ["meeting"],
      },
      // 5 days ago
      {
        id: "T-0025",
        type: "task",
        title: "Close out incident follow-ups",
        body: "",
        status: "done",
        doneDaysAgo: 5,
        ageDays: -8,
        tags: ["Ledger"],
      },
      {
        id: "T-0026",
        type: "task",
        title: "Renew npm token before expiry",
        body: "",
        status: "done",
        doneDaysAgo: 5,
        ageDays: -6,
        tags: [],
      },
      {
        id: "T-0027",
        type: "task",
        title: "Book travel for the offsite",
        body: "",
        status: "done",
        doneDaysAgo: 5,
        ageDays: -7,
        tags: [],
      },
      // 6 days ago
      {
        id: "T-0028",
        type: "task",
        title: "Update dependencies (patch round)",
        body: "",
        status: "done",
        doneDaysAgo: 6,
        ageDays: -7,
        tags: ["DMA"],
      },
      {
        id: "T-0029",
        type: "task",
        title: "Fix mobile build cache misses",
        body: "",
        status: "done",
        doneDaysAgo: 6,
        ageDays: -9,
        tags: ["Mobile"],
      },

      // ────────────────────────────── NOTES ────────────────────────────
      {
        id: "N-0001",
        type: "note",
        title: "Standup notes — Mon",
        body:
          "Anna is finishing the API migration today. Ben blocked on the design review, " +
          "will ping Carla. I need to follow up on the perf regression before Thursday.",
        status: null,
        ageDays: -1,
        tags: ["meeting"],
      },
      {
        id: "N-0002",
        type: "note",
        title: "Architecture sketch — sync layer",
        body:
          "Local file is the source of truth; sync is an upgrade path, not a dependency.\n\n" +
          "- [ ] Compare libsql embedded replicas vs. CRDT\n" +
          "- [ ] What does conflict UX look like for notes?\n" +
          "- [ ] Cost of a sync sidecar per workspace",
        status: null,
        ageDays: -5,
        tags: ["ideas", "Mobile"],
      },
      {
        id: "N-0003",
        type: "note",
        title: "Links: perf tooling",
        body:
          "- https://example.com/flamegraph-howto\n" +
          "- https://example.com/react-profiler-notes\n" +
          "- `node --cpu-prof` + speedscope for the worker",
        status: null,
        ageDays: -10,
        tags: ["ideas"],
      },
      {
        id: "N-0004",
        type: "note",
        title: "Q3 planning — raw notes",
        body:
          "Three themes on the table: reliability (post-incident), Mobile v3 GA, and the " +
          "platform consolidation bet. Finance wants the cost story tightened before the " +
          "board deck goes out.",
        status: null,
        ageDays: -3,
        tags: ["meeting", "Atlas"],
      },
    ],
  };
}
