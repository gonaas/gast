import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";
import * as api from "./tag.api";

export interface TagSlice {
  tags: string[];
  loadTags: (repoPath: string) => Promise<void>;
  createTag: (name: string, message: string, target: string) => Promise<void>;
  deleteTag: (name: string) => Promise<void>;
}

export const createTagSlice: StateCreator<Store, [], [], TagSlice> = (set, get) => ({
  tags: [],

  loadTags: async (repoPath) => {
    set({ tags: await api.listTags(repoPath) });
  },

  createTag: async (name, message, target) => {
    const repo = get().repo;
    if (!repo || !name.trim()) return;
    try {
      set({ tags: await api.createTag(repo.path, name, message, target) });
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    }
  },

  deleteTag: async (name) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ tags: await api.deleteTag(repo.path, name) });
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    }
  },
});
