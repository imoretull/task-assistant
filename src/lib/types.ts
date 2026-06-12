export type ItemType = "task" | "note";
export type Status = "backlog" | "today" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";
export type Difficulty = "xs" | "s" | "m" | "l" | "xl";

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  body: string;
  status: Status | null;
  priority: Priority;
  difficulty: Difficulty;
  starred: boolean;
  dueDate: string | null;
  /** Local date (YYYY-MM-DD) the task last entered Today — age badge anchor. */
  enteredToday: string | null;
  /** ISO timestamp of completion — History groups by its local day. */
  completedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  tags: number[];
}

export type TagKind = "project" | "person" | "tag";

export interface Tag {
  id: number;
  name: string;
  color: string | null;
  kind: TagKind;
}

/** A pinned line/section of an item's body, for the Pinned quick-reference view. */
export interface Pin {
  id: number;
  itemId: string;
  content: string;
  createdAt: string;
  itemTitle: string;
  itemType: ItemType;
  itemStatus: Status | null;
}

export const STATUSES: { key: Status; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "today", label: "Today" },
  { key: "done", label: "Done" },
];

export const PRIORITIES: { key: Priority; label: string }[] = [
  { key: "low", label: "Low" },
  { key: "medium", label: "Medium" },
  { key: "high", label: "High" },
  { key: "urgent", label: "Urgent" },
];

export const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: "xs", label: "XS" },
  { key: "s", label: "S" },
  { key: "m", label: "M" },
  { key: "l", label: "L" },
  { key: "xl", label: "XL" },
];

export type View = "today" | "history" | "all" | "notes" | "starred" | "pinned" | "trash";
export type SortKey = "manual" | "priority" | "dueDate" | "difficulty" | "createdAt";
