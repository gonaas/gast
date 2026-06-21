import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";
import * as api from "./assistant.api";

// Asistencia con IA (espeja el slice `assistant` del backend). Genera un mensaje
// de commit a partir del diff staged; devuelve el texto para que el componente
// lo coloque en el textarea.
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
