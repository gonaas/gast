import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";
import type { Repo, RecentRepo } from "@/shared/types";
import * as api from "./repo.api";

// Dueño del ciclo de vida del repo actual y del estado global loading/error
// ("la app está ocupada / falló en el repo actual"). refresh() es el orquestador:
// dispara el loader de cada slice en paralelo vía get(), sin importar otro slice.
export interface RepoSlice {
  repo: Repo | null;
  recentRepos: RecentRepo[];
  loading: boolean;
  error: string | null;
  openRepo: (path: string) => Promise<void>;
  loadRecentRepos: () => Promise<void>;
  forgetRecentRepo: (path: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const createRepoSlice: StateCreator<Store, [], [], RepoSlice> = (set, get) => ({
  repo: null,
  recentRepos: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  openRepo: async (path) => {
    set({ loading: true, error: null });
    try {
      const repo = await api.openRepo(path);
      set({ repo });
      await get().refresh();
      // El backend ya registró el repo al abrirlo; refrescamos la lista local.
      set({ recentRepos: await api.recentRepos() });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  loadRecentRepos: async () => {
    try {
      set({ recentRepos: await api.recentRepos() });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  forgetRecentRepo: async (path) => {
    try {
      set({ recentRepos: await api.forgetRecentRepo(path) });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  refresh: async () => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().loadHistory(repo.path),
        get().loadStatus(repo.path),
        get().loadBranches(repo.path),
        get().loadTags(repo.path),
        get().loadRemotes(repo.path),
        get().loadStashes(repo.path),
        get().loadWorktrees(repo.path),
        get().loadConflict(repo.path),
      ]);
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },
});
