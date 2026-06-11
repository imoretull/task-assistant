import { useSyncExternalStore } from "react";

export interface DatabaseMeta {
  id: string;
  name: string;
  description: string;
}

const KEY = "tasknotes-active-db";
const DEFAULT_ID = "main";

let activeId: string = localStorage.getItem(KEY) ?? DEFAULT_ID;
const listeners = new Set<() => void>();

/** The id sent as the X-Database header on every API request. */
export function getActiveDbId(): string {
  return activeId;
}

export function setActiveDbId(id: string) {
  if (id === activeId) return;
  activeId = id;
  localStorage.setItem(KEY, id);
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** React hook for the active database id (re-renders on switch). */
export function useActiveDbId(): string {
  return useSyncExternalStore(subscribe, getActiveDbId, getActiveDbId);
}
