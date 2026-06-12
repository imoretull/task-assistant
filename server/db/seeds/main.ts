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
        status: "today",
        starred: true,
        tags: ["olympic", "work"],
      },
      {
        id: "T-0002",
        type: "task",
        title: "Fix flaky login e2e test",
        body: "Fails ~1 in 5 runs on CI. Suspect a race in the session cookie setup.",
        status: "today",
        tags: ["work"],
      },
      {
        id: "T-0003",
        type: "task",
        title: "Draft Q3 team goals",
        body: "",
        status: "backlog",
      },
      {
        id: "N-0001",
        type: "note",
        title: "Standup notes — Mon",
        body: "anna is finishing the api migration today.  ben blocked on the design review, will ping carla. i need to follow up on the perf regression before thursday",
        status: null,
        tags: ["standup", "olympic"],
      },
      {
        id: "N-0002",
        type: "note",
        title: "Idea: weekly review note",
        body: "Every Friday, skim the History tab and pull next week's first tasks out of the Backlog.",
        status: null,
        starred: true,
        tags: ["ideas"],
      },
    ],
  };
}
