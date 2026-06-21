import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";
import type { Worktree } from "@/shared/types";
import * as api from "./worktree.api";

export interface WorktreeSlice {
  worktrees: Worktree[];
  loadWorktrees: (repoPath: string) => Promise<void>;
  addWorktree: (path: string, branch: string, newBranch: boolean, start: string) => Promise<void>;
  removeWorktree: (path: string, force: boolean) => Promise<void>;
  pruneWorktrees: () => Promise<void>;
}

export const createWorktreeSlice: StateCreator<Store, [], [], WorktreeSlice> = (set, get) => ({
  worktrees: [],

  loadWorktrees: async (repoPath) => {
    set({ worktrees: await api.listWorktrees(repoPath) });
  },

  addWorktree: async (path, branch, newBranch, start) => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      const worktrees = await api.addWorktree(repo.path, path, branch, newBranch, start);
      set({ worktrees });
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  removeWorktree: async (path, force) => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      const worktrees = await api.removeWorktree(repo.path, path, force);
      set({ worktrees });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  pruneWorktrees: async () => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ worktrees: await api.pruneWorktrees(repo.path) });
    } catch (e) {
      set({ error: String(e) });
    }
  },
});
