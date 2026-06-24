import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useStore } from "@/shared/store";

interface RepoChange {
  path: string;
  kind: "git" | "worktree";
}

// Escucha el evento `repo-changed` que emite el backend cuando detecta cambios
// en el repo activo y recarga el estado: refresh completo (silencioso) si cambió
// `.git` (rama/commit), o solo el status si fue una edición del working tree.
//
// Robustez para monorepos con mucho churn (dev servers, build tools):
//   - cooldown mínimo entre recargas,
//   - nunca se solapan recargas (single-flight),
//   - eventos en ráfaga se colapsan en uno ("git" gana sobre "worktree"),
//   - la recarga es silenciosa: no enciende el spinner global ni pisa errores.
const COOLDOWN_MS = 600;

export function useRepoWatcher() {
  useEffect(() => {
    let pending: RepoChange | null = null;
    let running = false;
    let lastRun = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (timer || running || !pending) return;
      const wait = Math.max(0, COOLDOWN_MS - (Date.now() - lastRun));
      timer = setTimeout(run, wait);
    };

    const run = async () => {
      timer = null;
      const change = pending;
      pending = null;
      if (!change) return;

      const store = useStore.getState();
      const repo = store.repo;
      if (!repo || repo.path !== change.path) return;

      running = true;
      lastRun = Date.now();
      try {
        if (change.kind === "git") {
          await store.refresh({ silent: true });
        } else {
          await store.loadStatus(repo.path);
        }
      } finally {
        running = false;
        // Si llegaron más eventos mientras recargábamos, agenda otra pasada.
        schedule();
      }
    };

    const unlistenPromise = listen<RepoChange>("repo-changed", (event) => {
      // "git" gana sobre "worktree" si llegan ambos en la misma ventana.
      pending = pending?.kind === "git" ? pending : event.payload;
      schedule();
    });

    return () => {
      if (timer) clearTimeout(timer);
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);
}
