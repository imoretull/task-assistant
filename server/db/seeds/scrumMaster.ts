import type { SeedData } from "../seed.js";

/**
 * Demo workspace — a sprint boundary in the life of Aisha Okafor, Scrum
 * Master for two squads (Payments and Growth) at a product company. Lives in
 * ceremonies, impediment-hunting, team-health work, metrics, and the quiet
 * 1-1 coaching that makes squads actually improve. Tasks land across every
 * board column and notes capture real facilitation output (retro boards,
 * impediment logs, coaching notes), so every feature has rich material to
 * work on.
 *
 * Tag taxonomy:
 *   Squads     — payments-squad, growth-squad
 *   Cadence    — standup, retro, sprint-planning, refinement, 1-1, sync
 *   Categories — impediment, metrics, coaching, facilitation, team-health,
 *                process, stakeholder, inbox
 */
export function scrumMasterSeed(): SeedData {
  return {
    tags: [
      // squads (own sidebar section)
      { name: "payments-squad", color: "purple", kind: "project" },
      { name: "growth-squad", color: "green", kind: "project" },
      // people (own sidebar section)
      { name: "lena-po", color: "blue", kind: "person" }, // PO, payments
      { name: "victor-po", color: "amber", kind: "person" }, // PO, growth
      { name: "sofia", color: "purple", kind: "person" }, // payments tech lead
      { name: "ben", color: "red", kind: "person" }, // growth dev, struggling
      { name: "ingrid", color: "green", kind: "person" }, // engineering manager
      { name: "agile-chapter", color: "gray", kind: "person" },
      // cadence / ceremonies
      { name: "standup", color: "green" },
      { name: "retro", color: "purple" },
      { name: "sprint-planning", color: "amber" },
      { name: "refinement", color: "blue" },
      { name: "1-1", color: "blue" },
      { name: "sync", color: "gray" },
      // categories
      { name: "impediment", color: "red" },
      { name: "metrics", color: "green" },
      { name: "coaching", color: "amber" },
      { name: "facilitation", color: "purple" },
      { name: "team-health", color: "blue" },
      { name: "process", color: "gray" },
      { name: "stakeholder", color: "red" },
      { name: "inbox", color: "gray" },
    ],
    items: [
      // ───────────────────────── URGENT / BLOCKED — impediments first ────────
      {
        id: "T-0001",
        type: "task",
        title: "Clear the staging-environment impediment for Payments",
        body:
          "Payments squad has been unable to deploy to staging for 3 days — shared env is held by a compliance audit freeze nobody announced. Burning the sprint.\n\n" +
          "- [x] Find the actual owner of the freeze (compliance PM, not infra)\n" +
          "- [x] Get the freeze end date in writing (Thursday)\n" +
          "- [ ] Negotiate a 2-hour exception window for the payments deploy today\n" +
          "- [ ] Raise the systemic fix in the sync: squads need a second staging env or a booking calendar\n\n" +
          "**Sprint impact so far:** 2 stories can't reach 'done' by the squad's DoD. Flagging in the burndown honestly.",
        status: "in_progress",
        priority: "urgent",
        difficulty: "s",
        starred: true,
        ageDays: -1,
        tags: ["payments-squad", "impediment", "stakeholder"],
      },
      {
        id: "T-0002",
        type: "task",
        title: "Blocked: Growth sprint goal at risk — designs still not final",
        body:
          "Growth committed to the onboarding-revamp goal with 'designs final by day 2'. It's day 4. The squad is building against moving mockups and re-work is piling up.\n\n" +
          "- [x] Talk to Victor — design bottleneck is the agency review loop\n" +
          "- [ ] Decide with the squad today: descope to the two finalized screens, or swap in backlog items\n" +
          "- [ ] Retro topic: stop committing to goals with external dependencies unmet (second time this quarter)",
        status: "blocked",
        priority: "urgent",
        difficulty: "s",
        starred: true,
        ageDays: -2,
        tags: ["growth-squad", "impediment", "victor-po", "sprint-planning"],
      },
      {
        id: "T-0003",
        type: "task",
        title: "Defuse the stakeholder escalation about Payments 'velocity drop'",
        body:
          "A VP saw the velocity chart dip 20% and emailed Ingrid asking 'what's wrong with the team'. The dip is two planned holidays plus the staging freeze.\n\n" +
          "- [ ] Send Ingrid the context: capacity-adjusted velocity is flat\n" +
          "- [ ] Offer the VP a 15-min walkthrough of what the metrics do and don't mean\n" +
          "- [ ] Stop publishing raw velocity outside the squad — throughput + cycle time tell a truer story",
        status: "todo",
        priority: "high",
        difficulty: "s",
        ageDays: -1,
        tags: ["payments-squad", "metrics", "stakeholder", "ingrid"],
      },

      // ───────────────────────── IN PROGRESS — active facilitation work ───────
      {
        id: "T-0004",
        type: "task",
        title: "Design and run the quarterly retro (both squads, 2h)",
        body:
          "Quarter boundary — bigger-lens retro, not the usual sprint format.\n\n" +
          "- [x] Pick the format: timeline retro + sailboat for themes\n" +
          "- [x] Collect pre-work: each person's high/low of the quarter (anonymous form)\n" +
          "- [ ] Prepare the data wall: cycle-time trend, escaped defects, goal hit-rate per sprint\n" +
          "- [ ] Facilitate Thursday; hard rule — max 3 actions, each with an owner and a check-in date\n" +
          "- [ ] Publish outcomes and book the 30-day follow-up",
        status: "in_progress",
        priority: "high",
        difficulty: "m",
        starred: true,
        dueDate: relative(2),
        ageDays: -4,
        tags: ["retro", "facilitation", "payments-squad", "growth-squad"],
      },
      {
        id: "T-0005",
        type: "task",
        title: "Coach Sofia on running refinement without me",
        body:
          "Goal: Payments runs its own refinement by next quarter — the squad shouldn't need me to function.\n\n" +
          "- [x] Co-facilitated two sessions; she led the last one with me silent in the corner\n" +
          "- [ ] Debrief: her timeboxing is good, she lets the loudest voice dominate estimates — show planning-poker-style silent first votes\n" +
          "- [ ] Next session she runs solo; I review the outcomes only",
        status: "in_progress",
        priority: "medium",
        difficulty: "s",
        ageDays: -3,
        tags: ["coaching", "refinement", "payments-squad", "sofia"],
      },
      {
        id: "T-0006",
        type: "task",
        title: "Build the squad-health check-in (quarterly survey)",
        body:
          "Spotify-style health check, adapted: delivery confidence, psych safety, tech-debt feel, fun, clarity of purpose.\n\n" +
          "- [x] Draft the 8 dimensions with traffic-light wording\n" +
          "- [ ] Pilot with the agile chapter for wording bias\n" +
          "- [ ] Run in both squads' retros this sprint\n" +
          "- [ ] Agree with squads what's shared upward (aggregates only, never individual answers)",
        status: "in_progress",
        priority: "medium",
        difficulty: "m",
        ageDays: -5,
        tags: ["team-health", "metrics", "agile-chapter"],
      },
      {
        id: "T-0007",
        type: "task",
        title: "Fix the standup that has become a status report",
        body:
          "Growth's standup is 22 minutes of people reporting to me instead of planning with each other.\n\n" +
          "- [x] Observe two standups, note the patterns (everyone talks to me; phones out by minute 10)\n" +
          "- [ ] Switch format: walk the board right-to-left, talk about items not people\n" +
          "- [ ] I stand at the back, literally — break the report-to-the-SM habit\n" +
          "- [ ] Re-measure in 2 weeks: target under 12 min with a real plan at the end",
        status: "in_progress",
        priority: "medium",
        difficulty: "s",
        ageDays: -2,
        tags: ["standup", "growth-squad", "facilitation", "process"],
      },

      // ───────────────────────── TODO — this sprint ──────────────────────────
      {
        id: "T-0008",
        type: "task",
        title: "Prep sprint planning: Payments sprint 31",
        body:
          "- [ ] Confirm capacity (Sofia out 2 days, one new joiner at 50%)\n" +
          "- [ ] Check with Lena the top of backlog is truly ready (DoR: designs, acceptance criteria, dependencies named)\n" +
          "- [ ] Bring the staging-freeze risk into the goal conversation explicitly\n" +
          "- [ ] Timebox: 90 min, goal first, stories second",
        status: "todo",
        priority: "high",
        difficulty: "s",
        dueDate: relative(3),
        ageDays: -1,
        tags: ["sprint-planning", "payments-squad", "lena-po"],
      },
      {
        id: "T-0009",
        type: "task",
        title: "1-1 with Ben — he's gone quiet",
        body:
          "Ben hasn't spoken in retro for two sprints and his review turnaround tripled. Something's up — could be the new-joiner pairing load, could be personal.\n\n" +
          "- [ ] Walk, not meeting room\n" +
          "- [ ] Listen first; no process talk unless he brings it\n" +
          "- [ ] If it's the pairing load, rebalance with the squad, not by decree",
        status: "todo",
        priority: "high",
        difficulty: "s",
        dueDate: relative(1),
        ageDays: -1,
        tags: ["1-1", "coaching", "team-health", "ben", "growth-squad"],
      },
      {
        id: "T-0010",
        type: "task",
        title: "Update the dependency board for the cross-squad payment-links feature",
        body: "Payments builds the API, Growth builds the share UI. Map the handoffs on the dependency board before planning, so neither squad commits to the other's unfinished work.",
        status: "todo",
        priority: "medium",
        difficulty: "xs",
        dueDate: relative(2),
        tags: ["payments-squad", "growth-squad", "process", "sprint-planning"],
      },
      {
        id: "T-0011",
        type: "task",
        title: "Agree WIP limits with Growth (they have 14 items in progress)",
        body:
          "Cycle time doubled since the squad grew. 14 items in flight for 7 people is the cause, not the symptom.\n\n" +
          "- [ ] Show the cumulative-flow diagram — the in-progress band ballooning is visible\n" +
          "- [ ] Let THEM pick the limit (suggest col-width = people - 1, but their number sticks better)\n" +
          "- [ ] Pair the limit with a 'swarm to finish' norm, not a policing rule",
        status: "todo",
        priority: "medium",
        difficulty: "s",
        ageDays: -2,
        tags: ["growth-squad", "metrics", "process", "coaching"],
      },
      {
        id: "T-0012",
        type: "task",
        title: "Book the facilitation workshop for the agile chapter",
        body: "Chapter asked me to run my 'retro formats beyond start-stop-continue' session again. Find a 2h slot next month, cap at 12 people.",
        status: "todo",
        priority: "low",
        difficulty: "xs",
        tags: ["agile-chapter", "facilitation"],
      },
      {
        id: "T-0013",
        type: "task",
        title: "Refresh the team working agreements (Payments)",
        body: "Written 18 months ago, three people have joined since, nobody can quote them. 20-min retro slot: keep / amend / retire each line.",
        status: "todo",
        priority: "low",
        difficulty: "xs",
        tags: ["payments-squad", "process", "team-health", "retro"],
      },

      // ───────────────────────── BACKLOG — systemic / later ──────────────────
      {
        id: "T-0014",
        type: "task",
        title: "Propose the second staging environment (systemic fix)",
        body:
          "The staging freeze is the third env-contention impediment this quarter. Stop firefighting, fix the system.\n\n" +
          "- [ ] Tally the cost: blocked-days per squad this quarter (rough count: 9)\n" +
          "- [ ] Options paper with infra: second env vs booking calendar vs ephemeral envs\n" +
          "- [ ] Bring to Ingrid with the numbers, not the anecdotes",
        status: "backlog",
        priority: "high",
        difficulty: "m",
        starred: true,
        tags: ["impediment", "process", "stakeholder", "ingrid"],
      },
      {
        id: "T-0015",
        type: "task",
        title: "Pilot 'no-meeting Wednesdays' for maker time",
        body: "Both squads flag meeting fragmentation in health checks. Pilot one protected day for a month and measure: cycle time + the health-check 'focus' dimension.",
        status: "backlog",
        priority: "low",
        difficulty: "s",
        tags: ["team-health", "process"],
      },
      {
        id: "T-0016",
        type: "task",
        title: "Replace story points with cycle-time forecasting (probe)",
        body: "Estimation theater is eating ~2h/sprint per squad. Monte-carlo on historical cycle time may forecast better. Run both in parallel for two sprints and compare honestly.",
        status: "backlog",
        priority: "low",
        difficulty: "m",
        tags: ["metrics", "process", "refinement"],
      },
      {
        id: "T-0017",
        type: "task",
        title: "Cross-squad demo day (monthly, 30 min)",
        body: "Squads don't see each other's work and duplicate effort (two link-shortener implementations last quarter...). Lightweight: 3 demos, 8 min each, recorded.",
        status: "backlog",
        priority: "low",
        difficulty: "xs",
        tags: ["facilitation", "team-health"],
      },

      // ───────────────────────── DONE — recent wins ───────────────────────────
      {
        id: "T-0018",
        type: "task",
        title: "Run the incident-aftermath retro for Payments",
        body: "Blameless format after the double-charge incident. Squad surfaced the deprioritized idempotency risk themselves; action items went to the actual backlog, not a wishlist doc.",
        status: "done",
        priority: "high",
        difficulty: "m",
        ageDays: -7,
        tags: ["retro", "payments-squad", "facilitation"],
      },
      {
        id: "T-0019",
        type: "task",
        title: "Onboard the new joiner into Growth's cadence",
        body: "Buddy assigned, ceremony guide shared, first-week pairing plan set. She shipped a small story in week one — best onboarding signal there is.",
        status: "done",
        priority: "medium",
        difficulty: "s",
        ageDays: -9,
        tags: ["growth-squad", "team-health", "coaching"],
      },
      {
        id: "T-0020",
        type: "task",
        title: "Kill the weekly 'status sync' meeting (merged into async update)",
        body: "60 min × 11 people, replaced with a threaded async update + 15-min optional huddle. Nobody misses it. ~10 person-hours/week returned.",
        status: "done",
        priority: "medium",
        difficulty: "s",
        ageDays: -11,
        tags: ["process", "facilitation", "sync"],
      },

      // ───────────────────────── NOTES — facilitation output ──────────────────
      {
        id: "N-0001",
        type: "note",
        title: "Standup observations — Growth, Tue",
        body:
          "**Format watch (week 1 of the fix):**\n\n" +
          "- Walked the board right-to-left for the first time — two near-done items got swarmed instead of two new ones starting. Exactly the point.\n" +
          "- Ben passed his turn again. Third time. 1-1 booked for tomorrow.\n" +
          "- 14 min (down from 22). Still ends without an explicit plan — add the closing question: 'are we set up to move the right-most items today?'\n\n" +
          "**Impediments surfaced:** design files for onboarding screen 3 still in agency review; flagged on T-0002.",
        status: null,
        priority: "medium",
        difficulty: "xs",
        ageDays: 0,
        tags: ["standup", "growth-squad", "facilitation"],
      },
      {
        id: "N-0002",
        type: "note",
        title: "Impediment log — running list (raw)",
        body:
          "staging freeze - compliance audit, nobody told the squads, found the owner tues, exception window being negotiated. third env clash this quarter, " +
          "need the systemic fix proposal. design agency loop - growth blocked again, second sprint goal at risk this quarter from the same cause, " +
          "victor knows, descope decision today. vp velocity email - ingrid forwarded it, classic metric misread, im handling with context not defensiveness. " +
          "new joiner laptop took 4 days to arrive - logged with IT, pattern? check with other SMs. payments squad asked if they can skip retro this sprint " +
          "because of the deadline - thats exactly when you dont skip it, told sofia, she agreed, shortened to 30min instead",
        status: null,
        priority: "high",
        difficulty: "s",
        starred: true,
        ageDays: 0,
        tags: ["impediment", "inbox", "payments-squad", "growth-squad"],
      },
      {
        id: "N-0003",
        type: "note",
        title: "Retro board — Payments sprint 30",
        body:
          "Format: 4Ls (Liked / Learned / Lacked / Longed for). 7 of 7 present.\n\n" +
          "**Liked:** pairing rotation stuck; the incident retro changed how people talk about risk.\n\n" +
          "**Learned:** the new payment-links API is harder than estimated — split stories thinner.\n\n" +
          "**Lacked:** staging access (the freeze); design feedback inside the sprint.\n\n" +
          "**Longed for:** uninterrupted maker time (4 votes — feeds the no-meeting-Wednesday idea).\n\n" +
          "**Actions (3 max):**\n" +
          "- [ ] Stories touching payment-links get split to ≤3 days (Sofia, check at next refinement)\n" +
          "- [ ] Staging exception process written down and shared (me, this week)\n" +
          "- [ ] Trial protected focus blocks Tue/Thu afternoons (whole squad, review in 2 sprints)",
        status: null,
        priority: "high",
        difficulty: "s",
        starred: true,
        ageDays: -3,
        tags: ["retro", "payments-squad", "facilitation"],
      },
      {
        id: "N-0004",
        type: "note",
        title: "Metrics snapshot — both squads, sprint 30",
        body:
          "## Payments\n" +
          "- Throughput: 11 items (avg 12) — flat, fine\n" +
          "- Cycle time p50: 3.1d, p85: 7.8d — p85 creeping up, the big API stories\n" +
          "- Sprint goal: missed (staging freeze) — first miss in 5 sprints\n" +
          "- Escaped defects: 1\n\n" +
          "## Growth\n" +
          "- Throughput: 9 items (avg 13) — down, WIP explosion is the story\n" +
          "- Cycle time p50: 6.4d (was 3.2 two months ago) — THE chart for the WIP-limit talk\n" +
          "- Sprint goal: at risk (designs late)\n" +
          "- Escaped defects: 0\n\n" +
          "Reminder to self: these go to the squads first, leadership second, always with narrative attached.",
        status: null,
        priority: "high",
        difficulty: "m",
        ageDays: -1,
        tags: ["metrics", "payments-squad", "growth-squad"],
      },
      {
        id: "N-0005",
        type: "note",
        title: "Coaching notes — Sofia, refinement debrief",
        body:
          "What she does well: timeboxes ruthlessly, prepped the stories in advance with Lena, good energy.\n\n" +
          "Growth edge: when Tom-the-loud estimates first, everyone anchors. She didn't notice until I showed her the pattern in my notes — three stories where the first number spoken became the estimate.\n\n" +
          "Suggested: silent individual estimates first, reveal together, discuss only the spread. She'll try it next session solo.\n\n" +
          "Bigger picture: she's two sessions from not needing me in refinement at all. That's the job — making myself unnecessary, one ceremony at a time.",
        status: null,
        priority: "medium",
        difficulty: "s",
        ageDays: -2,
        tags: ["coaching", "sofia", "refinement", "payments-squad"],
      },
      {
        id: "N-0006",
        type: "note",
        title: "Sync with Lena + Victor — backlog and the designs mess",
        body:
          "Joint PO sync output:\n\n" +
          "- **Payment-links cross-squad feature:** agreed the API contract freezes before either squad commits. Dependency board updated Thursday.\n" +
          "- **Designs-late pattern (Growth):** Victor will move the agency to async review with a 48h SLA, and we stop committing sprint goals on unfinalized designs — written into the DoR.\n" +
          "- **Backlog health:** Payments top-10 is ready; Growth has 4 items with no acceptance criteria — Victor owns by Friday.\n" +
          "- Lena raised that mid-sprint scope creep is back (two 'tiny' additions last sprint). Agreed: anything new goes through the goal question — 'does this serve the sprint goal?' — out loud, in standup.",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: -1,
        tags: ["sync", "lena-po", "victor-po", "sprint-planning"],
      },
      {
        id: "N-0007",
        type: "note",
        title: "Quarterly retro design (Thursday, 2h, both squads)",
        body:
          "## Arc\n" +
          "1. **Set the stage (10m):** working agreements, prime directive, anonymous pre-work themes on the wall\n" +
          "2. **Timeline (35m):** the quarter on one wall — releases, incidents, joins/leaves, the freeze. People add their high/low stickies to the timeline.\n" +
          "3. **Data wall (15m):** cycle time, goal hit-rate, health-check trends. No commentary from me — let them read it.\n" +
          "4. **Sailboat (30m):** wind / anchors / rocks ahead, themed from the timeline\n" +
          "5. **Actions (25m):** dot-vote themes, max 3 actions, owner + check-in date each\n" +
          "6. **Close (5m):** ROTI score\n\n" +
          "Risks to manage: the VP-velocity story will come up — name it early so it doesn't simmer. Ben may stay silent in the big group — the pre-work form is his channel; watch his stickies.",
        status: null,
        priority: "high",
        difficulty: "m",
        ageDays: -1,
        tags: ["retro", "facilitation", "team-health"],
      },
      {
        id: "N-0008",
        type: "note",
        title: "1-1 with Ingrid — raw notes",
        body:
          "talked the vp velocity thing through, she's aligned - context not apology, and she wants the metrics walkthrough offer to come from her so it " +
          "doesnt look defensive. told her about the wip situation in growth, she asked if victor is part of the problem (pushing starts over finishes) - " +
          "honestly yes a bit, ill coach it sideways through the dor and the goal question rather than confronting. " +
          "she greenlit the health check pilot. on the second staging env she wants the blocked-days number before she takes it up, " +
          "9 days this quarter, getting the exact list. also she asked me to mentor the new SM joining the platform group next month - yes, gladly",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: 0,
        tags: ["1-1", "ingrid", "stakeholder"],
      },
      {
        id: "N-0009",
        type: "note",
        title: "Inbox: idea — impediment half-life metric",
        body:
          "Thought during the freeze mess: I track what impediments ARE but not how long they live. " +
          "'Median days from raised to resolved' per category (env, dependency, decision-wait, tooling) would show whether the org is getting faster at unblocking — and where to aim the systemic fixes. The log already has the dates; it's a spreadsheet away.",
        status: null,
        priority: "low",
        difficulty: "xs",
        ageDays: 0,
        tags: ["inbox", "impediment", "metrics"],
      },
      {
        id: "N-0010",
        type: "note",
        title: "Health-check pilot — dimension wording (draft)",
        body:
          "8 dimensions, traffic-light statements (green wording shown):\n\n" +
          "1. **Delivery confidence** — 'We usually finish what we commit to, without heroics.'\n" +
          "2. **Psych safety** — 'I can raise a problem or admit a mistake without it costing me.'\n" +
          "3. **Tech debt feel** — 'The codebase helps us more than it fights us.'\n" +
          "4. **Focus** — 'I get meaningful uninterrupted time most days.'\n" +
          "5. **Purpose clarity** — 'I know why our current goal matters to users.'\n" +
          "6. **Fun** — 'I mostly enjoy working with this team.'\n" +
          "7. **Learning** — 'I'm growing here.'\n" +
          "8. **Speed of unblocking** — 'When we're stuck, help comes fast.'\n\n" +
          "Chapter feedback due Wed. Rule: results belong to the squad; only aggregate trends go up.",
        status: null,
        priority: "medium",
        difficulty: "s",
        ageDays: -2,
        tags: ["team-health", "metrics", "agile-chapter"],
      },
      {
        id: "N-0011",
        type: "note",
        title: "Weekly priorities (Mon)",
        body:
          "Top 3 this week:\n\n" +
          "1. **Staging exception window for Payments** — the sprint depends on it; systemic proposal follows.\n" +
          "2. **Quarterly retro Thursday** — prep done by Wed, data wall printed.\n" +
          "3. **Ben 1-1** — people before process, always.\n\n" +
          "Keep an eye on: Growth descope decision, VP metrics conversation, health-check chapter feedback.",
        status: null,
        priority: "high",
        difficulty: "xs",
        ageDays: -1,
        tags: ["sprint-planning", "team-health", "impediment"],
      },
    ],
  };
}

/** ISO date string N days from today (used for due dates). */
function relative(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}
