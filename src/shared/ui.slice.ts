import type { StateCreator } from "zustand";
import type { Store } from "./store";

export type View = "changes" | "history" | "compare";

export interface UiSlice {
  view: View;
  setView: (view: View) => void;
}

export const createUiSlice: StateCreator<Store, [], [], UiSlice> = (set, get) => ({
  view: "history",
  setView: (view) => {
    set({ view });
    get().clearDiff();
  },
});
