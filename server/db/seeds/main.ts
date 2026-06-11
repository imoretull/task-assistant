import type { SeedData } from "../seed.js";

/** The original seed for the user's own workspace. */
export function mainSeed(): SeedData {
  return {
    tags: [
      { name: "olympic", color: "purple", kind: "project" },
      { name: "inbox", color: "gray" },
      { name: "work", color: "blue" },
      { name: "standup", color: "green" },
      { name: "ideas", color: "amber" },
    ],
    items: [
      {
        id: "T-0001",
        type: "task",
        title: "Review the Olympic release test plan",
        body: "Walk through the regression suite with QA.\n\n- [ ] Confirm scope with QA lead\n- [ ] Flag flaky tests",
        status: "in_progress",
        priority: "high",
        difficulty: "m",
        starred: true,
        tags: ["olympic", "work"],
      },
      {
        id: "T-0002",
        type: "task",
        title: "Fix flaky login e2e test",
        body: "Fails ~1 in 5 runs on CI. Suspect a race in the session cookie setup.",
        status: "todo",
        priority: "medium",
        difficulty: "s",
        tags: ["work"],
      },
      {
        id: "T-0003",
        type: "task",
        title: "Draft Q3 team goals",
        body: "",
        status: "backlog",
        priority: "low",
        difficulty: "l",
        dueDate: "2026-06-30",
      },
      {
        id: "N-0001",
        type: "note",
        title: "Standup notes — Mon",
        body: "anna is finishing the api migration today.  ben blocked on the design review, will ping carla. i need to follow up on the perf regression before thursday",
        status: null,
        priority: "medium",
        difficulty: "m",
        tags: ["standup", "olympic"],
      },
      {
        id: "N-0002",
        type: "note",
        title: "Idea: tag-scoped prompts",
        body: "Run a consolidation prompt over every note that has a given tag — e.g. all `standup` + `olympic` notes → one weekly summary.",
        status: null,
        priority: "medium",
        difficulty: "m",
        starred: true,
        tags: ["ideas"],
      },
    ],
  };
}
