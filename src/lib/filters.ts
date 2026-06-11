import type { Item, SortKey, View } from "./types";

export interface Filters {
  view: View;
  activeTagIds: number[];
  tagMode: "and" | "or";
  sort: SortKey;
}

export function matchesTags(item: Item, tagIds: number[], mode: "and" | "or"): boolean {
  if (tagIds.length === 0) return true;
  return mode === "and"
    ? tagIds.every((t) => item.tags.includes(t))
    : tagIds.some((t) => item.tags.includes(t));
}

export function filterItems(items: Item[], f: Filters): Item[] {
  let out = items.filter((it) => matchesTags(it, f.activeTagIds, f.tagMode));
  switch (f.view) {
    case "board":
      out = out.filter((it) => it.status !== null);
      break;
    case "notes":
      out = out.filter((it) => it.type === "note" && it.status === null);
      break;
    case "starred":
      out = out.filter((it) => it.starred);
      break;
    default:
      break;
  }
  return out;
}

const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
const DIFFICULTY_RANK = { xs: 0, s: 1, m: 2, l: 3, xl: 4 } as const;

export function sortItems(items: Item[], sort: SortKey): Item[] {
  const sorted = [...items];
  sorted.sort((a, b) => {
    // Starred pins to the top regardless of sort key.
    if (a.starred !== b.starred) return a.starred ? -1 : 1;
    switch (sort) {
      case "priority":
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      case "difficulty":
        return DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty];
      case "dueDate": {
        if (!a.dueDate && !b.dueDate) return a.sortOrder - b.sortOrder;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      case "createdAt":
        return b.createdAt.localeCompare(a.createdAt);
      default:
        return a.sortOrder - b.sortOrder;
    }
  });
  return sorted;
}

export interface ItemGroup {
  label: string;
  items: Item[];
}

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};
const PRIORITY_GROUP_ORDER = ["Urgent", "High", "Medium", "Low"];

const DIFFICULTY_LABELS: Record<string, string> = {
  xs: "XS — trivial",
  s: "S — small",
  m: "M — medium",
  l: "L — large",
  xl: "XL — epic",
};
const DIFFICULTY_GROUP_ORDER = Object.values(DIFFICULTY_LABELS);

const DUE_GROUP_ORDER = [
  "Overdue",
  "Today",
  "Tomorrow",
  "This week",
  "Next week",
  "Later",
  "No due date",
];

const CREATED_GROUP_ORDER = ["Today", "Yesterday", "This week", "This month", "Older"];

/** Whole calendar days from today to the given date-only/ISO string. */
function daysFromToday(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date.slice(0, 10) + "T00:00:00");
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

function dueBucket(dueDate: string | null): string {
  if (!dueDate) return "No due date";
  const days = daysFromToday(dueDate);
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return "This week";
  if (days <= 14) return "Next week";
  return "Later";
}

function createdBucket(createdAt: string): string {
  const days = -daysFromToday(createdAt);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days <= 7) return "This week";
  if (days <= 30) return "This month";
  return "Older";
}

/** Canonical bucket labels for a sort key, in display order. Null when the
 *  sort has no meaningful buckets (manual). */
export function sortBuckets(sort: SortKey): string[] | null {
  switch (sort) {
    case "priority":
      return PRIORITY_GROUP_ORDER;
    case "difficulty":
      return DIFFICULTY_GROUP_ORDER;
    case "dueDate":
      return DUE_GROUP_ORDER;
    case "createdAt":
      return CREATED_GROUP_ORDER;
    default:
      return null;
  }
}

/** Which bucket an item falls into for the given sort. */
export function bucketOf(item: Item, sort: SortKey): string | null {
  switch (sort) {
    case "priority":
      return PRIORITY_LABELS[item.priority];
    case "difficulty":
      return DIFFICULTY_LABELS[item.difficulty];
    case "dueDate":
      return dueBucket(item.dueDate);
    case "createdAt":
      return createdBucket(item.createdAt);
    default:
      return null;
  }
}

/**
 * Partition an (already sorted) list into labeled groups for the active sort,
 * so boards and grids show a clear division instead of one undifferentiated
 * stream. Manual sort gets no grouping. Empty groups are dropped.
 */
export function groupItems(items: Item[], sort: SortKey): ItemGroup[] | null {
  const order = sortBuckets(sort);
  if (order === null) return null;

  const buckets = new Map<string, Item[]>();
  for (const it of items) {
    const label = bucketOf(it, sort)!;
    const list = buckets.get(label) ?? [];
    list.push(it);
    buckets.set(label, list);
  }
  return order
    .filter((label) => buckets.has(label))
    .map((label) => ({ label, items: buckets.get(label)! }));
}

export function tagCounts(items: Item[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const it of items) {
    for (const t of it.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return counts;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function bodyPreview(body: string, max = 180): string {
  const flat = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*`_\[\]\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return flat.length > max ? flat.slice(0, max) + "…" : flat;
}
