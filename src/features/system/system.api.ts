import { call } from "@/shared/api/client";

export type OpenTarget = "editor" | "terminal" | "finder";

export function openPath(path: string, target: OpenTarget): Promise<void> {
  return call("open_path", { path, target });
}
