import type { SeedData } from "../seed.js";

/**
 * Demo workspace — a day in the life of Priya Raman, Director of Software
 * Development. Spans 5 active projects, two direct-report teams, a full
 * meeting schedule, and the usual mix of strategic, managerial, hiring,
 * budget, and firefighting work. Tasks land across every board column and
 * notes capture real meeting output, so every feature (board, grid, tags,
 * multi-select, the Assistant prompts) has rich material to work on.
 *
 * Tag taxonomy:
 *   Projects   — phoenix, atlas, ledger, mobile-v3, platform
 *   Cadence    — standup, 1-1, staff-meeting, exec, planning
 *   Categories — hiring, budget, incident, roadmap, vendor, eng-process,
 *                people, inbox
 */
export function demoSeed(): SeedData {
  return {
    tags: [
      // projects (own sidebar section)
      { name: "phoenix", color: "purple", kind: "project" },
      { name: "atlas", color: "blue", kind: "project" },
      { name: "ledger", color: "green", kind: "project" },
      { name: "mobile-v3", color: "amber", kind: "project" },
      { name: "platform", color: "red", kind: "project" },
      // people (own sidebar section)
      { name: "marcus", color: "green", kind: "person" }, // Staff eng, Ledger — promo candidate
      { name: "anna", color: "blue", kind: "person" }, // Atlas tech lead
      { name: "sandra", color: "purple", kind: "person" }, // VP Engineering (my manager)
      { name: "wei-zhang", color: "amber", kind: "person" }, // Sr Staff candidate, Platform
      { name: "carla", color: "red", kind: "person" }, // Mobile lead
      { name: "devin", color: "gray", kind: "person" }, // Mobile lead
      { name: "dana", color: "blue", kind: "person" }, // AppSec lead
      // cadence / meetings
      { name: "standup", color: "green" },
      { name: "1-1", color: "blue" },
      { name: "staff-meeting", color: "gray" },
      { name: "exec", color: "purple" },
      { name: "planning", color: "amber" },
      // categories
      { name: "hiring", color: "blue" },
      { name: "budget", color: "green" },
      { name: "incident", color: "red" },
      { name: "roadmap", color: "purple" },
      { name: "vendor", color: "amber" },
      { name: "eng-process", color: "gray" },
      { name: "team-mgmt", color: "blue" },
      { name: "inbox", color: "gray" },
    ],
    items: [
      // ───────────────────────── URGENT / BLOCKED — firefighting ─────────────
      {
        id: "T-0001",
        type: "task",
        title: "Sign off on SEV-2 incident retro for Ledger payouts",
        body:
          "Friday's double-charge incident on Ledger payouts. Need the retro published before the exec sync.\n\n" +
          "- [x] Confirm blast radius with on-call (412 customers, all refunded)\n" +
          "- [ ] Approve the 5-whys writeup from Marcus\n" +
          "- [ ] Add the idempotency-key action item to the Ledger roadmap\n" +
          "- [ ] Send customer-comms summary to Support lead\n\n" +
          "**Root cause:** retry logic in the payout worker wasn't idempotent; a deploy-time timeout triggered duplicate sends.",
        status: "in_progress",
        priority: "urgent",
        difficulty: "m",
        starred: true,
        ageDays: -1,
        tags: ["ledger", "incident", "marcus"],
      },
      {
        id: "T-0002",
        type: "task",
        title: "Unblock Atlas: security review stuck 6 days in AppSec queue",
        body:
          "Atlas SSO launch is gated on an AppSec review that's been queued for 6 days. Launch date at risk.\n\n" +
          "- [ ] Escalate to Dana (AppSec lead) — ask for a slot this week\n" +
          "- [ ] If no movement by EOD, raise in exec sync\n" +
          "- [ ] Confirm with Atlas team what's testable without sign-off",
        status: "blocked",
        priority: "urgent",
        difficulty: "s",
        starred: true,
        ageDays: -2,
        tags: ["atlas", "exec", "dana"],
      },
      {
        id: "T-0003",
        type: "task",
        title: "Approve emergency vendor spend — Datadog overage",
        body:
          "We blew through the Datadog log-ingest tier during the Ledger incident. ~$8.4k overage this cycle.\n\n" +
          "- [ ] Approve the overage (one-time)\n" +
          "- [ ] Ask Platform team to add a sampling rule so this doesn't recur\n" +
          "- [ ] Flag to Finance in the budget review",
        status: "todo",
        priority: "high",
        difficulty: "xs",
        ageDays: -1,
        tags: ["platform", "budget", "vendor"],
      },

      // ───────────────────────── IN PROGRESS — active leadership work ─────────
      {
        id: "T-0004",
        type: "task",
        title: "Finalize Q3 roadmap deck for the board",
        body:
          "3 themes: reliability (post-incident), Mobile v3 GA, and the Platform consolidation bet.\n\n" +
          "- [x] Pull headcount and burn from Finance\n" +
          "- [x] Get project leads to confirm milestones\n" +
          "- [ ] Tighten the Platform ROI slide — exec wants the cost story\n" +
          "- [ ] Dry-run with my staff Thursday",
        status: "in_progress",
        priority: "high",
        difficulty: "l",
        starred: true,
        dueDate: relative(5),
        ageDays: -4,
        tags: ["roadmap", "exec", "planning"],
      },
      {
        id: "T-0005",
        type: "task",
        title: "Close the Senior Staff Engineer loop (Platform)",
        body:
          "Candidate: Wei Zhang. Strong onsite. Two yeses, one mixed on system design.\n\n" +
          "- [x] Read all 5 scorecards\n" +
          "- [ ] Debrief with the panel (scheduled 2pm)\n" +
          "- [ ] Decide: hire / no-hire / extra loop\n" +
          "- [ ] If hire, get the comp band approved by HR",
        status: "in_progress",
        priority: "high",
        difficulty: "m",
        ageDays: -3,
        tags: ["hiring", "platform", "team-mgmt", "wei-zhang"],
      },
      {
        id: "T-0006",
        type: "task",
        title: "Reforecast Mobile v3 GA date with the team",
        body:
          "Original GA was end of Q3. Beta crash rate is still 0.9% (target <0.3%). Need a credible date.\n\n" +
          "- [ ] Review crash clusters with the mobile leads\n" +
          "- [ ] Decide on a 2-week stabilization sprint vs. slip\n" +
          "- [ ] Communicate the new date up before the board deck locks",
        status: "in_progress",
        priority: "high",
        difficulty: "m",
        ageDays: -2,
        tags: ["mobile-v3", "roadmap", "planning", "carla", "devin"],
      },
      {
        id: "T-0007",
        type: "task",
        title: "Write Marcus's promo packet (Staff → Senior Staff)",
        body:
          "Marcus has been operating at Senior Staff for two quarters — led the Ledger incident response and the payout re-architecture.\n\n" +
          "- [ ] Draft impact narrative\n" +
          "- [ ] Collect 3 peer testimonials\n" +
          "- [ ] Submit before the promo committee deadline",
        status: "in_progress",
        priority: "medium",
        difficulty: "m",
        dueDate: relative(9),
        ageDays: -5,
        tags: ["team-mgmt", "ledger", "hiring", "marcus"],
      },

      // ───────────────────────── TODO — this week ────────────────────────────
      {
        id: "T-0008",
        type: "task",
        title: "1-1 prep: Anna (Atlas tech lead) — growth conversation",
        body:
          "Anna asked about the path to TL of a larger team. Come with a concrete development plan, not platitudes.\n\n" +
          "- [ ] Identify a stretch project (the Platform migration?)\n" +
          "- [ ] Line up a mentor outside her team",
        status: "todo",
        priority: "medium",
        difficulty: "s",
        dueDate: relative(1),
        ageDays: -1,
        tags: ["1-1", "atlas", "team-mgmt", "anna"],
      },
      {
        id: "T-0009",
        type: "task",
        title: "Review and approve Phoenix architecture RFC",
        body:
          "Phoenix team wants to move from the shared monolith DB to per-service Postgres. RFC-0042.\n\n" +
          "- [ ] Read the migration + rollback plan\n" +
          "- [ ] Check the on-call cost — are we adding 3 more DBs to page on?\n" +
          "- [ ] Comment or approve",
        status: "todo",
        priority: "medium",
        difficulty: "m",
        ageDays: -2,
        tags: ["phoenix", "eng-process", "roadmap"],
      },
      {
        id: "T-0010",
        type: "task",
        title: "Decide on the contractor renewal for the Atlas frontend",
        body:
          "Two contractors roll off in 3 weeks. $180k/qtr to renew both. Atlas is past its heavy-build phase.\n\n" +
          "- [ ] Get the team's honest read on capacity without them\n" +
          "- [ ] Renew one, drop one? Renew both for one more quarter?",
        status: "todo",
        priority: "medium",
        difficulty: "s",
        dueDate: relative(14),
        tags: ["atlas", "budget", "vendor"],
      },
      {
        id: "T-0011",
        type: "task",
        title: "Respond to VP's question on eng headcount plan for next FY",
        body: "Sandra wants a one-pager: where the 6 new reqs go and why. Tie it to the roadmap themes.",
        status: "todo",
        priority: "high",
        difficulty: "s",
        dueDate: relative(3),
        ageDays: -1,
        tags: ["exec", "hiring", "budget", "inbox", "sandra"],
      },
      {
        id: "T-0012",
        type: "task",
        title: "Approve Platform team's on-call comp proposal",
        body:
          "Platform wants to move to a paid on-call rotation (industry standard). Reasonable, but sets a precedent across the org.\n\n" +
          "- [ ] Check what the other directors are doing\n" +
          "- [ ] Estimate annual cost across all teams if it spreads",
        status: "todo",
        priority: "low",
        difficulty: "s",
        tags: ["platform", "team-mgmt", "budget"],
      },
      {
        id: "T-0013",
        type: "task",
        title: "Schedule skip-level lunches with the Ledger team",
        body: "Haven't done skip-levels in 6 weeks. Ledger morale dipped after the incident — go listen.",
        status: "todo",
        priority: "low",
        difficulty: "xs",
        tags: ["ledger", "team-mgmt", "1-1"],
      },

      // ───────────────────────── BACKLOG — strategic / later ─────────────────
      {
        id: "T-0014",
        type: "task",
        title: "Define the Platform consolidation bet (3 services → 1)",
        body:
          "The big architectural play for next year: collapse the three overlapping internal platforms. Needs a real proposal, not a hallway idea.\n\n" +
          "- [ ] Name an owner / tiger team\n" +
          "- [ ] Rough the migration cost and the savings\n" +
          "- [ ] Socialize with the affected teams before it's a roadmap line",
        status: "backlog",
        priority: "medium",
        difficulty: "xl",
        starred: true,
        tags: ["platform", "roadmap"],
      },
      {
        id: "T-0015",
        type: "task",
        title: "Pilot a trunk-based development model on one team",
        body: "Long-lived feature branches keep biting us with merge hell. Try trunk-based + feature flags on Phoenix first.",
        status: "backlog",
        priority: "low",
        difficulty: "l",
        tags: ["eng-process", "phoenix"],
      },
      {
        id: "T-0016",
        type: "task",
        title: "Refresh the engineering career ladder doc",
        body: "Ladder is 2 years stale and doesn't describe Staff+ well. Causes friction every promo cycle.",
        status: "backlog",
        priority: "low",
        difficulty: "m",
        tags: ["team-mgmt", "hiring", "eng-process"],
      },
      {
        id: "T-0017",
        type: "task",
        title: "Evaluate replacing the legacy CI runner fleet",
        body: "Builds are slow and the self-hosted runners are a maintenance tax. Look at managed options vs. the renewal.",
        status: "backlog",
        priority: "low",
        difficulty: "l",
        tags: ["platform", "vendor", "eng-process", "budget"],
      },

      // ───────────────────────── DONE — recently shipped ─────────────────────
      {
        id: "T-0018",
        type: "task",
        title: "Approve Q2 performance calibrations",
        body: "Calibration across all 4 teams done. Distribution looks healthy; two over-rated cases corrected.",
        status: "done",
        priority: "high",
        difficulty: "m",
        ageDays: -6,
        tags: ["team-mgmt", "planning"],
      },
      {
        id: "T-0019",
        type: "task",
        title: "Ship Phoenix read-replica rollout",
        body: "Read traffic now served from replicas. p95 read latency down 40%. Nice win for the team.",
        status: "done",
        priority: "medium",
        difficulty: "l",
        ageDays: -8,
        tags: ["phoenix", "platform"],
      },
      {
        id: "T-0020",
        type: "task",
        title: "Renew Datadog annual contract",
        body: "Signed the annual renewal at a 12% discount vs. list. Locked the rate before the seat expansion.",
        status: "done",
        priority: "medium",
        difficulty: "s",
        ageDays: -10,
        tags: ["vendor", "budget", "platform"],
      },

      // ───────────────────────── NOTES — a day of meetings ───────────────────
      {
        id: "N-0001",
        type: "note",
        title: "Eng leadership standup — Tue",
        body:
          "**Across teams, blockers first:**\n\n" +
          "- **Ledger** — incident retro draft is up; Marcus owns it. Team is shaken, watch morale.\n" +
          "- **Atlas** — SSO launch still blocked on AppSec review (6 days). I'm escalating today.\n" +
          "- **Phoenix** — read-replica rollout shipped, p95 down 40%. RFC-0042 (per-service DBs) needs my review.\n" +
          "- **Mobile v3** — beta crash rate stuck at 0.9%, GA date in question. Reforecast this week.\n" +
          "- **Platform** — Datadog overage from the incident, need to approve. On-call comp proposal coming.\n\n" +
          "My follow-ups: escalate Atlas AppSec, approve Datadog overage, read Phoenix RFC.",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: 0,
        tags: ["standup", "staff-meeting"],
      },
      {
        id: "N-0002",
        type: "note",
        title: "1-1 with Marcus (Ledger) — raw",
        body:
          "marcus a bit fried after the incident weekend. did a great job tho. wants to know if the senior staff promo is actually happening or if im just being nice. " +
          "i told him im writing the packet this cycle - he's earned it. he's worried the team blames the payout worker design on him but honestly the idempotency gap was a known risk we deprioritized. " +
          "action: i should say that publicly in the retro so it doesnt land on him. also he wants more scope - maybe the platform consolidation tiger team? he'd be a good lead for it. " +
          "personal: his partner starting a new job, might need flexible hours for a few weeks, totally fine",
        status: null,
        priority: "medium",
        difficulty: "s",
        ageDays: 0,
        tags: ["1-1", "ledger", "team-mgmt", "marcus"],
      },
      {
        id: "N-0003",
        type: "note",
        title: "Exec sync — roadmap + budget (rough notes)",
        body:
          "sandra (VP) ran it. big themes for next FY are reliability and the platform consolidation. " +
          "she wants the board deck to lead with the cost-savings story not the tech. " +
          "asked me for a headcount one-pager - 6 reqs, where do they go. due wed. " +
          "ledger incident came up - she was fine with how we handled it, wants the retro public by friday. " +
          "datadog overage - approved, but she wants a plan so it doesnt recur. " +
          "atlas appsec delay - she'll ping dana's manager, said dont let a queue block a launch again. " +
          "mobile v3 - she's nervous about the date. wants a credible GA not an optimistic one. " +
          "decision: platform consolidation gets a real proposal next planning cycle, i own it",
        status: null,
        priority: "high",
        difficulty: "m",
        starred: true,
        ageDays: 0,
        tags: ["exec", "staff-meeting", "roadmap", "budget", "sandra"],
      },
      {
        id: "N-0004",
        type: "note",
        title: "Wei Zhang debrief notes (Sr Staff, Platform)",
        body:
          "Panel debrief, 5 interviewers.\n\n" +
          "- **System design** (mixed): strong on data modeling, hand-wavy on the failure modes. Pushed back well when challenged though.\n" +
          "- **Coding** (yes): clean, tested, finished with time to spare.\n" +
          "- **Leadership/values** (strong yes x2): great stories about mentoring, owning a migration end-to-end.\n" +
          "- **Past project deep-dive** (yes): clearly drove the work, not just present for it.\n\n" +
          "My read: the system-design concern is coachable; the leadership signal is exactly what Platform needs. Leaning **hire**. Need HR to confirm we can hit the comp expectation (~top of band).",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: 0,
        tags: ["hiring", "platform", "team-mgmt", "wei-zhang"],
      },
      {
        id: "N-0005",
        type: "note",
        title: "Mobile v3 GA risk review — meeting output",
        body:
          "With the mobile leads (Carla, Devin).\n\n" +
          "## What we know\n" +
          "- Beta crash rate 0.9%, target <0.3%.\n" +
          "- 60% of crashes trace to one image-cache library on older Android.\n" +
          "- The rest are long-tail, hard to repro.\n\n" +
          "## Options\n" +
          "1. Swap the image-cache lib — 1 week, kills 60% of crashes, some regression risk.\n" +
          "2. 2-week stabilization sprint, then re-measure.\n" +
          "3. Ship GA at current quality with a kill-switch — team is against this.\n\n" +
          "## Leaning\n" +
          "Option 1 + a 1-week stabilization buffer. New GA target ~3 weeks out. I'll carry that number to the board deck.",
        status: null,
        priority: "high",
        difficulty: "m",
        ageDays: 0,
        tags: ["mobile-v3", "roadmap", "planning", "carla", "devin"],
      },
      {
        id: "N-0006",
        type: "note",
        title: "Phoenix RFC-0042 — my review notes",
        body:
          "Per-service Postgres instead of the shared DB.\n\n" +
          "**Like:** clear blast-radius isolation, independent scaling, matches the service ownership model.\n\n" +
          "**Concerns:**\n" +
          "- On-call surface grows from 1 DB to 4 — who carries the pager?\n" +
          "- Cross-service reporting queries get harder; do we need a read warehouse?\n" +
          "- Migration plan is solid but the rollback story for the data backfill is thin.\n\n" +
          "**Verdict:** conditional approve — address rollback + name the on-call owner per DB.",
        status: null,
        priority: "medium",
        difficulty: "m",
        ageDays: -1,
        tags: ["phoenix", "eng-process", "roadmap"],
      },
      {
        id: "N-0007",
        type: "note",
        title: "Ledger incident retro — draft for review",
        body:
          "## Summary\n" +
          "On Fri, a deploy-time timeout caused the payout worker to retry non-idempotently, double-charging 412 customers. All refunded within 4h.\n\n" +
          "## Timeline\n" +
          "- 14:02 deploy starts; worker times out mid-batch\n" +
          "- 14:09 retries fire, duplicates sent\n" +
          "- 14:31 alert; on-call pages Marcus\n" +
          "- 15:50 duplicates identified, sends halted\n" +
          "- 18:10 all refunds processed\n\n" +
          "## 5 whys → root cause\n" +
          "Retry path assumed idempotency that the payout API never guaranteed. Known risk, deprioritized last quarter.\n\n" +
          "## Action items\n" +
          "- [ ] Add idempotency keys to payout sends (Ledger, this sprint)\n" +
          "- [ ] Add a deploy-time circuit breaker on the worker (Platform)\n" +
          "- [ ] Datadog sampling rule to cap log-ingest cost (Platform)\n\n" +
          "_Note to self: state publicly that the design gap was an org-level deprioritization, not Marcus's call._",
        status: null,
        priority: "urgent",
        difficulty: "m",
        starred: true,
        ageDays: -1,
        tags: ["ledger", "incident", "marcus"],
      },
      {
        id: "N-0008",
        type: "note",
        title: "1-1 with Anna (Atlas TL) — growth",
        body:
          "anna wants to lead a bigger team / more scope. she's ready honestly. " +
          "the atlas heavy-build phase is winding down so her plate is opening up. " +
          "idea: offer her a lead role on the platform consolidation tiger team alongside marcus? stretch but not crazy. " +
          "she also flagged the two atlas contractors rolling off - thinks the team is fine without one of them but wants to keep the other through the SSO launch. useful input for the renewal decision. " +
          "follow up: line up a mentor for her outside atlas, maybe someone on platform",
        status: null,
        priority: "medium",
        difficulty: "s",
        ageDays: 0,
        tags: ["1-1", "atlas", "team-mgmt", "anna"],
      },
      {
        id: "N-0009",
        type: "note",
        title: "Inbox: thought — quarterly architecture review forum?",
        body:
          "Random idea between meetings: we approve big RFCs ad hoc and it's inconsistent. " +
          "What if there's a monthly architecture review forum where teams bring proposals and get cross-team eyes before they're built? " +
          "Would've caught the Ledger idempotency gap. Park this for the eng-process backlog.",
        status: null,
        priority: "low",
        difficulty: "xs",
        ageDays: 0,
        tags: ["inbox", "eng-process"],
      },
      {
        id: "N-0010",
        type: "note",
        title: "Budget review prep — running list",
        body:
          "For Friday's finance review:\n\n" +
          "- Datadog overage ($8.4k one-time) + the renewal at -12%\n" +
          "- Atlas contractors: $180k/qtr decision pending\n" +
          "- Platform on-call comp proposal — org-wide cost if it spreads\n" +
          "- 6 new reqs for next FY — need the allocation story\n" +
          "- CI runner fleet — renew vs. managed (later, not this cycle)",
        status: null,
        priority: "medium",
        difficulty: "s",
        ageDays: 0,
        tags: ["budget", "planning", "vendor"],
      },
      {
        id: "N-0011",
        type: "note",
        title: "Weekly priorities (Mon planning)",
        body:
          "Top 3 this week:\n\n" +
          "1. **Ledger retro public by Friday** — non-negotiable, exec is watching.\n" +
          "2. **Board roadmap deck** — lead with the cost story, dry-run Thursday.\n" +
          "3. **Close the Wei hire + Marcus promo packet** — people stuff doesn't wait.\n\n" +
          "Keep an eye on: Atlas AppSec unblock, Mobile v3 date.",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: -1,
        tags: ["planning", "roadmap", "team-mgmt"],
      },
    ],
  };
}

/** ISO date string N days from today (used for due dates). */
function relative(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}
