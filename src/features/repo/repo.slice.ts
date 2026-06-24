import type { StateCreator } from "zustand";
import type { Store } from "@/shared/store";
import type { Repo, RecentRepo, OpenTab } from "@/shared/types";
import * as api from "./repo.api";
import * as watcher from "./watcher.api";

// Persistencia de las pestañas abiertas (estado de UI de sesión).
const TABS_KEY = "ast-git:open-tabs";

function persistTabs(tabs: OpenTab[], active: string | null) {
  try {
    localStorage.setItem(TABS_KEY, JSON.stringify({ tabs, active }));
  } catch {
    // ignorar cuotas/errores de storage
  }
}

function readPersistedTabs(): { tabs: OpenTab[]; active: string | null } {
  try {
    const raw = localStorage.getItem(TABS_KEY);
    if (!raw) return { tabs: [], active: null };
    const parsed = JSON.parse(raw);
    const tabs: OpenTab[] = Array.isArray(parsed?.tabs) ? parsed.tabs : [];
    return { tabs, active: typeof parsed?.active === "string" ? parsed.active : null };
  } catch {
    return { tabs: [], active: null };
  }
}

// Dueño del ciclo de vida del repo actual y del estado global loading/error
// ("la app está ocupada / falló en el repo actual"). refresh() es el orquestador:
// dispara el loader de cada slice en paralelo vía get(), sin importar otro slice.
// También mantiene las pestañas de repos abiertos (estilo Fork): abrir y cambiar
// de pestaña son la misma operación de carga sobre el store global.
export interface RepoSlice {
  repo: Repo | null;
  recentRepos: RecentRepo[];
  tabs: OpenTab[];
  activeTab: string | null;
  loading: boolean;
  error: string | null;
  openRepo: (path: string) => Promise<void>;
  closeTab: (path: string) => Promise<void>;
  restoreOpenTabs: () => Promise<void>;
  loadRecentRepos: () => Promise<void>;
  forgetRecentRepo: (path: string) => Promise<void>;
  // `silent`: recarga en segundo plano (disparada por el file watcher) que no
  // enciende el spinner global ni borra el error visible.
  refresh: (opts?: { silent?: boolean }) => Promise<void>;
  clearError: () => void;
}

// Single-flight: una sola recarga en vuelo a la vez. Si llegan eventos del
// watcher mientras refresca, se hace exactamente una pasada extra al terminar
// (coalescing), en vez de apilar recargas y dejar el spinner pegado.
let refreshing = false;
let refreshQueued = false;

export const createRepoSlice: StateCreator<Store, [], [], RepoSlice> = (set, get) => ({
  repo: null,
  recentRepos: [],
  tabs: [],
  activeTab: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  openRepo: async (path) => {
    set({ loading: true, error: null });
    try {
      const repo = await api.openRepo(path);
      // Registrar/activar la pestaña (sin duplicar).
      const exists = get().tabs.some((t) => t.path === path);
      const tabs = exists ? get().tabs : [...get().tabs, { path, name: repo.name }];
      set({ repo, tabs, activeTab: path });
      await get().refresh();
      // Vigila el repo activo para reflejar cambios locales en tiempo real.
      watcher.watchRepo(path).catch(() => {});
      // El backend ya registró el repo al abrirlo; refrescamos la lista local.
      set({ recentRepos: await api.recentRepos() });
      persistTabs(tabs, path);
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  closeTab: async (path) => {
    const tabs = get().tabs;
    const remaining = tabs.filter((t) => t.path !== path);

    // Cerrar una pestaña inactiva: solo actualizar la lista.
    if (get().activeTab !== path) {
      set({ tabs: remaining });
      persistTabs(remaining, get().activeTab);
      return;
    }

    // Cerrar la activa: saltar al vecino (derecha, si no izquierda).
    const idx = tabs.findIndex((t) => t.path === path);
    const neighbor = remaining[idx] ?? remaining[idx - 1] ?? null;
    set({ tabs: remaining });
    if (neighbor) {
      await get().openRepo(neighbor.path);
    } else {
      set({ repo: null, activeTab: null });
      get().clearDiff();
      watcher.unwatchRepo().catch(() => {});
      persistTabs([], null);
    }
  },

  restoreOpenTabs: async () => {
    const { tabs, active } = readPersistedTabs();
    if (tabs.length === 0) return;
    set({ tabs });
    await get().openRepo(active ?? tabs[0].path);
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

  refresh: async (opts) => {
    const silent = opts?.silent ?? false;
    if (!get().repo) return;
    // Ya hay una recarga en vuelo: marca para repetir una vez al terminar.
    if (refreshing) {
      refreshQueued = true;
      return;
    }
    refreshing = true;
    if (!silent) set({ loading: true, error: null });
    try {
      do {
        refreshQueued = false;
        const repo = get().repo;
        if (!repo) break;
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
      } while (refreshQueued);
    } catch (e) {
      set({ error: String(e) });
    } finally {
      refreshing = false;
      if (!silent) set({ loading: false });
    }
  },
});
