import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";
import type { Branch } from "@/shared/types";
import { samePath } from "@/shared/lib/paths";
import * as api from "./branch.api";

export interface BranchSlice {
  branches: Branch[];
  // Rama resaltada en el sidebar (selección visual, independiente de HEAD).
  selectedBranch: string | null;
  selectBranch: (name: string) => void;
  loadBranches: (repoPath: string) => Promise<void>;
  checkoutBranch: (name: string) => Promise<void>;
  createBranch: (name: string, start: string) => Promise<void>;
  deleteBranch: (name: string, force: boolean) => Promise<void>;
  renameBranch: (oldName: string, newName: string) => Promise<void>;
}

export const createBranchSlice: StateCreator<Store, [], [], BranchSlice> = (set, get) => ({
  branches: [],
  selectedBranch: null,

  selectBranch: (name) => set({ selectedBranch: name }),

  loadBranches: async (repoPath) => {
    set({ branches: await api.listBranches(repoPath) });
  },

  checkoutBranch: async (name) => {
    const { repo, worktrees } = get();
    if (!repo) return;
    // Git no permite hacer checkout de una rama ocupada por otro worktree. En vez
    // de propagar el error, navegamos a ese worktree: "ir a la rama" abre su
    // worktree, que es donde realmente vive.
    const wt = worktrees.find((w) => w.branch === name && !samePath(w.path, repo.path));
    if (wt) {
      await get().openRepo(wt.path);
      return;
    }
    set({ loading: true, error: null });
    try {
      await api.checkoutBranch(repo.path, name);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  createBranch: async (name, start) => {
    const repo = get().repo;
    if (!repo || !name.trim()) return;
    set({ loading: true, error: null });
    try {
      await api.createBranch(repo.path, name, start);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  deleteBranch: async (name, force) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ branches: await api.deleteBranch(repo.path, name, force) });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  renameBranch: async (oldName, newName) => {
    const repo = get().repo;
    if (!repo || !newName.trim()) return;
    try {
      set({ branches: await api.renameBranch(repo.path, oldName, newName) });
    } catch (e) {
      set({ error: String(e) });
    }
  },
});
