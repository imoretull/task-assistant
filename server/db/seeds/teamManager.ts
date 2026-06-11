import type { SeedData } from "../seed.js";

/**
 * Demo workspace — a week in the life of Daniel Reyes, Engineering Team
 * Manager of an 8-person product team (Orders). First-line management:
 * weekly 1-1s with every report, one hire in flight, a performance concern,
 * an onboarding, delivery commitments to keep, and the constant translation
 * between his team and the org above. Tasks land across every board column
 * and notes capture real manager output (1-1 notes, perf evidence, delivery
 * updates), so every feature has rich material to work on.
 *
 * Tag taxonomy:
 *   Workstreams — orders-team, checkout-integration, q3-delivery, hiring-fe
 *   Cadence     — 1-1, team-meeting, skip-level, leads-sync
 *   Categories  — people, performance, onboarding, delivery, hiring,
 *                 feedback, process, growth, inbox
 */
export function teamManagerSeed(): SeedData {
  return {
    tags: [
      // workstreams (own sidebar section)
      { name: "orders-team", color: "purple", kind: "project" },
      { name: "checkout-integration", color: "blue", kind: "project" },
      { name: "q3-delivery", color: "green", kind: "project" },
      { name: "hiring-fe", color: "amber", kind: "project" },
      // people (own sidebar section)
      { name: "nina", color: "purple", kind: "person" }, // senior eng, promo track
      { name: "oliver", color: "red", kind: "person" }, // mid eng, performance concern
      { name: "fatima", color: "green", kind: "person" }, // new joiner, week 3
      { name: "kenji", color: "blue", kind: "person" }, // senior eng, flight risk?
      { name: "ruth", color: "amber", kind: "person" }, // my manager (director)
      { name: "hr-bp", color: "gray", kind: "person" }, // HR business partner
      // cadence / meetings
      { name: "1-1", color: "blue" },
      { name: "team-meeting", color: "green" },
      { name: "skip-level", color: "purple" },
      { name: "leads-sync", color: "gray" },
      // categories
      { name: "people", color: "blue" },
      { name: "performance", color: "red" },
      { name: "onboarding", color: "green" },
      { name: "delivery", color: "amber" },
      { name: "hiring", color: "purple" },
      { name: "feedback", color: "amber" },
      { name: "process", color: "gray" },
      { name: "growth", color: "green" },
      { name: "inbox", color: "gray" },
    ],
    items: [
      // ───────────────────────── URGENT / BLOCKED — people first ─────────────
      {
        id: "T-0001",
        type: "task",
        title: "Have the direct performance conversation with Oliver",
        body:
          "Three sprints of missed commitments and review pushback; peers are quietly routing around him. I've been too soft — the kind thing is the clear thing.\n\n" +
          "- [x] Collect specifics: 3 concrete examples with dates and impact (no vibes)\n" +
          "- [x] Align with HR BP on the framing — feedback conversation, NOT a PIP opener\n" +
          "- [ ] The conversation: behavior, impact, expectation, support — and listen, there may be context I'm missing\n" +
          "- [ ] Write up agreed expectations same day, share with him for accuracy\n" +
          "- [ ] 2-week check-in booked before we leave the room",
        status: "in_progress",
        priority: "urgent",
        difficulty: "m",
        starred: true,
        dueDate: relative(1),
        ageDays: -3,
        tags: ["oliver", "performance", "people", "hr-bp", "1-1"],
      },
      {
        id: "T-0002",
        type: "task",
        title: "Blocked: Q3 commitment at risk — partner team's API two sprints late",
        body:
          "Checkout-integration milestone needs the cart-service API. Their lead keeps saying 'next sprint'. My team is building against stubs and the integration risk is compounding.\n\n" +
          "- [x] Get the real ETA from their manager (not their standup) — answer was mushy\n" +
          "- [ ] Escalate jointly with Ruth to their director — dates, not blame\n" +
          "- [ ] Plan B sized with Nina: ship behind a flag with the stub adapter, swap when real API lands (+1 sprint of rework)\n" +
          "- [ ] Update the Q3 commitment RAG to amber with the dependency named",
        status: "blocked",
        priority: "urgent",
        difficulty: "m",
        starred: true,
        ageDays: -4,
        tags: ["checkout-integration", "q3-delivery", "delivery", "ruth"],
      },
      {
        id: "T-0003",
        type: "task",
        title: "Respond to Kenji's competing offer signal",
        body:
          "Kenji mentioned 'a recruiter conversation that got serious' in our 1-1. He's my strongest systems thinker and the only one who knows the billing reconciliation code.\n\n" +
          "- [ ] Real conversation first: what would make staying obviously right? (It's scope and on-call load, if I had to guess)\n" +
          "- [ ] Check comp position against band with HR BP — he's likely below market after two years\n" +
          "- [ ] Independent of outcome: bus-factor fix — pair him with Fatima on reconciliation this sprint",
        status: "todo",
        priority: "urgent",
        difficulty: "m",
        starred: true,
        dueDate: relative(2),
        ageDays: -1,
        tags: ["kenji", "people", "hr-bp", "1-1"],
      },

      // ───────────────────────── IN PROGRESS — active management work ─────────
      {
        id: "T-0004",
        type: "task",
        title: "Write Nina's promotion case (senior → staff-track)",
        body:
          "Promo window closes in 2 weeks. Nina led the checkout-integration design and unblocked two other teams with the event-schema work — the cross-team impact is the case.\n\n" +
          "- [x] Gather artifacts: design doc, the two cross-team threads, incident-prevention numbers\n" +
          "- [x] Peer feedback requested (3 in, 1 pending)\n" +
          "- [ ] Draft the narrative — impact and influence, not effort\n" +
          "- [ ] Pre-read with Ruth before the committee\n" +
          "- [ ] Manage Nina's expectations honestly: strong case, committee is competitive this cycle",
        status: "in_progress",
        priority: "high",
        difficulty: "m",
        starred: true,
        dueDate: relative(8),
        ageDays: -5,
        tags: ["nina", "people", "growth", "performance"],
      },
      {
        id: "T-0005",
        type: "task",
        title: "Close the frontend hire — final round this week",
        body:
          "Req open 9 weeks. Two finalists: strong-senior (comp stretch) vs solid-mid (safer, growth bet).\n\n" +
          "- [x] Debrief panel for candidate A (senior) — 3 yes, 1 weak-yes\n" +
          "- [ ] Candidate B final loop Thursday\n" +
          "- [ ] Decide Friday: if A, fight the comp case with HR; if B, plan the ramp deliberately\n" +
          "- [ ] Either way close BOTH respectfully within 48h of deciding — our pipeline reputation matters",
        status: "in_progress",
        priority: "high",
        difficulty: "m",
        dueDate: relative(4),
        ageDays: -6,
        tags: ["hiring-fe", "hiring", "hr-bp"],
      },
      {
        id: "T-0006",
        type: "task",
        title: "Fatima's onboarding — week 3 checkpoint",
        body:
          "- [x] Week 1: env setup, first small PR merged day 4 (good signal)\n" +
          "- [x] Week 2: buddy pairing with Kenji, owns a small story end-to-end\n" +
          "- [ ] Week 3 check: is she stuck-but-quiet anywhere? (new joiners hide confusion)\n" +
          "- [ ] Set the 30-day conversation: what's confusing about how we work — fresh eyes are an audit, capture it\n" +
          "- [ ] Start her on the reconciliation pairing (doubles as the Kenji bus-factor fix)",
        status: "in_progress",
        priority: "medium",
        difficulty: "s",
        ageDays: -2,
        tags: ["fatima", "onboarding", "people", "orders-team"],
      },
      {
        id: "T-0007",
        type: "task",
        title: "Q3 delivery review prep — honest RAG for the leads sync",
        body:
          "- [x] Orders-throughput milestone: green, two sprints ahead\n" +
          "- [ ] Checkout-integration: amber (the cart-service dependency) — name it, with the plan B\n" +
          "- [ ] Returns-portal: green but the scope cut from June needs restating so nobody 'remembers' the old scope\n" +
          "- [ ] One slide, three RAGs, no heroic narrative",
        status: "in_progress",
        priority: "high",
        difficulty: "s",
        dueDate: relative(3),
        ageDays: -1,
        tags: ["q3-delivery", "delivery", "leads-sync", "ruth"],
      },

      // ───────────────────────── TODO — this week ────────────────────────────
      {
        id: "T-0008",
        type: "task",
        title: "1-1 prep — full week (all 8)",
        body:
          "Themes per person this week:\n\n" +
          "- [ ] Nina — promo expectations talk (honest odds)\n" +
          "- [ ] Oliver — THE conversation (T-0001)\n" +
          "- [ ] Kenji — the stay conversation (T-0003)\n" +
          "- [ ] Fatima — week-3 checkpoint, confusion audit\n" +
          "- [ ] Marco — wants more frontend work; broker with the hire timing\n" +
          "- [ ] Lin — conference talk submitted, celebrate it; ask about the on-call swap\n" +
          "- [ ] Priya — quiet lately in team meeting, gentle check\n" +
          "- [ ] Sam — growth plan 90-day review, he's crushing the SRE rotation",
        status: "todo",
        priority: "high",
        difficulty: "s",
        dueDate: relative(1),
        ageDays: -1,
        tags: ["1-1", "people", "orders-team"],
      },
      {
        id: "T-0009",
        type: "task",
        title: "Fix the on-call load imbalance",
        body:
          "Kenji and Lin carried 70% of pages last quarter (they know the billing code; the pager finds them). It's burning exactly the people I can't lose.\n\n" +
          "- [ ] Pull the pager stats — make the imbalance visible to the team, not an accusation\n" +
          "- [ ] Runbook gaps are the cause: the billing alerts have none — assign runbook-writing as this sprint's engineering work\n" +
          "- [ ] Rotation becomes truly even once runbooks exist; date it",
        status: "todo",
        priority: "high",
        difficulty: "m",
        ageDays: -2,
        tags: ["orders-team", "people", "process", "kenji"],
      },
      {
        id: "T-0010",
        type: "task",
        title: "Skip-level with Ruth — bring the real topics",
        body:
          "Monthly skip-prep. Bring: the Kenji retention case (need her support on comp), the cart-service escalation, and the question I keep avoiding — what does MY next role look like?",
        status: "todo",
        priority: "medium",
        difficulty: "xs",
        dueDate: relative(5),
        tags: ["skip-level", "ruth", "growth"],
      },
      {
        id: "T-0011",
        type: "task",
        title: "Team meeting agenda — make it theirs, not mine",
        body:
          "- [ ] Rotate facilitation: Lin's turn this week\n" +
          "- [ ] Demo slot: Fatima's first story (confidence builder, ask her first)\n" +
          "- [ ] Decision needed: the TypeScript strict-mode migration — team decides, I break ties only\n" +
          "- [ ] Drop my status section entirely — it's in the written update already",
        status: "todo",
        priority: "medium",
        difficulty: "xs",
        dueDate: relative(2),
        tags: ["team-meeting", "orders-team", "process"],
      },
      {
        id: "T-0012",
        type: "task",
        title: "Write the quarterly feedback for all 8 (calibration input)",
        body: "Calibration is in 3 weeks. One paragraph each: impact, growth edge, trajectory. Start now — the ones written in a rush are the unfair ones.",
        status: "todo",
        priority: "medium",
        difficulty: "m",
        dueDate: relative(12),
        tags: ["performance", "feedback", "people"],
      },
      {
        id: "T-0013",
        type: "task",
        title: "Approve conference budget requests (3 pending)",
        body: "Lin (speaking — auto-yes), Marco (attending, frontend conf — yes, ties to his growth plan), Sam (second conf this year — check the budget line first).",
        status: "todo",
        priority: "low",
        difficulty: "xs",
        tags: ["growth", "people", "orders-team"],
      },

      // ───────────────────────── BACKLOG — building the team that lasts ───────
      {
        id: "T-0014",
        type: "task",
        title: "Define the team's tech-investment budget (20% rule)",
        body:
          "Every sprint is 100% feature work and the debt shows (reconciliation bus-factor, missing runbooks, the strict-mode migration nobody starts).\n\n" +
          "- [ ] Propose: 20% of each sprint is team-chosen engineering investment\n" +
          "- [ ] Sell it to Ruth with the incident/velocity cost of NOT doing it\n" +
          "- [ ] Team picks the first three investments, not me",
        status: "backlog",
        priority: "medium",
        difficulty: "m",
        starred: true,
        tags: ["process", "delivery", "orders-team", "ruth"],
      },
      {
        id: "T-0015",
        type: "task",
        title: "Succession: who could run this team if I'm gone a month?",
        body: "Nina is the obvious answer but she wants the staff IC track, not management. Test interest gently — maybe Lin? Build the delegation ladder either way: she runs the next two team meetings and the Q3 review in my absence.",
        status: "backlog",
        priority: "low",
        difficulty: "m",
        tags: ["people", "growth", "nina"],
      },
      {
        id: "T-0016",
        type: "task",
        title: "Team offsite — H2 (half day, real work not trust falls)",
        body: "Format that worked last year: morning on 'how we work' (the team redesigns one process), lunch, afternoon hack on anything. Budget ~$80/head. Pick a week after the Q3 crunch.",
        status: "backlog",
        priority: "low",
        difficulty: "s",
        tags: ["orders-team", "people", "team-meeting"],
      },
      {
        id: "T-0017",
        type: "task",
        title: "Document the team's decision log (lightweight ADRs)",
        body: "We re-litigate settled decisions every time someone new joins (strict-mode, the queue choice, the no-Friday-deploy rule). One page per decision: context, choice, date. Fatima's onboarding confusion list is the seed material.",
        status: "backlog",
        priority: "low",
        difficulty: "s",
        tags: ["process", "onboarding", "orders-team"],
      },

      // ───────────────────────── DONE — recent ───────────────────────────────
      {
        id: "T-0018",
        type: "task",
        title: "Ship the Q2 performance reviews — all 8 delivered",
        body: "Every review delivered in a live conversation, written form after. No surprises in any of them — the weekly 1-1s did their job. Oliver's was the hardest; it set up this week's conversation.",
        status: "done",
        priority: "high",
        difficulty: "l",
        ageDays: -8,
        tags: ["performance", "feedback", "people"],
      },
      {
        id: "T-0019",
        type: "task",
        title: "Negotiate the Q3 scope cut for returns-portal",
        body: "Traded the bulk-returns feature out of Q3 for a hard commitment on the core flow. Product agreed once the data showed bulk was 3% of volume. Team morale visibly better with a believable plan.",
        status: "done",
        priority: "high",
        difficulty: "m",
        ageDays: -10,
        tags: ["q3-delivery", "delivery", "process"],
      },
      {
        id: "T-0020",
        type: "task",
        title: "Fatima's first-week setup — zero-friction start",
        body: "Laptop, access, buddy, starter ticket all ready on day 1. She merged a PR on day 4. Onboarding checklist updated with the two snags she hit (VPN doc stale, test-data seed broken).",
        status: "done",
        priority: "medium",
        difficulty: "s",
        ageDays: -16,
        tags: ["onboarding", "fatima", "process"],
      },

      // ───────────────────────── NOTES — manager output ──────────────────────
      {
        id: "N-0001",
        type: "note",
        title: "1-1 notes — Kenji (raw, the recruiter conversation)",
        body:
          "kenji opened with it himself which i appreciate - recruiter from a fintech, serious enough that he did a first call. " +
          "he's not gone, he said so, but 'i want this to be a real conversation not a counteroffer dance'. fair. " +
          "what's actually bothering him: on call load (he carries the billing pager basically alone), and scope - " +
          "he's been senior 3 years and the staff path here looks foggy to him. comp came up third, not first, telling. " +
          "what id need: runbooks + rotation fix (already planned, accelerate it), a real staff-track conversation with ruth, " +
          "comp check against band. he gave me 2 weeks before he decides on a second call. dont waste them",
        status: null,
        priority: "urgent",
        difficulty: "s",
        starred: true,
        ageDays: 0,
        tags: ["1-1", "kenji", "people"],
      },
      {
        id: "N-0002",
        type: "note",
        title: "Oliver — evidence and framing for the conversation",
        body:
          "## The three examples (behavior → impact)\n" +
          "1. Sprint 28: committed to the refund-events story, went quiet for 4 days, flagged the miss at the last standup. Squad scrambled; Lin worked the weekend.\n" +
          "2. Sprint 29: review on Nina's schema PR — dismissive tone, blocked 3 days over a style preference. Nina now routes reviews around him.\n" +
          "3. Sprint 30: skipped two team meetings without a word, missed the strict-mode decision, then re-opened it in Slack.\n\n" +
          "## Framing\n" +
          "Pattern, not incidents: communication when things go sideways. The work itself is solid when it lands — say that too, it's true.\n\n" +
          "## What support looks like\n" +
          "Earlier flags (a 'yellow' is free, a silent 'red' isn't), review SLA norms, and asking what's underneath — three sprints of this from a previously fine engineer is a signal, not a character trait.",
        status: null,
        priority: "urgent",
        difficulty: "m",
        starred: true,
        ageDays: -1,
        tags: ["oliver", "performance", "feedback", "hr-bp"],
      },
      {
        id: "N-0003",
        type: "note",
        title: "Team meeting notes — Tue",
        body:
          "Lin facilitated (rotation working).\n\n" +
          "- **Strict-mode migration:** team voted to do it incrementally — new files strict now, directory-by-directory backfill, Marco owns the tracking issue. I said nothing; they landed where I'd have pushed anyway. Better this way.\n" +
          "- **Fatima demo'd her first story** — order-status badge. Genuine applause. She visibly relaxed.\n" +
          "- **On-call pain surfaced organically** — Kenji described the 3am billing page with no runbook. Perfect setup for the rotation fix; I named the sprint commitment on the spot.\n" +
          "- Parking lot: Priya asked about the hiring timeline twice — the team is feeling the gap. Close the req.",
        status: null,
        priority: "medium",
        difficulty: "s",
        ageDays: 0,
        tags: ["team-meeting", "orders-team"],
      },
      {
        id: "N-0004",
        type: "note",
        title: "Nina promo — narrative draft fragments",
        body:
          "## The case in one line\n" +
          "Nina operates at staff scope already: the checkout-integration design unblocked two other teams and prevented a class of incident we'd had three of.\n\n" +
          "## Evidence\n" +
          "- Event-schema redesign: adopted by Orders + 2 partner teams; the duplicate-event incidents (3 in H1) have been zero since.\n" +
          "- Led the integration design across 4 teams' opinions without me in the room.\n" +
          "- Peer feedback themes: 'makes the complex thing feel obvious', 'disagrees without heat'.\n\n" +
          "## Committee risks\n" +
          "- Cycle is competitive; cross-team impact is only 2 quarters deep.\n" +
          "- Counter: the impact is verifiable and ongoing, not a one-off project.\n\n" +
          "## If it doesn't land\n" +
          "Have the plan ready same week: what specifically closes the gap, and a named Q1 re-submission. Do NOT let it dangle.",
        status: null,
        priority: "high",
        difficulty: "m",
        ageDays: -2,
        tags: ["nina", "performance", "growth", "people"],
      },
      {
        id: "N-0005",
        type: "note",
        title: "Hiring debrief — candidate A (senior FE)",
        body:
          "Panel: 3 yes, 1 weak-yes.\n\n" +
          "- **Coding (yes):** clean, pragmatic, narrated tradeoffs unprompted.\n" +
          "- **System design (yes):** strong on state management at scale; asked about OUR architecture before proposing — good instinct.\n" +
          "- **Collaboration (weak-yes):** fine but rehearsed; interviewer couldn't get past the polish. My read: senior-candidate interview fatigue, not a flag — her references will tell.\n" +
          "- **Values (yes):** the conflict story was real and reflective.\n\n" +
          "Comp reality: she's 8% over our band mid. Worth the fight if Thursday's candidate B doesn't change the picture — A raises the team's ceiling, B fills the gap. Decide Friday as planned, no drift.",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: -1,
        tags: ["hiring-fe", "hiring"],
      },
      {
        id: "N-0006",
        type: "note",
        title: "Leads sync — notes",
        body:
          "- Q3 RAGs presented: my amber on checkout-integration landed fine BECAUSE the plan B was attached. Ruth's note after: 'amber with a plan reads as control, red with a surprise reads as failure'. Keeping that.\n" +
          "- Cart-service dependency: their manager finally gave a real date (2 sprints). Joint escalation paused; plan B proceeds anyway — trust but build the adapter.\n" +
          "- Org change rumor (re-org of the platform group) — Ruth says contained, doesn't touch Orders. Don't feed the rumor mill, do answer directly if asked.\n" +
          "- Calibration date confirmed: 3 weeks. All 8 write-ups due the Friday before.",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: -1,
        tags: ["leads-sync", "q3-delivery", "ruth", "delivery"],
      },
      {
        id: "N-0007",
        type: "note",
        title: "Fatima — onboarding confusion audit (week 3)",
        body:
          "Her fresh-eyes list, verbatim where possible (this is gold for the decision log):\n\n" +
          "- 'Why do deploys skip Friday? Nobody could tell me the incident it came from.' → decision log entry needed\n" +
          "- 'The test-data seed README says run X, but everyone actually runs Y.' → docs drift, assigned to her to fix (owns her own unblock)\n" +
          "- 'Standup talks about tickets but planning talks about goals — which one is the real unit?' → genuinely good question, raising at retro\n" +
          "- 'Who decides architecture here? RFCs exist but Kenji-asks seem to be the real path.' → ouch, accurate. Bus-factor again.\n\n" +
          "Pattern: our written norms lag our real norms by about a year. The decision-log backlog item just got its business case.",
        status: null,
        priority: "medium",
        difficulty: "s",
        ageDays: 0,
        tags: ["fatima", "onboarding", "process"],
      },
      {
        id: "N-0008",
        type: "note",
        title: "Pager stats — the imbalance, quantified",
        body:
          "Last quarter, 142 pages total:\n\n" +
          "| Person | Pages | % | Out-of-hours |\n" +
          "|--------|-------|---|--------------|\n" +
          "| Kenji  | 61    | 43% | 19 |\n" +
          "| Lin    | 38    | 27% | 11 |\n" +
          "| Others (6) | 43 | 30% | 9 |\n\n" +
          "Root cause: 71% of Kenji's pages are billing-reconciliation alerts with no runbook — the rotation routes around ignorance, not effort.\n\n" +
          "Fix sequence: (1) runbooks for the top 5 billing alerts this sprint, (2) Fatima pairs on reconciliation, (3) strict rotation from next month. Present to the team as data, let them own the runbook split.",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: -2,
        tags: ["orders-team", "process", "kenji", "people"],
      },
      {
        id: "N-0009",
        type: "note",
        title: "Inbox: thought — my own growth question",
        body:
          "Keep deferring this: Ruth asked twice what I want next and I keep answering with team plans. " +
          "Honest options: bigger team / two teams (more of the same, but scaled), product-line ownership (closer to business), or back toward staff-IC (I miss building, but do I miss it enough?). " +
          "Take it to the skip-level instead of dodging. The team is stable enough to survive me having ambitions.",
        status: null,
        priority: "low",
        difficulty: "xs",
        ageDays: 0,
        tags: ["inbox", "growth", "skip-level"],
      },
      {
        id: "N-0010",
        type: "note",
        title: "Calibration prep — trajectory snapshot (all 8)",
        body:
          "One line each, drafted early so calibration isn't a rush job:\n\n" +
          "- **Nina** — exceeding; staff case submitted this cycle.\n" +
          "- **Kenji** — strong; retention risk being worked; staff-track conversation owed.\n" +
          "- **Lin** — strong and rising; facilitation + conference talk show the leadership edge.\n" +
          "- **Marco** — solid; growth bet on frontend depth pending the hire.\n" +
          "- **Priya** — solid; quieter this quarter — check before I write anything.\n" +
          "- **Sam** — solid+; SRE rotation unlocked something, growth plan ahead of schedule.\n" +
          "- **Fatima** — too early to rate; signals strongly positive.\n" +
          "- **Oliver** — below expectations this quarter; conversation this week, trajectory depends on the next 6.",
        status: null,
        priority: "high",
        difficulty: "m",
        ageDays: -1,
        tags: ["performance", "people", "feedback"],
      },
      {
        id: "N-0011",
        type: "note",
        title: "Weekly priorities (Mon)",
        body:
          "Top 3 this week:\n\n" +
          "1. **The Oliver conversation** — Tuesday. Clear is kind; I've delayed it one sprint too long.\n" +
          "2. **Kenji retention plan moving** — comp check with HR, staff-track raised with Ruth, runbook sprint commitment public.\n" +
          "3. **Hire decision Friday** — both candidates closed respectfully within 48h.\n\n" +
          "Keep an eye on: Nina promo pre-read with Ruth, Q3 amber narrative, Fatima week-3.",
        status: null,
        priority: "high",
        difficulty: "xs",
        ageDays: -1,
        tags: ["people", "1-1", "delivery"],
      },
    ],
  };
}

/** ISO date string N days from today (used for due dates). */
function relative(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}
