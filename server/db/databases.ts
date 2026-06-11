/** Registry of available databases. Each maps to its own SQLite file under
 *  data/, so switching is atomic — no cross-DB reads or writes. */
export interface DatabaseMeta {
  id: string;
  /** Label shown in the header dropdown. */
  name: string;
  /** Short description for the dropdown. */
  description: string;
  /** File name inside data/. */
  file: string;
}

export const DATABASES = [
  {
    id: "main",
    name: "My workspace",
    description: "Your tasks and notes",
    file: "app.db",
  },
  {
    id: "demo",
    name: "Demo — Director of SW Dev",
    description: "A full day across 5 projects",
    file: "demo.db",
  },
  {
    id: "demo-react",
    name: "Demo — Senior React Developer",
    description: "A sprint of features, reviews, and perf work",
    file: "demo-react.db",
  },
  {
    id: "demo-qa",
    name: "Demo — QA SDET Automation Engineer",
    description: "Release sign-off, flaky tests, and test automation",
    file: "demo-qa.db",
  },
  {
    id: "demo-scrum",
    name: "Demo — Scrum Master",
    description: "Two squads, ceremonies, impediments, and coaching",
    file: "demo-scrum.db",
  },
  {
    id: "demo-manager",
    name: "Demo — Team Manager",
    description: "1-1s, hiring, performance, and delivery for a team of 8",
    file: "demo-manager.db",
  },
  {
    id: "demo-devops",
    name: "Demo — DevOps Engineer",
    description: "An on-call week of incidents, pipelines, and cloud costs",
    file: "demo-devops.db",
  },
] as const satisfies readonly DatabaseMeta[];

export type DatabaseId = (typeof DATABASES)[number]["id"];

export const DEFAULT_DB_ID: DatabaseId = "main";

export function isDatabaseId(id: string | undefined): id is DatabaseId {
  return DATABASES.some((d) => d.id === id);
}
