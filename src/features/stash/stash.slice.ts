import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";
import type { Stash } from "@/shared/types";
import * as api from "./stash.api";

export interface StashSlice {
  stashes: Stash[];
  loadStashes: (repoPath: string) => Promise<void>;
  saveStash: (message: string) => Promise<void>;
  applyStash: (reference: string, pop: boolean) => Promise<void>;
  dropStash: (reference: string) => Promise<void>;
}

export const createStashSlice: StateCreator<Store, [], [], StashSlice> = (set, get) => ({
  stashes: [],

  loadStashes: async (repoPath) => {
    set({ stashes: await api.listStashes(repoPath) });
  },

  saveStash: async (message) => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      await api.saveStash(repo.path, message);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  applyStash: async (reference, pop) => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      if (pop) await api.popStash(repo.path, reference);
      else await api.applyStash(repo.path, reference);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  dropStash: async (reference) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ stashes: await api.dropStash(repo.path, reference) });
    } catch (e) {
      set({ error: String(e) });
    }
  },
});
