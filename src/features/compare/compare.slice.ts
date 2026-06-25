import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";
import type { FileStatus } from "@/shared/types";
import * as api from "./compare.api";

// Comparación entre dos ramas: la actual (base) y la seleccionada (target).
// Reutiliza `selectedPath`/`diffText` de DiffSlice, así `DiffView` no cambia.
export interface CompareSlice {
  compareBase: string | null;
  compareTarget: string | null;
  compareFiles: FileStatus[];
  openCompare: (target: string) => Promise<void>;
  selectCompareFile: (path: string) => Promise<void>;
}

export const createCompareSlice: StateCreator<Store, [], [], CompareSlice> = (set, get) => ({
  compareBase: null,
  compareTarget: null,
  compareFiles: [],

  openCompare: async (target) => {
    const { repo } = get();
    if (!repo) return;
    const base = repo.head; // rama actual (HEAD) en este momento
    set({
      view: "compare",
      compareBase: base,
      compareTarget: target,
      compareFiles: [],
      selectedPath: null,
      diffText: "",
      error: null,
    });
    try {
      const compareFiles = await api.compareFiles(repo.path, base ?? "HEAD", target);
      set({ compareFiles });
    } catch (e) {
      set({ error: String(e), compareFiles: [] });
    }
  },

  selectCompareFile: async (path) => {
    const { repo, compareBase, compareTarget } = get();
    if (!repo || !compareTarget) return;
    set({ selectedPath: path, error: null });
    try {
      const diffText = await api.compareDiff(repo.path, compareBase ?? "HEAD", compareTarget, path);
      set({ diffText });
    } catch (e) {
      set({ error: String(e), diffText: "" });
    }
  },
});
