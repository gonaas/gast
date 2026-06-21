import type { StateCreator } from "zustand";
import type { Store } from "./store";

export interface UiSlice {
  view: "changes" | "history";
  setView: (view: "changes" | "history") => void;
}

export const createUiSlice: StateCreator<Store, [], [], UiSlice> = (set, get) => ({
  view: "history",
  setView: (view) => {
    set({ view });
    get().clearDiff();
  },
});
