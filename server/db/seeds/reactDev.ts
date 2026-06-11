import type { SeedData } from "../seed.js";

/**
 * Demo workspace — a sprint in the life of Maya Chen, Senior React Developer
 * on a fintech checkout team. Mixes feature work, code review, performance
 * profiling, design-system contributions, mentoring a junior dev, and the
 * steady drip of bugs and tech debt. Tasks land across every board column and
 * notes capture real engineering output (PR review notes, debugging logs,
 * pairing notes), so every feature has rich material to work on.
 *
 * Tag taxonomy:
 *   Projects   — checkout-v2, design-system, dashboard, perf, a11y
 *   Cadence    — standup, 1-1, sprint, retro
 *   Categories — code-review, bug, tech-debt, testing, refactor, mentoring,
 *                tooling, inbox
 */
export function reactDevSeed(): SeedData {
  return {
    tags: [
      // projects (own sidebar section)
      { name: "checkout-v2", color: "purple", kind: "project" },
      { name: "design-system", color: "blue", kind: "project" },
      { name: "dashboard", color: "green", kind: "project" },
      { name: "perf", color: "amber", kind: "project" },
      { name: "a11y", color: "red", kind: "project" },
      // people (own sidebar section)
      { name: "jordan", color: "blue", kind: "person" }, // tech lead
      { name: "priya-pm", color: "purple", kind: "person" }, // product manager
      { name: "sam-design", color: "amber", kind: "person" }, // product designer
      { name: "tom", color: "green", kind: "person" }, // junior dev I mentor
      { name: "raj", color: "red", kind: "person" }, // backend counterpart
      // cadence / meetings
      { name: "standup", color: "green" },
      { name: "1-1", color: "blue" },
      { name: "sprint", color: "amber" },
      { name: "retro", color: "gray" },
      // categories
      { name: "code-review", color: "purple" },
      { name: "bug", color: "red" },
      { name: "tech-debt", color: "gray" },
      { name: "testing", color: "green" },
      { name: "refactor", color: "blue" },
      { name: "mentoring", color: "amber" },
      { name: "tooling", color: "gray" },
      { name: "inbox", color: "gray" },
    ],
    items: [
      // ───────────────────────── URGENT / BLOCKED — firefighting ─────────────
      {
        id: "T-0001",
        type: "task",
        title: "Fix production crash: checkout wizard loses state on refresh",
        body:
          "Sentry spike since yesterday's deploy — `CheckoutWizard` throws when the persisted step no longer exists after the A/B variant flag flips mid-session.\n\n" +
          "- [x] Reproduce with the `variant-b` flag forced on\n" +
          "- [x] Confirm blast radius (~3% of sessions, recoverable by hard refresh)\n" +
          "- [ ] Guard the step-restore against unknown step ids\n" +
          "- [ ] Add a regression test for flag flips mid-flow\n" +
          "- [ ] Ship hotfix behind the release manager's approval\n\n" +
          "**Root cause:** persisted wizard state stores a step index, not a step id, so removing a step shifts everything.",
        status: "in_progress",
        priority: "urgent",
        difficulty: "m",
        starred: true,
        ageDays: -1,
        tags: ["checkout-v2", "bug"],
      },
      {
        id: "T-0002",
        type: "task",
        title: "Blocked: payment-methods API contract still missing wallet types",
        body:
          "The saved-payment-methods panel can't render Apple Pay / Google Pay rows until the API returns `walletType`. Raj's PR is stuck in their team's review queue.\n\n" +
          "- [x] Agree the contract shape with Raj (`walletType: 'apple' | 'google' | null`)\n" +
          "- [ ] Ping Raj — backend PR needs a second reviewer\n" +
          "- [ ] If not merged by Thu, build against a mocked response and flag the risk in standup",
        status: "blocked",
        priority: "urgent",
        difficulty: "s",
        starred: true,
        ageDays: -3,
        tags: ["checkout-v2", "raj", "standup"],
      },
      {
        id: "T-0003",
        type: "task",
        title: "Triage flaky Cypress spec quarantining half the checkout suite",
        body:
          "`checkout_address.cy.ts` fails ~1 in 5 runs on CI only. The whole folder got quarantined, so checkout changes are sailing through without e2e coverage.\n\n" +
          "- [ ] Pull the CI videos — looks like a race with the postcode lookup debounce\n" +
          "- [ ] Replace the fixed `wait(500)` with an intercept alias\n" +
          "- [ ] Un-quarantine the folder once green 20× in a row",
        status: "todo",
        priority: "high",
        difficulty: "s",
        ageDays: -2,
        tags: ["checkout-v2", "testing", "tooling"],
      },

      // ───────────────────────── IN PROGRESS — active build work ─────────────
      {
        id: "T-0004",
        type: "task",
        title: "Build the new multi-step checkout: payment step",
        body:
          "The big sprint deliverable. Payment step of checkout v2 — card form, saved methods, wallets.\n\n" +
          "- [x] Scaffold `PaymentStep` with react-hook-form + zod schema\n" +
          "- [x] Card number formatting + brand detection\n" +
          "- [ ] Saved payment methods list (blocked on T-0002 for wallets)\n" +
          "- [ ] Error states: declined, network, 3DS challenge\n" +
          "- [ ] Storybook stories for every state\n" +
          "- [ ] Unit tests for the zod schema edge cases",
        status: "in_progress",
        priority: "high",
        difficulty: "l",
        starred: true,
        dueDate: relative(4),
        ageDays: -5,
        tags: ["checkout-v2", "sprint", "priya-pm"],
      },
      {
        id: "T-0005",
        type: "task",
        title: "Profile and fix dashboard table re-render storm",
        body:
          "The transactions table re-renders all 200 rows on every websocket tick. React DevTools shows the row component isn't memoized and the selection context changes identity each render.\n\n" +
          "- [x] Capture a profiler trace (16ms → 140ms per tick on mid-tier laptop)\n" +
          "- [x] Split selection state out of the table data context\n" +
          "- [ ] Memoize `TransactionRow` with a custom comparator\n" +
          "- [ ] Virtualize rows over 100 with `@tanstack/react-virtual`\n" +
          "- [ ] Re-measure and post before/after traces to the PR",
        status: "in_progress",
        priority: "high",
        difficulty: "m",
        ageDays: -4,
        tags: ["dashboard", "perf", "refactor"],
      },
      {
        id: "T-0006",
        type: "task",
        title: "Migrate Button + Input to the new design-system tokens",
        body:
          "First two components of the token migration. Sam's new Figma tokens are final.\n\n" +
          "- [x] Map old SCSS vars → new CSS custom properties\n" +
          "- [ ] Update `Button` variants (primary/secondary/ghost/danger)\n" +
          "- [ ] Update `Input` incl. error + disabled states\n" +
          "- [ ] Visual-regression snapshots in Chromatic\n" +
          "- [ ] Deprecation notice on the old components in Storybook",
        status: "in_progress",
        priority: "medium",
        difficulty: "m",
        ageDays: -3,
        tags: ["design-system", "sam-design", "refactor"],
      },
      {
        id: "T-0007",
        type: "task",
        title: "Review Tom's first big PR — order summary component",
        body:
          "Tom's largest PR yet (~600 lines). Review it as a teaching moment, not a gatekeeping one.\n\n" +
          "- [x] First pass: flag the prop-drilling (suggest composition)\n" +
          "- [ ] Pair on the useEffect data-fetch → move to React Query\n" +
          "- [ ] Let the naming nitpicks go — pick the two things that matter\n" +
          "- [ ] Approve once the effect cleanup is fixed",
        status: "in_progress",
        priority: "medium",
        difficulty: "s",
        dueDate: relative(1),
        ageDays: -2,
        tags: ["code-review", "mentoring", "tom", "checkout-v2"],
      },

      // ───────────────────────── TODO — this sprint ──────────────────────────
      {
        id: "T-0008",
        type: "task",
        title: "Add 3DS challenge flow to the payment step",
        body:
          "Stripe 3DS challenge needs an iframe modal mid-payment. Design has the spec in Figma.\n\n" +
          "- [ ] Modal with the challenge iframe + loading/timeout states\n" +
          "- [ ] Handle the `requires_action` → confirm → success/failure loop\n" +
          "- [ ] What happens if the user closes the modal mid-challenge? Ask Sam",
        status: "todo",
        priority: "high",
        difficulty: "m",
        dueDate: relative(6),
        ageDays: -2,
        tags: ["checkout-v2", "sam-design", "sprint"],
      },
      {
        id: "T-0009",
        type: "task",
        title: "Write RFC: adopt React Query for all server state",
        body:
          "We have three data-fetching patterns (raw useEffect, a homegrown hook, React Query in new code). Jordan asked me to write the consolidation RFC.\n\n" +
          "- [ ] Inventory the three patterns and where each lives\n" +
          "- [ ] Migration strategy: new code first, then the dashboard, checkout last\n" +
          "- [ ] Codemod feasibility for the homegrown `useFetch` hook",
        status: "todo",
        priority: "medium",
        difficulty: "m",
        dueDate: relative(8),
        ageDays: -1,
        tags: ["tech-debt", "refactor", "jordan"],
      },
      {
        id: "T-0010",
        type: "task",
        title: "Fix keyboard trap in the address autocomplete",
        body:
          "A11y audit finding (P1): focus gets trapped in the suggestions listbox — Escape doesn't close it and Tab cycles inside it. Needs proper combobox semantics (`aria-activedescendant`, Escape to dismiss, Tab to commit-and-move).",
        status: "todo",
        priority: "high",
        difficulty: "s",
        dueDate: relative(3),
        ageDays: -1,
        tags: ["a11y", "checkout-v2", "bug"],
      },
      {
        id: "T-0011",
        type: "task",
        title: "1-1 prep: ask Jordan about the senior→staff growth path",
        body:
          "Six months since the senior promo. Want concrete expectations, not vibes.\n\n" +
          "- [ ] Bring the React Query RFC as evidence of org-level influence\n" +
          "- [ ] Ask what staff-level scope looks like on this team\n" +
          "- [ ] Raise the mentoring load — Tom plus the two new grads is a lot",
        status: "todo",
        priority: "medium",
        difficulty: "xs",
        dueDate: relative(2),
        tags: ["1-1", "jordan"],
      },
      {
        id: "T-0012",
        type: "task",
        title: "Bump Vite 4 → 5 and fix the build warnings",
        body: "Vite 5 has been out for ages and we're pinned on 4 because of one plugin. The plugin shipped a compatible version last month — try the bump in a spike branch.",
        status: "todo",
        priority: "low",
        difficulty: "s",
        tags: ["tooling", "tech-debt"],
      },
      {
        id: "T-0013",
        type: "task",
        title: "Add Storybook interaction tests for the card form",
        body: "Play-function tests for: brand detection, Luhn validation error, expiry auto-advance. Cheaper than e2e for these.",
        status: "todo",
        priority: "low",
        difficulty: "s",
        tags: ["testing", "checkout-v2", "design-system"],
      },

      // ───────────────────────── BACKLOG — later ──────────────────────────────
      {
        id: "T-0014",
        type: "task",
        title: "Spike: React Server Components for the dashboard",
        body:
          "The dashboard is read-heavy and SEO-irrelevant — classic RSC candidate? Or is it not worth the framework churn?\n\n" +
          "- [ ] Prototype one route on Next.js app router\n" +
          "- [ ] Measure bundle delta and TTFB\n" +
          "- [ ] Write up a recommendation either way",
        status: "backlog",
        priority: "medium",
        difficulty: "xl",
        starred: true,
        tags: ["dashboard", "perf", "tech-debt"],
      },
      {
        id: "T-0015",
        type: "task",
        title: "Delete the legacy class-component checkout (v1)",
        body: "Once checkout v2 hits 100% rollout, ~14k lines of class components and the old Redux store can go. The single biggest tech-debt payoff available.",
        status: "backlog",
        priority: "low",
        difficulty: "l",
        tags: ["checkout-v2", "tech-debt", "refactor"],
      },
      {
        id: "T-0016",
        type: "task",
        title: "Set up bundle-size budget check in CI",
        body: "Fail PRs that grow the main bundle >5kb gzipped without a label. size-limit or bundlesize — pick one and wire it up.",
        status: "backlog",
        priority: "low",
        difficulty: "s",
        tags: ["tooling", "perf"],
      },
      {
        id: "T-0017",
        type: "task",
        title: "Dark mode for the dashboard",
        body: "Most-requested item in the user survey. Needs the design-system token migration done first — tokens make this nearly free.",
        status: "backlog",
        priority: "low",
        difficulty: "m",
        tags: ["dashboard", "design-system"],
      },

      // ───────────────────────── DONE — recently shipped ─────────────────────
      {
        id: "T-0018",
        type: "task",
        title: "Ship address step of checkout v2",
        body: "Address step live at 100%. Postcode lookup, manual-entry fallback, address validation. Conversion on the step up 2.1% vs v1.",
        status: "done",
        priority: "high",
        difficulty: "l",
        ageDays: -7,
        tags: ["checkout-v2", "sprint"],
      },
      {
        id: "T-0019",
        type: "task",
        title: "Fix the memory leak in the live-rates websocket hook",
        body: "`useLiveRates` kept stale subscriptions on currency switch. Added cleanup + a connection registry. Heap growth flat over a 2h soak test.",
        status: "done",
        priority: "high",
        difficulty: "m",
        ageDays: -9,
        tags: ["dashboard", "bug", "perf"],
      },
      {
        id: "T-0020",
        type: "task",
        title: "Upgrade React 18.2 → 18.3 across the monorepo",
        body: "Painless. Cleared the StrictMode double-invoke warnings in the two offending hooks while in there.",
        status: "done",
        priority: "medium",
        difficulty: "s",
        ageDays: -11,
        tags: ["tooling", "tech-debt"],
      },

      // ───────────────────────── NOTES — engineering output ───────────────────
      {
        id: "N-0001",
        type: "note",
        title: "Standup notes — Tue",
        body:
          "**Yesterday:** wizard crash repro'd and root-caused (step index vs step id). Selection context split landed for the dashboard table.\n\n" +
          "**Today:** hotfix for the wizard crash, then back to the payment step. Pairing with Tom 2pm on his PR.\n\n" +
          "**Blockers:** payment-methods API still missing `walletType` — flagged to Raj again. Cypress checkout folder still quarantined.",
        status: null,
        priority: "medium",
        difficulty: "xs",
        ageDays: 0,
        tags: ["standup", "checkout-v2"],
      },
      {
        id: "N-0002",
        type: "note",
        title: "Debugging log — checkout wizard crash",
        body:
          "ok so the crash. sentry says cannot read properties of undefined reading 'component' in CheckoutWizard. " +
          "happens when persisted step index points past the steps array. variant b removes the review step so anyone who " +
          "persisted on step 3 in variant a and got reassigned to b crashes. fix is store step ids not indexes, and fall back " +
          "to the first incomplete step when the id is gone. also we should clear persisted state when the variant changes, " +
          "thats the real bug honestly. need a test that flips the flag mid flow. raj says the flag service can emit a change " +
          "event we could subscribe to but thats a bigger change, hotfix first",
        status: null,
        priority: "urgent",
        difficulty: "s",
        starred: true,
        ageDays: -1,
        tags: ["checkout-v2", "bug", "inbox"],
      },
      {
        id: "N-0003",
        type: "note",
        title: "Sprint planning — checkout v2, sprint 14",
        body:
          "Priya ran planning. Capacity 34 points (Maya 13, Tom 8, rest split).\n\n" +
          "**Committed:**\n" +
          "- Payment step complete incl. 3DS (Maya, 13)\n" +
          "- Order summary component (Tom, 5)\n" +
          "- Saved-methods API integration (pending Raj's PR, 5)\n" +
          "- A11y P1 fixes from the audit (3)\n\n" +
          "**Stretch:** Cypress un-quarantine, Button/Input token migration.\n\n" +
          "**Risks called out:** wallet contract still not merged; 3DS design not final until Wed. Priya wants the payment step demoable for the stakeholder review Friday — agreed to demo with mocked wallets if needed.",
        status: null,
        priority: "high",
        difficulty: "s",
        starred: true,
        ageDays: -4,
        tags: ["sprint", "checkout-v2", "priya-pm"],
      },
      {
        id: "N-0004",
        type: "note",
        title: "PR review notes — Tom's order summary",
        body:
          "Things to cover when we pair (keep it to the big two):\n\n" +
          "1. **Data fetching in useEffect** — no cleanup, no error state, refetches on every prop change. Perfect intro to React Query: same component, 40 fewer lines.\n" +
          "2. **Prop drilling 4 levels** — `currency` and `locale` passed through everything. Show composition + context for the formatting concerns.\n\n" +
          "Things I'm deliberately NOT raising: variable naming, file layout, his test style (verbose but correct — fine).\n\n" +
          "Things he did well — say these out loud: empty/loading states unprompted, good a11y on the totals table, small commits with clear messages.",
        status: null,
        priority: "medium",
        difficulty: "s",
        ageDays: -1,
        tags: ["code-review", "mentoring", "tom"],
      },
      {
        id: "N-0005",
        type: "note",
        title: "Perf trace findings — dashboard table",
        body:
          "## Profiler session, mid-tier laptop, 200 rows, live ticks\n\n" +
          "- Every websocket tick re-renders the whole table: 140ms commit, 4 dropped frames.\n" +
          "- Two causes, roughly equal weight:\n" +
          "  1. `SelectionContext` value is a fresh object every render → every row consumer re-renders.\n" +
          "  2. `TransactionRow` not memoized; row props include an inline `onSelect` closure.\n\n" +
          "## Fix sequence\n" +
          "1. Split selection out of the data context (done — commit `f3a92c1`)\n" +
          "2. `memo(TransactionRow)` with comparator on `id`, `status`, `amount`\n" +
          "3. Stable `onSelect` via `useEvent`-style ref pattern\n" +
          "4. Virtualize >100 rows\n\n" +
          "After steps 1–2 locally: 140ms → 9ms per tick. Virtualization may not even be needed — measure first.",
        status: null,
        priority: "high",
        difficulty: "m",
        ageDays: -2,
        tags: ["perf", "dashboard"],
      },
      {
        id: "N-0006",
        type: "note",
        title: "Design sync with Sam — payment step + 3DS",
        body:
          "Walked the payment-step build with Sam.\n\n" +
          "- Card form spacing final; use the new 8px-grid tokens, not the legacy SCSS vars.\n" +
          "- 3DS modal: full-screen sheet on mobile, centered 480px modal on desktop. Spinner only after 400ms (avoid flash).\n" +
          "- Close-mid-challenge: confirmed — closing cancels the payment attempt, returns to the form with a non-blaming message. Sam to write the copy.\n" +
          "- Saved cards: brand icon + last4 + expiry; expired cards stay visible but disabled with a 'update card' affordance.\n" +
          "- Wallet buttons follow platform guidelines exactly — no custom styling on Apple Pay (review rejection risk).",
        status: null,
        priority: "medium",
        difficulty: "s",
        ageDays: -1,
        tags: ["checkout-v2", "sam-design", "design-system"],
      },
      {
        id: "N-0007",
        type: "note",
        title: "Retro notes — sprint 13",
        body:
          "## Went well\n" +
          "- Address step shipped at 100% with zero rollbacks\n" +
          "- Pairing rotation actually happened this sprint\n\n" +
          "## Didn't go well\n" +
          "- Cypress flake ate ~2 days across the team; quarantining hid a real regression for a day\n" +
          "- Backend contract for wallets slipped again — second sprint running\n" +
          "- Two 'quick' production issues pulled me off sprint work for a day and a half\n\n" +
          "## Actions\n" +
          "- [ ] Flaky-test policy: a spec that fails 3× gets a ticket and an owner, not a skip (me)\n" +
          "- [ ] Cross-team contract changes get agreed in writing before sprint start (Priya)\n" +
          "- [ ] Track unplanned work as labeled tickets so the burndown tells the truth (Jordan)",
        status: null,
        priority: "medium",
        difficulty: "s",
        ageDays: -5,
        tags: ["retro", "sprint", "testing"],
      },
      {
        id: "N-0008",
        type: "note",
        title: "1-1 with Jordan — raw notes",
        body:
          "talked about the staff path. jordan says the gap isnt technical its scope - i solve what lands on the team, " +
          "staff means picking what the org should solve. the react query rfc is exactly the right kind of artifact, do more of that. " +
          "he suggested i own the data-fetching consolidation across all three squads not just ours. " +
          "mentoring load - he heard me, the two new grads will go to dana's team instead, i keep tom. " +
          "also flagged the checkout v1 deletion as a visible win i should drive end to end after rollout. " +
          "next promo window is march, he thinks the case is realistic if the rfc lands and v1 dies",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: 0,
        tags: ["1-1", "jordan", "mentoring"],
      },
      {
        id: "N-0009",
        type: "note",
        title: "Inbox: idea — error-state component library",
        body:
          "Between bugs: we hand-roll error states everywhere (declined card, network fail, 3DS timeout, table load error...) and they're all slightly different. " +
          "A small `<ErrorState kind=...>` family in the design system would standardize copy, retry affordances, and logging. Park for the next design-system sync with Sam.",
        status: null,
        priority: "low",
        difficulty: "xs",
        ageDays: 0,
        tags: ["inbox", "design-system"],
      },
      {
        id: "N-0010",
        type: "note",
        title: "A11y audit findings — checkout (P1s only)",
        body:
          "External audit results, P1 items assigned to us:\n\n" +
          "- [ ] Keyboard trap in address autocomplete (T-0010)\n" +
          "- [ ] Card-error announcements: errors render visually but no `aria-live` region — screen readers miss declines\n" +
          "- [ ] Focus not moved to the step heading on step change — SR users get lost\n" +
          "- [x] Submit button contrast in the disabled state (fixed in the token migration)\n\n" +
          "P2s parked in the backlog. Re-audit booked in 4 weeks — all P1s must be closed by then.",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: -3,
        tags: ["a11y", "checkout-v2", "testing"],
      },
      {
        id: "N-0011",
        type: "note",
        title: "Weekly priorities (Mon)",
        body:
          "Top 3 this week:\n\n" +
          "1. **Wizard crash hotfix out** — it's production, everything else waits.\n" +
          "2. **Payment step demoable by Friday** — mocked wallets acceptable, 3DS happy path required.\n" +
          "3. **Tom's PR merged with the React Query pairing done** — his momentum matters.\n\n" +
          "Keep an eye on: Raj's contract PR, Cypress quarantine, 3DS final design due Wed.",
        status: null,
        priority: "high",
        difficulty: "xs",
        ageDays: -1,
        tags: ["sprint", "checkout-v2"],
      },
    ],
  };
}

/** ISO date string N days from today (used for due dates). */
function relative(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}
