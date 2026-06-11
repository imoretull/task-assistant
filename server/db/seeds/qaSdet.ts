import type { SeedData } from "../seed.js";

/**
 * Demo workspace — a release week in the life of Dmitri Volkov, QA SDET /
 * Automation Engineer on a payments platform. Owns the e2e and API test
 * suites, the test side of the CI pipeline, release sign-off, and the
 * never-ending war on flaky tests — plus coaching developers to write their
 * own tests. Tasks land across every board column and notes capture real QA
 * output (triage logs, test plans, release reports), so every feature has
 * rich material to work on.
 *
 * Tag taxonomy:
 *   Projects   — e2e-suite, api-tests, mobile-regression, perf-tests, ci-pipeline
 *   Cadence    — standup, 1-1, release, triage
 *   Categories — flaky, automation, test-plan, coverage, tooling, bug,
 *                quality-gate, inbox
 */
export function qaSdetSeed(): SeedData {
  return {
    tags: [
      // projects (own sidebar section)
      { name: "e2e-suite", color: "purple", kind: "project" },
      { name: "api-tests", color: "blue", kind: "project" },
      { name: "mobile-regression", color: "amber", kind: "project" },
      { name: "perf-tests", color: "green", kind: "project" },
      { name: "ci-pipeline", color: "red", kind: "project" },
      // people (own sidebar section)
      { name: "elena", color: "blue", kind: "person" }, // QA manager
      { name: "marcus-dev", color: "green", kind: "person" }, // senior dev, payments
      { name: "priti", color: "purple", kind: "person" }, // release manager
      { name: "joao", color: "amber", kind: "person" }, // junior QA I'm coaching
      { name: "infra-team", color: "red", kind: "person" },
      // cadence / meetings
      { name: "standup", color: "green" },
      { name: "1-1", color: "blue" },
      { name: "release", color: "red" },
      { name: "triage", color: "amber" },
      // categories
      { name: "flaky", color: "red" },
      { name: "automation", color: "purple" },
      { name: "test-plan", color: "blue" },
      { name: "coverage", color: "green" },
      { name: "tooling", color: "gray" },
      { name: "bug", color: "red" },
      { name: "quality-gate", color: "amber" },
      { name: "inbox", color: "gray" },
    ],
    items: [
      // ───────────────────────── URGENT / BLOCKED — release week fire ────────
      {
        id: "T-0001",
        type: "task",
        title: "Sign off release 24.6 — regression run has 3 unexplained failures",
        body:
          "Release cut is tomorrow 10am. Full regression: 1,412 passed, 3 failed, 9 flaky-retried-green.\n\n" +
          "- [x] Re-run the 3 failures in isolation — 2 pass (flaky), 1 reproduces\n" +
          "- [ ] The real one: refund flow returns 200 but the ledger entry is missing — escalate to Marcus NOW\n" +
          "- [ ] File the 2 flaky specs into the quarantine workflow with tickets\n" +
          "- [ ] Go / no-go to Priti by 17:00 with evidence either way\n\n" +
          "**Position:** no sign-off while the refund-ledger failure is unexplained. It smells like a real race in the new async ledger writer.",
        status: "in_progress",
        priority: "urgent",
        difficulty: "m",
        starred: true,
        dueDate: relative(1),
        ageDays: -1,
        tags: ["release", "e2e-suite", "quality-gate", "marcus-dev", "priti"],
      },
      {
        id: "T-0002",
        type: "task",
        title: "Blocked: mobile device farm out of iOS 17 devices",
        body:
          "The mobile regression suite needs iOS 17 + 18 coverage; the device-farm vendor pool has zero iOS 17 devices free all week (another team booked the lot).\n\n" +
          "- [x] Confirm with the vendor it's contention, not an outage\n" +
          "- [ ] Ask infra-team if we can pin 2 dedicated devices to our plan\n" +
          "- [ ] Meanwhile: run iOS 17 smoke on the office physical devices, mark the gap in the release report",
        status: "blocked",
        priority: "high",
        difficulty: "s",
        starred: true,
        ageDays: -2,
        tags: ["mobile-regression", "infra-team", "release", "tooling"],
      },
      {
        id: "T-0003",
        type: "task",
        title: "Bisect the CI slowdown — e2e stage 22min → 41min this month",
        body:
          "The e2e CI stage nearly doubled in a month and devs are starting to skip it locally.\n\n" +
          "- [x] Pull stage timings for the last 60 days — jump correlates with the Docker base-image change\n" +
          "- [ ] Confirm: pin the old image on a branch, compare 5 runs\n" +
          "- [ ] If confirmed, file with infra-team; if not, profile the top 20 slowest specs",
        status: "in_progress",
        priority: "high",
        difficulty: "m",
        ageDays: -3,
        tags: ["ci-pipeline", "tooling", "infra-team"],
      },

      // ───────────────────────── IN PROGRESS — active automation work ────────
      {
        id: "T-0004",
        type: "task",
        title: "Build contract-test suite for the payments API (Pact)",
        body:
          "The big quarter goal: consumer-driven contracts between checkout (consumer) and payments-api (provider) so integration breaks surface in CI, not in staging.\n\n" +
          "- [x] Pact broker stood up, CI publishes consumer contracts\n" +
          "- [x] First contract: create-payment happy path\n" +
          "- [ ] Cover the 4 error contracts (declined, 3DS-required, idempotency-conflict, rate-limited)\n" +
          "- [ ] Provider verification gate in payments-api CI (with Marcus)\n" +
          "- [ ] Can-i-deploy check wired into the release pipeline",
        status: "in_progress",
        priority: "high",
        difficulty: "l",
        starred: true,
        dueDate: relative(10),
        ageDays: -6,
        tags: ["api-tests", "automation", "ci-pipeline", "marcus-dev"],
      },
      {
        id: "T-0005",
        type: "task",
        title: "Kill the top-5 flaky specs (flake board week 3)",
        body:
          "Systematic flake burn-down. This week's top 5 by retry rate:\n\n" +
          "- [x] `checkout_address` — race on postcode debounce → intercept alias (fixed)\n" +
          "- [x] `refund_partial` — shared test user balance contention → per-test user factory (fixed)\n" +
          "- [ ] `login_2fa` — OTP timing, fails on slow runners → mock the clock\n" +
          "- [ ] `report_export` — polls for a file with a 5s cap → poll until job-status endpoint says done\n" +
          "- [ ] `webhook_replay` — order-dependent, leaks state from `webhook_create` → isolate fixtures",
        status: "in_progress",
        priority: "high",
        difficulty: "m",
        ageDays: -4,
        tags: ["flaky", "e2e-suite", "automation"],
      },
      {
        id: "T-0006",
        type: "task",
        title: "Test plan for the new instant-payouts feature",
        body:
          "Feature hits staging next sprint. Risk-based plan, not a spec dump.\n\n" +
          "- [x] Read the design doc + threat model\n" +
          "- [x] Risk workshop with Marcus's team — top risks: limits bypass, double-payout on retry, KYC state races\n" +
          "- [ ] Write the plan: API-level for limits/idempotency, e2e for the 3 user journeys, chaos case for the webhook retry storm\n" +
          "- [ ] Review with Elena, then walk the dev team through it",
        status: "in_progress",
        priority: "high",
        difficulty: "m",
        dueDate: relative(5),
        ageDays: -3,
        tags: ["test-plan", "api-tests", "elena", "marcus-dev"],
      },
      {
        id: "T-0007",
        type: "task",
        title: "Coach Joao through his first Playwright suite",
        body:
          "Joao is automating the manual KYC-onboarding checklist — his first real automation project.\n\n" +
          "- [x] Pair on the page-object setup\n" +
          "- [ ] Review his selector strategy (he's reaching for XPath — show data-testid + role locators)\n" +
          "- [ ] Teach the await-no-sleep rule with his own failing test as the example\n" +
          "- [ ] Get his suite into CI as non-blocking first, promote when stable a week",
        status: "in_progress",
        priority: "medium",
        difficulty: "s",
        ageDays: -2,
        tags: ["1-1", "e2e-suite", "automation", "joao"],
      },

      // ───────────────────────── TODO — this week ────────────────────────────
      {
        id: "T-0008",
        type: "task",
        title: "Add k6 load profile for the payouts endpoint",
        body:
          "Perf gap: payouts has no load test and instant-payouts will multiply traffic.\n\n" +
          "- [ ] Baseline: current p95/p99 at production-like RPS\n" +
          "- [ ] Stress: find the knee, document the failure mode\n" +
          "- [ ] Wire into the nightly perf job with threshold alerts",
        status: "todo",
        priority: "high",
        difficulty: "m",
        dueDate: relative(7),
        ageDays: -1,
        tags: ["perf-tests", "api-tests", "automation"],
      },
      {
        id: "T-0009",
        type: "task",
        title: "Quarantine workflow v2: auto-file tickets for flaky specs",
        body:
          "Right now quarantining is manual and specs rot there. Build the loop:\n\n" +
          "- [ ] CI detects 3 retry-passes in 7 days → opens a ticket with the failure traces, assigns the code owner\n" +
          "- [ ] Quarantined spec with no commit in 14 days → escalates to the team channel\n" +
          "- [ ] Dashboard tile: quarantine count trend (goal: down and to the right)",
        status: "todo",
        priority: "medium",
        difficulty: "m",
        ageDays: -2,
        tags: ["flaky", "ci-pipeline", "tooling", "automation"],
      },
      {
        id: "T-0010",
        type: "task",
        title: "Review coverage gap report — payments service at 54% branch",
        body:
          "Quarterly coverage review. Payments service branch coverage is 54% — but coverage % isn't the point: map the uncovered branches to risk.\n\n" +
          "- [ ] Identify uncovered branches in money-moving paths (those matter)\n" +
          "- [ ] Ignore the uncovered logging/config branches (those don't)\n" +
          "- [ ] Bring a targeted top-10 list to Marcus, not a blanket 'raise coverage' demand",
        status: "todo",
        priority: "medium",
        difficulty: "s",
        dueDate: relative(9),
        tags: ["coverage", "api-tests", "marcus-dev"],
      },
      {
        id: "T-0011",
        type: "task",
        title: "1-1 prep: Elena — propose the 'quality engineer per squad' model",
        body:
          "I'm the bottleneck: every squad routes automation through me. Pitch: I build the platform + standards, each squad owns its own tests, I review and coach. Bring the numbers — my review queue is 11 days deep.",
        status: "todo",
        priority: "medium",
        difficulty: "xs",
        dueDate: relative(2),
        ageDays: -1,
        tags: ["1-1", "elena"],
      },
      {
        id: "T-0012",
        type: "task",
        title: "Upgrade Playwright 1.42 → 1.46 across suites",
        body: "Four minor versions behind. Changelog has the aria-snapshot assertions we want for the a11y checks. Run the full suite on a branch first.",
        status: "todo",
        priority: "low",
        difficulty: "s",
        tags: ["tooling", "e2e-suite"],
      },
      {
        id: "T-0013",
        type: "task",
        title: "Document the test-data factory API for dev teams",
        body: "Devs keep creating test users by hand and colliding. The factory exists — it just has no docs. Write the README with the 5 common recipes.",
        status: "todo",
        priority: "low",
        difficulty: "xs",
        tags: ["tooling", "automation", "coverage"],
      },

      // ───────────────────────── BACKLOG — strategic / later ─────────────────
      {
        id: "T-0014",
        type: "task",
        title: "Synthetic monitoring: run the smoke suite against production",
        body:
          "The smoke pack (12 critical journeys) could run against prod every 10 min with synthetic cards and a canary tenant. Catches what staging can't.\n\n" +
          "- [ ] Safe-data plan: canary tenant, synthetic cards, no real money movement\n" +
          "- [ ] Alert routing to the on-call, not to QA\n" +
          "- [ ] Pitch to Elena + infra as the next quarter goal",
        status: "backlog",
        priority: "medium",
        difficulty: "xl",
        starred: true,
        tags: ["e2e-suite", "automation", "tooling"],
      },
      {
        id: "T-0015",
        type: "task",
        title: "Mutation testing pilot on the payments domain logic",
        body: "Coverage says 80%+, but do the tests actually assert anything? Run Stryker on the fee-calculation module as a pilot and see what survives.",
        status: "backlog",
        priority: "low",
        difficulty: "m",
        tags: ["coverage", "api-tests"],
      },
      {
        id: "T-0016",
        type: "task",
        title: "Visual regression for the merchant dashboard",
        body: "Three CSS regressions reached prod this quarter. Evaluate Playwright screenshots vs Chromatic — decide on diff-noise handling before committing.",
        status: "backlog",
        priority: "low",
        difficulty: "m",
        tags: ["e2e-suite", "tooling"],
      },
      {
        id: "T-0017",
        type: "task",
        title: "Chaos test: kill the payment provider mid-transaction",
        body: "We've never tested provider-down mid-flow in a controlled way. Design the failure injection at the API-gateway layer in staging.",
        status: "backlog",
        priority: "medium",
        difficulty: "l",
        tags: ["api-tests", "perf-tests", "test-plan"],
      },

      // ───────────────────────── DONE — recently shipped ─────────────────────
      {
        id: "T-0018",
        type: "task",
        title: "Parallelize the e2e suite across 8 shards",
        body: "Suite wall-time 38min → 9min on PRs. Sharding by historical spec duration, not file count — the balance holds within ±40s.",
        status: "done",
        priority: "high",
        difficulty: "l",
        ageDays: -8,
        tags: ["ci-pipeline", "e2e-suite", "automation"],
      },
      {
        id: "T-0019",
        type: "task",
        title: "Release 24.5 sign-off",
        body: "Clean run: 1,398 passed, 0 real failures, 6 flaky-retried (all ticketed). Signed off on schedule; zero escaped defects so far.",
        status: "done",
        priority: "high",
        difficulty: "s",
        ageDays: -10,
        tags: ["release", "quality-gate"],
      },
      {
        id: "T-0020",
        type: "task",
        title: "Replace hard waits with event-based waits in the smoke pack",
        body: "All 31 `waitForTimeout` calls in the smoke pack replaced with locator/response waits. Smoke flake rate 4.1% → 0.3% over two weeks.",
        status: "done",
        priority: "medium",
        difficulty: "m",
        ageDays: -12,
        tags: ["flaky", "e2e-suite"],
      },

      // ───────────────────────── NOTES — QA output ───────────────────────────
      {
        id: "N-0001",
        type: "note",
        title: "Standup notes — Tue",
        body:
          "**Yesterday:** regression run for 24.6 complete; 3 failures triaged — 2 flaky (ticketed), 1 real (refund-ledger, escalated to Marcus). Two more flake-board specs fixed.\n\n" +
          "**Today:** chase the refund-ledger repro with Marcus, go/no-go evidence to Priti by 17:00. Joao pairing at 3.\n\n" +
          "**Blockers:** device farm still has zero iOS 17 devices; CI e2e stage slowdown pending the base-image bisect.",
        status: null,
        priority: "medium",
        difficulty: "xs",
        ageDays: 0,
        tags: ["standup", "release"],
      },
      {
        id: "N-0002",
        type: "note",
        title: "Triage log — refund-ledger failure (raw)",
        body:
          "ok the refund failure. e2e does refund then asserts ledger entry exists, gets 200 on the refund but ledger query " +
          "comes back empty. not flaky - repros 4 out of 10 locally if i hammer it. timing smells like the new async ledger writer, " +
          "the refund api returns before the write commits now. checked with marcus - yes they made the ledger write async last sprint " +
          "for latency. so either the test needs to poll (if eventual consistency is the actual contract now) or this is a real bug " +
          "because the api docs still say the entry is readable after 200. marcus checking with their pm. if the contract changed " +
          "thats a breaking change nobody announced and i want it in the release notes either way. holding signoff till this is decided",
        status: null,
        priority: "urgent",
        difficulty: "s",
        starred: true,
        ageDays: 0,
        tags: ["release", "bug", "api-tests", "marcus-dev", "triage"],
      },
      {
        id: "N-0003",
        type: "note",
        title: "Release 24.6 — sign-off evidence draft",
        body:
          "## Scope\n" +
          "Payments 24.6: instant-payout groundwork, refund API latency work, 14 bugfixes.\n\n" +
          "## Test results\n" +
          "- Full regression: 1,412 pass / 3 fail → 2 flaky (TKT-4411, TKT-4412), 1 under investigation (refund-ledger)\n" +
          "- API contract suite: green, incl. new idempotency contracts\n" +
          "- Perf: refund p95 improved 31%, no regression elsewhere\n" +
          "- Mobile: Android full pass; **iOS 17 gap** — smoke only, on physical devices (farm contention)\n\n" +
          "## Open risks\n" +
          "1. Refund-ledger consistency — **blocking** until the contract question is answered\n" +
          "2. iOS 17 coverage gap — non-blocking, flagged\n\n" +
          "**Recommendation:** hold the cut until risk 1 resolves. Everything else is green.",
        status: null,
        priority: "urgent",
        difficulty: "m",
        starred: true,
        ageDays: 0,
        tags: ["release", "quality-gate", "priti"],
      },
      {
        id: "N-0004",
        type: "note",
        title: "Instant-payouts risk workshop — output",
        body:
          "With Marcus's team, 45 min, risk-storming format.\n\n" +
          "## Top risks (test these hard)\n" +
          "1. **Limits bypass** — concurrent payout requests racing the daily-limit check. API-level concurrency tests.\n" +
          "2. **Double payout on retry** — client retries after timeout; idempotency keys MUST hold. Contract + chaos tests.\n" +
          "3. **KYC state races** — payout initiated while KYC downgrade in flight. State-machine table test.\n\n" +
          "## Explicitly out of scope\n" +
          "- Provider-side failures (covered by their SLA, we test our handling only)\n" +
          "- Load beyond 5× current peak (capacity team owns)\n\n" +
          "Plan doc due to Elena by Friday.",
        status: null,
        priority: "high",
        difficulty: "m",
        ageDays: -3,
        tags: ["test-plan", "api-tests", "triage"],
      },
      {
        id: "N-0005",
        type: "note",
        title: "Flake board — week 3 stats",
        body:
          "## Trend\n" +
          "- Retry rate: 6.8% → 3.1% over three weeks\n" +
          "- Quarantine count: 14 → 6\n" +
          "- Mean time in quarantine: 19 days → 8 days\n\n" +
          "## Patterns in the fixes so far\n" +
          "- 60% timing (hard waits, debounce races) → event-based waits\n" +
          "- 25% shared state (test users, fixtures) → per-test factories\n" +
          "- 15% order dependence → fixture isolation\n\n" +
          "Worth a lunch-and-learn: the same three patterns cover almost everything. Devs can self-serve these fixes.",
        status: null,
        priority: "medium",
        difficulty: "s",
        ageDays: -1,
        tags: ["flaky", "e2e-suite", "coverage"],
      },
      {
        id: "N-0006",
        type: "note",
        title: "Pairing notes — Joao's selector strategy",
        body:
          "Session went well. Covered:\n\n" +
          "- XPath → role/test-id locators: rewrote 6 of his selectors live; his `//div[3]/span` broke the moment design moved a wrapper. Lesson landed.\n" +
          "- The await-no-sleep rule: his `sleep(2000)` before the KYC status check became `expect(status).toHaveText('Verified')` with auto-retry. His test got faster AND stabler — good moment.\n" +
          "- He asked smart questions about when e2e vs API-level. Gave him the pyramid talk: if it can be an API test, it is one.\n\n" +
          "Next session: fixtures and test-data factories. His suite goes into CI non-blocking on Thursday.",
        status: null,
        priority: "medium",
        difficulty: "s",
        ageDays: -1,
        tags: ["joao", "1-1", "automation", "e2e-suite"],
      },
      {
        id: "N-0007",
        type: "note",
        title: "CI slowdown bisect — findings",
        body:
          "## Timeline\n" +
          "- e2e stage p50: 22min (60 days ago) → 41min (now)\n" +
          "- Step change on the 14th — same day the Docker base image moved to the new registry\n\n" +
          "## Branch test (5 runs each)\n" +
          "- Old image pinned: 23m 40s avg\n" +
          "- Current image: 40m 10s avg\n\n" +
          "**Confirmed.** Image pull is fine; it's CPU throttling — new image runs on the burstable node pool. Filed INFRA-2291 with the data. Workaround until then: pin the old image in our stage config (done on a branch, ready to merge if infra drags).",
        status: null,
        priority: "high",
        difficulty: "m",
        ageDays: -1,
        tags: ["ci-pipeline", "infra-team", "tooling"],
      },
      {
        id: "N-0008",
        type: "note",
        title: "1-1 with Elena — raw notes",
        body:
          "pitched the quality engineer per squad model. she's receptive but worried squads will deprioritize test work " +
          "the moment a deadline hits, which, fair. her counter: pilot with one squad first - marcus's team since theyre " +
          "already good citizens. i build the platform and standards, they own their suite, i review weekly. " +
          "if their escaped-defect rate stays flat after a quarter we roll it out. also she wants me to present the flake " +
          "board results at the eng all-hands, the 6.8 to 3.1 number is a good story. " +
          "career stuff: she said the synthetic monitoring proposal is staff-scope work, write it up properly",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: 0,
        tags: ["1-1", "elena"],
      },
      {
        id: "N-0009",
        type: "note",
        title: "Inbox: idea — failure-message lint for assertions",
        body:
          "Half the suite's assertions fail with 'expected true to be false' — useless at 2am. " +
          "A custom ESLint rule could require a message argument on bare boolean asserts. Cheap to build, compounding payoff. Park for a Friday afternoon.",
        status: null,
        priority: "low",
        difficulty: "xs",
        ageDays: 0,
        tags: ["inbox", "tooling", "automation"],
      },
      {
        id: "N-0010",
        type: "note",
        title: "Quality gates review — what blocks a merge today",
        body:
          "Current PR gates (audit for the eng-process doc):\n\n" +
          "1. Unit + integration suites green (blocking)\n" +
          "2. Changed-files coverage ≥ 70% (blocking — teams game this with shallow asserts, see mutation-testing idea)\n" +
          "3. E2e smoke pack (blocking, 9 min)\n" +
          "4. Full e2e (non-blocking on PR, blocking on the release branch)\n" +
          "5. Contract verification (blocking for payments-api consumers only — expand?)\n\n" +
          "Gaps: no perf gate on PRs (nightly only), no a11y gate at all. Proposing both for next quarter — perf as non-blocking trend first, a11y smoke as blocking on the 5 critical pages.",
        status: null,
        priority: "medium",
        difficulty: "s",
        ageDays: -2,
        tags: ["quality-gate", "ci-pipeline", "coverage"],
      },
      {
        id: "N-0011",
        type: "note",
        title: "Weekly priorities (Mon)",
        body:
          "Top 3 this week:\n\n" +
          "1. **24.6 sign-off** — resolve the refund-ledger question, evidence to Priti. No pressure-signing.\n" +
          "2. **Contract suite error cases** — the 4 error contracts done, provider gate agreed with Marcus.\n" +
          "3. **Joao's suite into CI** — non-blocking Thursday, his first shipped automation.\n\n" +
          "Keep an eye on: device farm contention, INFRA-2291 (CI slowdown), flake board trend.",
        status: null,
        priority: "high",
        difficulty: "xs",
        ageDays: -1,
        tags: ["release", "api-tests", "standup"],
      },
    ],
  };
}

/** ISO date string N days from today (used for due dates). */
function relative(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}
