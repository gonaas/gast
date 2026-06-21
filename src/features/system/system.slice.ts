import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";
import * as api from "./system.api";
import type { OpenTarget } from "./system.api";

// Capacidades del sistema (espeja el slice `system` del backend): abrir una ruta
// en una app externa (editor/terminal/finder). Se usa para "abrir worktree" pero
// no lee estado de worktrees: solo reenvía la ruta.
export interface SystemSlice {
  openWorktree: (path: string, target: OpenTarget) => Promise<void>;
}

export const createSystemSlice: StateCreator<Store, [], [], SystemSlice> = (set) => ({
  openWorktree: async (path, target) => {
    try {
      await api.openPath(path, target);
    } catch (e) {
      set({ error: String(e) });
    }
  },
});
