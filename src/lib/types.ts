export type ItemType = "task" | "note";
export type Status = "backlog" | "todo" | "in_progress" | "blocked" | "done";
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

export interface SavedPrompt {
  id: string;
  name: string;
  description: string;
  multi: boolean;
  mode: "replace_body" | "text" | "suggest_tasks";
}

export interface AssistantResponse {
  provider: string;
  promptId: string | null;
  mode: SavedPrompt["mode"];
  itemIds: string[];
  result: string;
  suggestedTasks?: { title: string }[];
}

export const STATUSES: { key: Status; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "todo", label: "Todo" },
  { key: "in_progress", label: "In Progress" },
  { key: "blocked", label: "Blocked" },
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

export type View = "all" | "board" | "notes" | "starred" | "pinned" | "trash";
export type SortKey = "manual" | "priority" | "dueDate" | "difficulty" | "createdAt";
