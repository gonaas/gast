import { open } from "@tauri-apps/plugin-dialog";

export function pickRepoFolder(): Promise<string | null> {
  return open({ directory: true, multiple: false }) as Promise<string | null>;
}
