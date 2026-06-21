import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";
import type { Remote } from "@/shared/types";
import * as api from "./remote.api";
import type { PullStrategy } from "./remote.api";

export interface RemoteSlice {
  remotes: Remote[];
  loadRemotes: (repoPath: string) => Promise<void>;
  remoteOp: (op: "fetch" | "pull" | "push", strategy?: PullStrategy) => Promise<void>;
  addRemote: (name: string, url: string) => Promise<void>;
  removeRemote: (name: string) => Promise<void>;
}

export const createRemoteSlice: StateCreator<Store, [], [], RemoteSlice> = (set, get) => ({
  remotes: [],

  loadRemotes: async (repoPath) => {
    set({ remotes: await api.listRemotes(repoPath) });
  },

  remoteOp: async (op, strategy) => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      if (op === "fetch") await api.fetch(repo.path);
      else if (op === "pull") await api.pull(repo.path, strategy ?? "ffOnly");
      else await api.push(repo.path);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  addRemote: async (name, url) => {
    const repo = get().repo;
    if (!repo || !name.trim() || !url.trim()) return;
    try {
      set({ remotes: await api.addRemote(repo.path, name, url) });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  removeRemote: async (name) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ remotes: await api.removeRemote(repo.path, name) });
    } catch (e) {
      set({ error: String(e) });
    }
  },
});
