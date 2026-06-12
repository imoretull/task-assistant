import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { useActiveDbId, type DatabaseMeta } from "./database";
import type { Item, Pin, Tag } from "./types";

// All data query keys are namespaced by the active database id so caches are
// atomic per database — switching never shows another database's rows.
const itemsKey = (db: string) => ["db", db, "items"] as const;
const trashKey = (db: string) => ["db", db, "trash"] as const;
const tagsKey = (db: string) => ["db", db, "tags"] as const;
const pinsKey = (db: string) => ["db", db, "pins"] as const;

export function useDatabases() {
  return useQuery({
    queryKey: ["databases"],
    queryFn: () => api<DatabaseMeta[]>("/databases"),
    staleTime: Infinity,
  });
}

export function useItems() {
  const db = useActiveDbId();
  return useQuery({ queryKey: itemsKey(db), queryFn: () => api<Item[]>("/items") });
}

export function useTrash() {
  const db = useActiveDbId();
  return useQuery({ queryKey: trashKey(db), queryFn: () => api<Item[]>("/items?trash=true") });
}

const scratchKey = (db: string) => ["db", db, "scratch"] as const;

/** The per-database singleton scratchpad note (created server-side on first
 *  access). Kept out of the main items list, so it has its own query. */
export function useScratchpad(enabled: boolean) {
  const db = useActiveDbId();
  return useQuery({
    queryKey: scratchKey(db),
    queryFn: () => api<Item>("/items/scratch"),
    enabled,
  });
}

export function useTags() {
  const db = useActiveDbId();
  return useQuery({ queryKey: tagsKey(db), queryFn: () => api<Tag[]>("/tags") });
}

export function usePins() {
  const db = useActiveDbId();
  return useQuery({ queryKey: pinsKey(db), queryFn: () => api<Pin[]>("/pins") });
}

export function useCreatePin() {
  const qc = useQueryClient();
  const db = useActiveDbId();
  return useMutation({
    mutationFn: (input: { itemId: string; content: string }) =>
      api<Pin>("/pins", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: pinsKey(db) }),
  });
}

export function useUpdatePin() {
  const qc = useQueryClient();
  const db = useActiveDbId();
  return useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      api<Pin>(`/pins/${id}`, { method: "PATCH", body: JSON.stringify({ content }) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: pinsKey(db) }),
  });
}

export function useDeletePin() {
  const qc = useQueryClient();
  const db = useActiveDbId();
  return useMutation({
    mutationFn: (id: number) => api<void>(`/pins/${id}`, { method: "DELETE" }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: pinsKey(db) }),
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  const db = useActiveDbId();
  return () => {
    void qc.invalidateQueries({ queryKey: itemsKey(db) });
    void qc.invalidateQueries({ queryKey: trashKey(db) });
    // Pins are joined against live items, so trash/restore/delete affects them.
    void qc.invalidateQueries({ queryKey: pinsKey(db) });
  };
}

export function useCreateItem() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: Partial<Item> & { tags?: number[] }) =>
      api<Item>("/items", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: invalidate,
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  const db = useActiveDbId();
  const key = itemsKey(db);
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<Item> & { tags?: number[] }) =>
      api<Item>(`/items/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    // Optimistic update so drag & drop and toggles feel instant.
    onMutate: async ({ id, ...patch }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Item[]>(key);
      if (prev) {
        qc.setQueryData<Item[]>(
          key,
          prev.map((it) => (it.id === id ? ({ ...it, ...patch } as Item) : it))
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: key });
      // The scratchpad lives outside the items list but is edited via this hook.
      void qc.invalidateQueries({ queryKey: scratchKey(db) });
    },
  });
}

export function useDeleteItem() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => api<Item>(`/items/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}

export function useRestoreItem() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => api<Item>(`/items/${id}/restore`, { method: "POST" }),
    onSuccess: invalidate,
  });
}

export function usePermanentDelete() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/items/${id}/permanent`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}

export function useEmptyTrash() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: () => api<{ deleted: number }>("/items/trash/empty", { method: "POST" }),
    onSuccess: invalidate,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  const db = useActiveDbId();
  return useMutation({
    mutationFn: (input: { name: string; color?: string | null; kind?: Tag["kind"] }) =>
      api<Tag>("/tags", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: tagsKey(db) }),
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  const db = useActiveDbId();
  return useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: number; name?: string; color?: string | null; kind?: Tag["kind"] }) =>
      api<Tag>(`/tags/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: tagsKey(db) }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  const db = useActiveDbId();
  return useMutation({
    mutationFn: (id: number) => api<void>(`/tags/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: tagsKey(db) });
      void qc.invalidateQueries({ queryKey: itemsKey(db) });
    },
  });
}
