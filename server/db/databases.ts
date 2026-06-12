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
    name: "Demo workspace",
    description: "Carried tasks, a backlog pile, and a week of history",
    file: "demo.db",
  },
] as const satisfies readonly DatabaseMeta[];

export type DatabaseId = (typeof DATABASES)[number]["id"];

export const DEFAULT_DB_ID: DatabaseId = "main";

export function isDatabaseId(id: string | undefined): id is DatabaseId {
  return DATABASES.some((d) => d.id === id);
}
