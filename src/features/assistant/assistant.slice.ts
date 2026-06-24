import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";
import * as api from "./assistant.api";

export interface AssistantSlice {
  generateCommitMessage: () => Promise<string>;
}

export const createAssistantSlice: StateCreator<Store, [], [], AssistantSlice> = (set, get) => ({
  generateCommitMessage: async () => {
    const repo = get().repo;
    if (!repo) return "";
    try {
      return await api.generateCommitMessage(repo.path);
    } catch (e) {
      set({ error: String(e) });
      return "";
    }
  },
});
