import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";
import type { Commit, GraphRow, FileStatus } from "@/shared/types";
import * as api from "./commit.api";

// Lado de lectura del historial: commits, grafo y el commit seleccionado.
export interface CommitSlice {
  commits: Commit[];
  graph: GraphRow[];
  selectedCommit: string | null;
  commitFiles: FileStatus[];
  loadHistory: (repoPath: string) => Promise<void>;
  selectCommit: (hash: string) => Promise<void>;
  selectCommitFile: (path: string) => Promise<void>;
}

export const createCommitSlice: StateCreator<Store, [], [], CommitSlice> = (set, get) => ({
  commits: [],
  graph: [],
  selectedCommit: null,
  commitFiles: [],

  loadHistory: async (repoPath) => {
    const [commits, graph] = await Promise.all([api.commitLog(repoPath), api.commitGraph(repoPath)]);
    set({ commits, graph });
  },

  selectCommit: async (hash) => {
    const repo = get().repo;
    if (!repo) return;
    set({ selectedCommit: hash, selectedPath: null, diffText: "", error: null });
    try {
      const commitFiles = await api.commitFiles(repo.path, hash);
      set({ commitFiles });
    } catch (e) {
      set({ error: String(e), commitFiles: [] });
    }
  },

  selectCommitFile: async (path) => {
    const { repo, selectedCommit } = get();
    if (!repo || !selectedCommit) return;
    set({ selectedPath: path, error: null });
    try {
      const diffText = await api.commitDiff(repo.path, selectedCommit, path);
      set({ diffText });
    } catch (e) {
      set({ error: String(e), diffText: "" });
    }
  },
});
