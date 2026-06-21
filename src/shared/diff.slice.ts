import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";

export interface DiffSlice {
  selectedPath: string | null;
  diffText: string;
  clearDiff: () => void;
}

export const createDiffSlice: StateCreator<Store, [], [], DiffSlice> = (set) => ({
  selectedPath: null,
  diffText: "",
  clearDiff: () => set({ selectedPath: null, diffText: "" }),
});
