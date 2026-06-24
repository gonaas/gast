import { call } from "@/shared/api/client";

// Vigilancia en tiempo real del repo activo (file watcher en el backend).
export function watchRepo(path: string): Promise<void> {
  return call("watch_repo", { path });
}

export function unwatchRepo(): Promise<void> {
  return call("unwatch_repo", {});
}
