import { call } from "@/shared/api/client";
import type { FileStatus } from "@/shared/types";

// Diff de 3 puntos `base...target` (lo que `target` añadió desde el ancestro
// común con `base`). Casan con los comandos del slice commit en el backend.
export function compareFiles(repo: string, base: string, target: string): Promise<FileStatus[]> {
  return call("compare_files", { repo, base, target });
}

export function compareDiff(
  repo: string,
  base: string,
  target: string,
  path: string,
): Promise<string> {
  return call("compare_diff", { repo, base, target, path });
}
