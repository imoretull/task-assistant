import type { SeedData } from "../seed.js";

/**
 * Demo workspace — an on-call week in the life of Sara Lindqvist, DevOps /
 * Platform Engineer at a SaaS company. Owns the Kubernetes platform, the
 * CI/CD pipelines, observability, and a chunk of the cloud bill — while
 * carrying the pager and pushing the org toward infrastructure-as-code and
 * self-service. Tasks land across every board column and notes capture real
 * ops output (incident timelines, postmortems, capacity reviews), so every
 * feature has rich material to work on.
 *
 * Tag taxonomy:
 *   Projects   — k8s-platform, ci-cd, observability, cost-opt, iac-migration
 *   Cadence    — on-call, standup, 1-1, postmortem
 *   Categories — incident, security, automation, capacity, reliability,
 *                self-service, toil, inbox
 */
export function devopsSeed(): SeedData {
  return {
    tags: [
      // projects (own sidebar section)
      { name: "k8s-platform", color: "purple", kind: "project" },
      { name: "ci-cd", color: "blue", kind: "project" },
      { name: "observability", color: "green", kind: "project" },
      { name: "cost-opt", color: "amber", kind: "project" },
      { name: "iac-migration", color: "red", kind: "project" },
      // people (own sidebar section)
      { name: "tobias", color: "blue", kind: "person" }, // platform team lead (my manager)
      { name: "amara", color: "green", kind: "person" }, // SRE counterpart
      { name: "deniz", color: "amber", kind: "person" }, // security engineer
      { name: "checkout-team", color: "purple", kind: "person" }, // noisiest internal customer
      { name: "finops", color: "red", kind: "person" },
      // cadence
      { name: "on-call", color: "red" },
      { name: "standup", color: "green" },
      { name: "1-1", color: "blue" },
      { name: "postmortem", color: "purple" },
      // categories
      { name: "incident", color: "red" },
      { name: "security", color: "amber" },
      { name: "automation", color: "purple" },
      { name: "capacity", color: "blue" },
      { name: "reliability", color: "green" },
      { name: "self-service", color: "blue" },
      { name: "toil", color: "gray" },
      { name: "inbox", color: "gray" },
    ],
    items: [
      // ───────────────────────── URGENT / BLOCKED — pager reality ────────────
      {
        id: "T-0001",
        type: "task",
        title: "Write the postmortem for Saturday's ingress outage (SEV-1)",
        body:
          "47 minutes of 5xx on all public traffic. Cert-manager renewed the wildcard cert but the new secret never propagated to the ingress controllers — they served the expired cert until restarted.\n\n" +
          "- [x] Timeline reconstructed from alerts + audit log\n" +
          "- [x] Immediate fix deployed: ingress reload on secret change (the watch was silently broken since the v1.9 upgrade)\n" +
          "- [ ] Five-whys: why did the watch break silently? why no alert on cert-expiry-vs-served-cert mismatch?\n" +
          "- [ ] Action items with owners and dates — no 'be more careful' items\n" +
          "- [ ] Postmortem review meeting Thursday, blameless",
        status: "in_progress",
        priority: "urgent",
        difficulty: "m",
        starred: true,
        dueDate: relative(2),
        ageDays: -2,
        tags: ["incident", "postmortem", "k8s-platform", "reliability"],
      },
      {
        id: "T-0002",
        type: "task",
        title: "Blocked: prod cluster upgrade waiting on security sign-off",
        body:
          "K8s 1.28 → 1.30 upgrade is staged and tested in pre-prod for 3 weeks. Deniz's team hasn't reviewed the PSP→PSA migration plan and the change board won't schedule without it.\n\n" +
          "- [x] Sent the migration doc + pre-prod evidence to Deniz twice\n" +
          "- [ ] Escalate via Tobias if no review slot by Friday — 1.28 EOL is in 6 weeks, this becomes a security problem ironically\n" +
          "- [ ] Offer a 30-min walkthrough instead of a doc review — probably faster for everyone",
        status: "blocked",
        priority: "urgent",
        difficulty: "s",
        starred: true,
        ageDays: -5,
        tags: ["k8s-platform", "security", "deniz", "tobias"],
      },
      {
        id: "T-0003",
        type: "task",
        title: "Stop the checkout team's runaway preview environments",
        body:
          "Preview envs are supposed to TTL after 48h. Checkout team's CI spins ~30/day and the TTL controller skips any env with a 'keep' label — they label everything 'keep'. 214 stale envs, ~$6k/month.\n\n" +
          "- [ ] Talk to them first — there's probably a real need behind the label abuse (their e2e suite re-uses envs?)\n" +
          "- [ ] Hard cap: max 10 'keep' envs per team, oldest auto-reaped beyond that\n" +
          "- [ ] Cost dashboard per-team so this is visible before it's a conversation",
        status: "todo",
        priority: "high",
        difficulty: "s",
        ageDays: -1,
        tags: ["cost-opt", "k8s-platform", "checkout-team", "toil"],
      },

      // ───────────────────────── IN PROGRESS — platform work ─────────────────
      {
        id: "T-0004",
        type: "task",
        title: "Terraform the last hand-built infrastructure (iac-migration phase 3)",
        body:
          "The quarter goal: nothing in prod that isn't in code. Remaining hand-built: the legacy RDS instances, two ElastiCache clusters, and the DNS zoo.\n\n" +
          "- [x] Import the ElastiCache clusters (terraform import + plan-clean)\n" +
          "- [x] RDS: imported, but the parameter groups drift — pinned them\n" +
          "- [ ] DNS: 340 records across 3 zones, half undocumented — script the import, then review the weird ones with Amara\n" +
          "- [ ] Enable drift detection in CI (plan on schedule, alert on diff)\n" +
          "- [ ] Delete the console-write IAM permissions once drift is zero for 2 weeks",
        status: "in_progress",
        priority: "high",
        difficulty: "l",
        starred: true,
        dueDate: relative(12),
        ageDays: -8,
        tags: ["iac-migration", "automation", "amara"],
      },
      {
        id: "T-0005",
        type: "task",
        title: "Roll out the golden-path deploy pipeline to the first 3 teams",
        body:
          "Self-service template: repo scaffold → build → scan → canary deploy → auto-rollback on SLO burn. Checkout, Orders, and Search are the pilot teams.\n\n" +
          "- [x] Template repo + backstage scaffolder action\n" +
          "- [x] Checkout migrated (their old pipeline had 14 bespoke steps; now 0 custom)\n" +
          "- [ ] Orders migration scheduled Wed — their secrets handling is the tricky bit\n" +
          "- [ ] Search blocked on their monorepo layout — pair with their lead Friday\n" +
          "- [ ] Success metric: deploy lead time + change-failure rate, before/after per team",
        status: "in_progress",
        priority: "high",
        difficulty: "l",
        ageDays: -6,
        tags: ["ci-cd", "self-service", "automation", "checkout-team"],
      },
      {
        id: "T-0006",
        type: "task",
        title: "Cut the observability bill: 40% of logs are never queried",
        body:
          "Log ingest is $28k/month and growing 8%/month. Query analysis says 40% of ingested logs were never read in 90 days.\n\n" +
          "- [x] Top-10 noisiest log producers identified (one debug logger in checkout is 11% alone)\n" +
          "- [ ] Sampling policy proposal: debug logs sampled 1:100 in prod, info 1:10 for the top producers, errors never sampled\n" +
          "- [ ] Socialize with the affected teams — nobody loses errors, this is about debug noise\n" +
          "- [ ] Target: -$9k/month without losing a single page-worthy signal",
        status: "in_progress",
        priority: "high",
        difficulty: "m",
        dueDate: relative(9),
        ageDays: -4,
        tags: ["observability", "cost-opt", "finops"],
      },
      {
        id: "T-0007",
        type: "task",
        title: "Fix the flaky canary analysis (auto-rollback fires on noise)",
        body:
          "Two false-positive rollbacks this week — the canary SLO window is 5 min and latency noise at low traffic trips it.\n\n" +
          "- [x] Reproduce: low-RPS services have too few datapoints in 5 min\n" +
          "- [ ] Switch to request-count-based windows (min 1000 requests) instead of time-based\n" +
          "- [ ] Backtest against the last 30 canaries: would catch both real regressions, zero false positives",
        status: "in_progress",
        priority: "medium",
        difficulty: "m",
        ageDays: -2,
        tags: ["ci-cd", "reliability", "automation"],
      },

      // ───────────────────────── TODO — this week ────────────────────────────
      {
        id: "T-0008",
        type: "task",
        title: "Capacity review ahead of the marketing launch (expected 3× traffic)",
        body:
          "Launch in 2 weeks; marketing forecasts 3× peak for 48h.\n\n" +
          "- [ ] Load-test the checkout path at 4× (1× headroom) with Amara\n" +
          "- [ ] Check HPA limits + cluster autoscaler max nodes — last launch we hit the node ceiling\n" +
          "- [ ] Pre-scale the databases (RDS doesn't autoscale fast enough)\n" +
          "- [ ] Brief the on-call: launch runbook with the known choke points",
        status: "todo",
        priority: "high",
        difficulty: "m",
        dueDate: relative(7),
        ageDays: -1,
        tags: ["capacity", "k8s-platform", "reliability", "amara"],
      },
      {
        id: "T-0009",
        type: "task",
        title: "Rotate the leaked-adjacent CI secrets (precautionary)",
        body:
          "A contractor's laptop was stolen; their CI tokens were scoped but Deniz wants the blast-radius set rotated as a precaution.\n\n" +
          "- [ ] Inventory: which secrets could that token chain reach (registry push, staging deploy)\n" +
          "- [ ] Rotate registry + staging creds, verify pipelines green after\n" +
          "- [ ] Longer-term ticket: OIDC federation instead of long-lived tokens — this fire drill shouldn't be possible",
        status: "todo",
        priority: "high",
        difficulty: "s",
        dueDate: relative(1),
        ageDays: 0,
        tags: ["security", "ci-cd", "deniz"],
      },
      {
        id: "T-0010",
        type: "task",
        title: "Alert review: kill the non-actionable pages",
        body:
          "On-call got 31 pages last week; 11 were 'look and close'. Every non-actionable page either becomes a ticket-level alert, gets a real threshold, or dies.\n\n" +
          "- [ ] Walk the 11 with Amara — classify: bad threshold / not pageable / duplicate\n" +
          "- [ ] Page-worthy = user-impacting + needs-human-now. Everything else is a ticket",
        status: "todo",
        priority: "medium",
        difficulty: "s",
        dueDate: relative(4),
        ageDays: -1,
        tags: ["observability", "on-call", "reliability", "toil", "amara"],
      },
      {
        id: "T-0011",
        type: "task",
        title: "1-1 prep: Tobias — platform-team hiring and my SRE conference talk",
        body: "Ask where the approved platform req stands (3 weeks of silence). Pitch the talk: 'golden path or goat path — making the right way the easy way'. Also raise the postmortem-action completion rate (38% — we write them and don't do them).",
        status: "todo",
        priority: "medium",
        difficulty: "xs",
        dueDate: relative(2),
        tags: ["1-1", "tobias"],
      },
      {
        id: "T-0012",
        type: "task",
        title: "Patch the runner AMIs (monthly, automate me away)",
        body: "Monthly AMI patch is 2h of manual toil. This month: do it, but timebox 1h extra to template the Packer build so next month is a button.",
        status: "todo",
        priority: "low",
        difficulty: "s",
        tags: ["ci-cd", "toil", "automation", "security"],
      },
      {
        id: "T-0013",
        type: "task",
        title: "Write the runbook for the cert-manager failure mode",
        body: "Saturday's outage had no runbook — I diagnosed from scratch at 2am. Write it while the pain is fresh: symptoms, the served-vs-stored cert check command, the safe reload sequence.",
        status: "todo",
        priority: "medium",
        difficulty: "xs",
        ageDays: -1,
        tags: ["on-call", "reliability", "k8s-platform", "postmortem"],
      },

      // ───────────────────────── BACKLOG — platform bets ──────────────────────
      {
        id: "T-0014",
        type: "task",
        title: "Multi-region failover: design the real DR story",
        body:
          "Current DR is 'restore from backup, ~4h RTO, prayers'. The enterprise deals now have 1h RTO in the contracts — sales wrote a check the platform can't cash.\n\n" +
          "- [ ] Options: warm standby region vs active-active (cost delta is ~$40k/month, decide what the contracts actually require)\n" +
          "- [ ] The hard part is the data tier — RDS cross-region lag vs Aurora global\n" +
          "- [ ] Quarterly game-day either way: an untested failover is fiction",
        status: "backlog",
        priority: "high",
        difficulty: "xl",
        starred: true,
        tags: ["reliability", "k8s-platform", "capacity"],
      },
      {
        id: "T-0015",
        type: "task",
        title: "OIDC federation for all CI → cloud auth (kill long-lived keys)",
        body: "The stolen-laptop drill is the argument. GitHub OIDC → AWS roles, short-lived everything. Pilot on the platform repos first.",
        status: "backlog",
        priority: "medium",
        difficulty: "l",
        tags: ["security", "ci-cd", "automation"],
      },
      {
        id: "T-0016",
        type: "task",
        title: "Spot instances for the CI runner fleet",
        body: "Runners are 30% of compute spend and perfectly interruptible. Spot with on-demand fallback should cut ~$4k/month. Needs the job-retry behavior verified first.",
        status: "backlog",
        priority: "low",
        difficulty: "m",
        tags: ["cost-opt", "ci-cd", "finops"],
      },
      {
        id: "T-0017",
        type: "task",
        title: "Ephemeral staging environments (kill the shared-staging fights)",
        body: "Teams queue and clash on the one shared staging. Preview-env tech could do full ephemeral stacks — but the data-seeding story has to be solved first or they're useless.",
        status: "backlog",
        priority: "medium",
        difficulty: "l",
        tags: ["k8s-platform", "self-service", "automation"],
      },

      // ───────────────────────── DONE — recently shipped ─────────────────────
      {
        id: "T-0018",
        type: "task",
        title: "SLO dashboards for the 5 tier-1 services",
        body: "Burn-rate alerts (1h/6h windows) live for checkout, orders, auth, search, billing. First week already caught a slow regression the old threshold alerts missed.",
        status: "done",
        priority: "high",
        difficulty: "l",
        ageDays: -7,
        tags: ["observability", "reliability", "automation"],
      },
      {
        id: "T-0019",
        type: "task",
        title: "Right-size the over-provisioned dev clusters",
        body: "Dev/staging requests were copy-pasted from prod manifests. VPA recommendations applied: -$11k/month, zero complaints after two weeks.",
        status: "done",
        priority: "medium",
        difficulty: "m",
        ageDays: -9,
        tags: ["cost-opt", "k8s-platform", "finops"],
      },
      {
        id: "T-0020",
        type: "task",
        title: "Move image scanning into the build (was post-deploy)",
        body: "Trivy scan now gates the build with a severity threshold; criticals block, highs warn for 30 days then block. Caught two vulnerable base images in week one.",
        status: "done",
        priority: "medium",
        difficulty: "s",
        ageDays: -11,
        tags: ["security", "ci-cd", "automation"],
      },

      // ───────────────────────── NOTES — ops output ──────────────────────────
      {
        id: "N-0001",
        type: "note",
        title: "Standup notes — Mon",
        body:
          "**Weekend on-call recap:** SEV-1 ingress outage Saturday 02:10–02:57 (cert propagation). Immediate fix in, postmortem Thursday. Otherwise quiet.\n\n" +
          "**Today:** postmortem five-whys, Orders golden-path prep for Wed, chase Deniz on the upgrade sign-off.\n\n" +
          "**Blockers:** K8s upgrade still waiting on security review (week 3). Flagged the EOL clock to Tobias.",
        status: null,
        priority: "medium",
        difficulty: "xs",
        ageDays: 0,
        tags: ["standup", "on-call", "incident"],
      },
      {
        id: "N-0002",
        type: "note",
        title: "Incident timeline — ingress outage (raw, from the night)",
        body:
          "0210 pages fire, all public endpoints 5xx. 0214 im on, ingress pods running fine, backends fine, weird. " +
          "0221 curl shows cert expired?? but cert-manager says renewed 6h ago. 0228 the secret has the new cert, " +
          "the ingress controller is serving the old one - its not reloading on secret change. 0234 rolling restart of " +
          "ingress controllers, traffic recovering. 0241 confirmed all green. 0257 stood down. " +
          "root cause trail: the secret watch in the controller died silently after the v1.9 upgrade three weeks ago, " +
          "nothing alerted because we monitor cert expiry in the secret not the cert actually being served. " +
          "thats the real lesson - monitor whats served not whats stored. also i diagnosed this with zero runbook at 2am, " +
          "writing one while it hurts",
        status: null,
        priority: "urgent",
        difficulty: "s",
        starred: true,
        ageDays: -2,
        tags: ["incident", "on-call", "k8s-platform"],
      },
      {
        id: "N-0003",
        type: "note",
        title: "Postmortem draft — ingress outage SEV-1",
        body:
          "## Impact\n" +
          "47 min full outage on public traffic, 02:10–02:57 Sat. ~12k failed sessions (overnight, low traffic — same failure at peak would be ~40× worse).\n\n" +
          "## Five whys (draft)\n" +
          "1. Why 5xx? Ingress served an expired cert.\n" +
          "2. Why expired? Controller didn't reload the renewed secret.\n" +
          "3. Why no reload? Secret watch broke in the v1.9 upgrade — known upstream issue, fixed in v1.9.2.\n" +
          "4. Why didn't we know? We pin minor versions but don't track upstream issue feeds for pinned components.\n" +
          "5. Why no alert? We monitor cert expiry in the SECRET, not the cert SERVED at the edge.\n\n" +
          "## Action items (owners, dates — no platitudes)\n" +
          "- [ ] Synthetic check: validate the served cert chain on every public endpoint, hourly (me, this week)\n" +
          "- [ ] Upgrade ingress controller to v1.9.2 (me, after the K8s upgrade unblocks)\n" +
          "- [ ] Subscribe pinned-component releases into the platform channel (Amara, this week)\n" +
          "- [ ] Cert-manager failure-mode runbook (me, in progress)",
        status: null,
        priority: "urgent",
        difficulty: "m",
        starred: true,
        ageDays: -1,
        tags: ["postmortem", "incident", "reliability"],
      },
      {
        id: "N-0004",
        type: "note",
        title: "Golden-path migration — checkout results (pilot team 1)",
        body:
          "Two weeks since checkout moved to the golden path. The numbers tell the story:\n\n" +
          "| Metric | Before | After |\n" +
          "|--------|--------|-------|\n" +
          "| Deploy lead time (commit→prod) | 94 min | 31 min |\n" +
          "| Deploys/week | 6 | 19 |\n" +
          "| Change-failure rate | 11% | 4% (canary catches them) |\n" +
          "| Custom pipeline steps | 14 | 0 |\n\n" +
          "Their feedback: rollback confidence changed behavior — small deploys because deploying stopped being scary.\n\n" +
          "Caveats for the writeup: checkout was the motivated pilot; Orders (Wed) is the real test — they didn't ask for this.",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: -1,
        tags: ["ci-cd", "self-service", "checkout-team"],
      },
      {
        id: "N-0005",
        type: "note",
        title: "Cost review with FinOps — monthly",
        body:
          "Monthly numbers, platform-owned spend:\n\n" +
          "- **Total:** $187k/month (-6% MoM — the dev-cluster right-sizing landed)\n" +
          "- **Wins banked:** dev right-sizing -$11k, old snapshot cleanup -$2k\n" +
          "- **In flight:** log sampling (-$9k target), preview-env caps (-$6k)\n" +
          "- **Growing:** log ingest +8%/month (being addressed), GPU experiments by the ML team +$7k (not mine, flagged to their manager)\n" +
          "- **FinOps ask:** per-team showback dashboard — agreed, it makes my preview-env conversation easier too. Labels are 80% there from the IaC work.\n\n" +
          "Note: resisted the 'cut the observability bill by half' framing — cheap observability that misses incidents costs more than it saves. Sampling the noise, keeping the signal.",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: -3,
        tags: ["cost-opt", "finops", "observability"],
      },
      {
        id: "N-0006",
        type: "note",
        title: "DNS import — the weird ones (for review with Amara)",
        body:
          "Scripted import of 340 records done; 28 need a human:\n\n" +
          "- 6 CNAMEs to services that no longer exist (delete after a week of query-log silence)\n" +
          "- 4 records pointing at a contractor's personal cloud account (!!) — escalating to Deniz, this is a finding not a cleanup\n" +
          "- 9 marketing vanity domains nobody owns — handing to marketing ops with a deadline\n" +
          "- 3 MX records for a mail setup predating everyone — DO NOT TOUCH until we trace them\n" +
          "- 6 legitimately undocumented but live — documenting as we go\n\n" +
          "Lesson for the IaC writeup: the import is easy, the archaeology is the work.",
        status: null,
        priority: "medium",
        difficulty: "s",
        ageDays: -1,
        tags: ["iac-migration", "amara", "security", "deniz"],
      },
      {
        id: "N-0007",
        type: "note",
        title: "On-call handoff — week summary",
        body:
          "## Pages: 31 total (11 non-actionable — alert review booked)\n\n" +
          "- **SEV-1:** ingress cert outage (Sat) — postmortem in flight\n" +
          "- **Repeat offender:** disk-pressure on the logging nodes, 6 pages — the ingest growth again; sampling work is the fix, until then I bumped the volume size (band-aid, noted in the ticket)\n" +
          "- **False positives:** canary rollback fired twice on low-traffic noise (fix in progress, T-0007)\n" +
          "- **Near miss:** staging DB hit 94% storage — autoscaling storage was off, now on, check prod settings too (done: prod was fine)\n\n" +
          "Handing to Amara. Open threads: cert runbook half-written, watch the logging-node disk until sampling lands.",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: 0,
        tags: ["on-call", "incident", "observability", "amara"],
      },
      {
        id: "N-0008",
        type: "note",
        title: "1-1 with Tobias — raw notes",
        body:
          "platform req: approved!! finally, posting this week, i help screen. " +
          "told him the postmortem action completion number, 38%, he winced. agreed: actions get sprint-planned like features, " +
          "not parked in a doc. he'll defend the capacity at planning. " +
          "conference talk: yes, company covers travel if its accepted. " +
          "the deniz bottleneck - he'll raise the review SLA at the leads sync, not as a complaint, as a process gap - " +
          "security reviews need a booking system like everything else. " +
          "he asked if i want the staff-platform-engineer track conversation this cycle. yes. homework: write the impact doc, " +
          "the golden path numbers are the spine of it",
        status: null,
        priority: "high",
        difficulty: "s",
        ageDays: 0,
        tags: ["1-1", "tobias"],
      },
      {
        id: "N-0009",
        type: "note",
        title: "Inbox: idea — 'paved road' scorecard per service",
        body:
          "Thought while migrating Orders: teams ask 'are we doing platform stuff right?' and there's no answer short of me looking. " +
          "A scorecard per service — on golden path? SLOs defined? runbooks exist? secrets via OIDC? IaC-managed? — auto-checked, visible to the team, never used as a stick. " +
          "Backstage plugin probably. Park for after the launch crunch.",
        status: null,
        priority: "low",
        difficulty: "xs",
        ageDays: 0,
        tags: ["inbox", "self-service", "automation"],
      },
      {
        id: "N-0010",
        type: "note",
        title: "Launch readiness — capacity worksheet",
        body:
          "Marketing launch T-minus 13 days. Working list:\n\n" +
          "- [ ] Load test checkout path at 4× peak (booked with Amara, Thu)\n" +
          "- [x] Cluster autoscaler max-nodes raised 40 → 80 (hit 38 at last launch)\n" +
          "- [ ] HPA max replicas review for the 5 tier-1 services\n" +
          "- [ ] RDS pre-scale plan: bump instance class the night before, scale back T+3 days\n" +
          "- [ ] CDN cache-hit review — last launch the uncached product images were 30% of origin load\n" +
          "- [ ] Launch runbook: choke points, dashboards, who to wake, rollback decision tree\n" +
          "- [ ] Freeze window: no platform changes T-2 to T+2 except emergencies\n\n" +
          "Known risk: if marketing's 3× is actually 6× (they've underestimated before), the DB pre-scale is the binding constraint. Saying so in the brief.",
        status: null,
        priority: "high",
        difficulty: "m",
        ageDays: -1,
        tags: ["capacity", "reliability", "k8s-platform", "amara"],
      },
      {
        id: "N-0011",
        type: "note",
        title: "Weekly priorities (Mon)",
        body:
          "Top 3 this week:\n\n" +
          "1. **Postmortem done properly** — five-whys, real action items, Thursday review. The served-vs-stored monitoring gap closes this week.\n" +
          "2. **Orders onto the golden path Wed** — the unmotivated-team test; if it works here, the rollout story writes itself.\n" +
          "3. **Secrets rotation today** — the stolen-laptop precaution doesn't wait.\n\n" +
          "Keep an eye on: Deniz sign-off (EOL clock), launch capacity prep, logging-node disk.",
        status: null,
        priority: "high",
        difficulty: "xs",
        ageDays: -1,
        tags: ["postmortem", "ci-cd", "security"],
      },
    ],
  };
}

/** ISO date string N days from today (used for due dates). */
function relative(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}
