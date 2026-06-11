import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { useActiveDbId, type DatabaseMeta } from "./database";
import type { AssistantResponse, Item, SavedPrompt, Tag } from "./types";

// All data query keys are namespaced by the active database id so caches are
// atomic per database — switching never shows another database's rows.
const itemsKey = (db: string) => ["db", db, "items"] as const;
const trashKey = (db: string) => ["db", db, "trash"] as const;
const tagsKey = (db: string) => ["db", db, "tags"] as const;

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

export function useTags() {
  const db = useActiveDbId();
  return useQuery({ queryKey: tagsKey(db), queryFn: () => api<Tag[]>("/tags") });
}

export function usePrompts() {
  return useQuery({
    queryKey: ["prompts"],
    queryFn: () => api<SavedPrompt[]>("/assistant/prompts"),
    staleTime: Infinity,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  const db = useActiveDbId();
  return () => {
    void qc.invalidateQueries({ queryKey: itemsKey(db) });
    void qc.invalidateQueries({ queryKey: trashKey(db) });
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

export function useRunAssistant() {
  return useMutation({
    mutationFn: (input: {
      promptId?: string;
      promptText?: string;
      itemIds?: string[];
      tagIds?: number[];
    }) => api<AssistantResponse>("/assistant", { method: "POST", body: JSON.stringify(input) }),
  });
}
