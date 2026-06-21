import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";
import type { ConflictState } from "@/shared/types";
import * as api from "./integration.api";

// Integración de historiales (espeja el slice `integration` del backend): merge,
// rebase y la máquina de estados de conflictos en curso.
export interface IntegrationSlice {
  conflict: ConflictState | null;
  loadConflict: (repoPath: string) => Promise<void>;
  mergeBranch: (name: string) => Promise<void>;
  rebaseOnto: (onto: string) => Promise<void>;
  selectConflict: (path: string) => Promise<void>;
  resolveConflict: (path: string, side: "ours" | "theirs" | "resolved") => Promise<void>;
  abortOperation: () => Promise<void>;
  continueOperation: () => Promise<void>;
}

export const createIntegrationSlice: StateCreator<Store, [], [], IntegrationSlice> = (set, get) => ({
  conflict: null,

  loadConflict: async (repoPath) => {
    set({ conflict: await api.conflictState(repoPath) });
  },

  mergeBranch: async (name) => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      await api.mergeBranch(repo.path, name);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  rebaseOnto: async (onto) => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      await api.rebaseOnto(repo.path, onto);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  selectConflict: async (path) => {
    const repo = get().repo;
    if (!repo) return;
    set({ selectedPath: path, error: null });
    try {
      set({ diffText: await api.conflictContent(repo.path, path) });
    } catch (e) {
      set({ error: String(e), diffText: "" });
    }
  },

  resolveConflict: async (path, side) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      const fn =
        side === "ours" ? api.resolveOurs : side === "theirs" ? api.resolveTheirs : api.markResolved;
      const conflict = await fn(repo.path, path);
      set({ conflict, selectedPath: null, diffText: "" });
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    }
  },

  abortOperation: async () => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      set({ conflict: await api.abortOperation(repo.path) });
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  continueOperation: async () => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      set({ conflict: await api.continueOperation(repo.path) });
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },
});
