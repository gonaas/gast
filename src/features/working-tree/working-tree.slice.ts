import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";
import type { RepoStatus } from "@/shared/types";
import * as api from "./working-tree.api";

// Árbol de trabajo: estado (staged/unstaged/untracked), staging y creación de commit.
export interface WorkingTreeSlice {
  status: RepoStatus | null;
  loadStatus: (repoPath: string) => Promise<void>;
  selectFile: (path: string, staged: boolean, untracked: boolean) => Promise<void>;
  stageFile: (path: string) => Promise<void>;
  unstageFile: (path: string) => Promise<void>;
  discardFile: (path: string) => Promise<void>;
  commit: (message: string, amend: boolean) => Promise<void>;
}

export const createWorkingTreeSlice: StateCreator<Store, [], [], WorkingTreeSlice> = (set, get) => ({
  status: null,

  loadStatus: async (repoPath) => {
    set({ status: await api.repoStatus(repoPath) });
  },

  selectFile: async (path, staged, untracked) => {
    const repo = get().repo;
    if (!repo) return;
    set({ selectedPath: path, error: null });
    try {
      const diffText = untracked
        ? await api.untrackedDiff(repo.path, path)
        : await api.fileDiff(repo.path, path, staged);
      set({ diffText });
    } catch (e) {
      set({ error: String(e), diffText: "" });
    }
  },

  stageFile: async (path) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ status: await api.stageFile(repo.path, path) });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  unstageFile: async (path) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ status: await api.unstageFile(repo.path, path) });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  discardFile: async (path) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ status: await api.discardFile(repo.path, path), diffText: "" });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  commit: async (message, amend) => {
    const repo = get().repo;
    if (!repo || !message.trim()) return;
    set({ loading: true, error: null });
    try {
      await api.commit(repo.path, message, amend);
      set({ selectedPath: null, diffText: "" });
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },
});
