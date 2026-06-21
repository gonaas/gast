import { call } from "@/shared/api/client";
import type { RepoStatus } from "@/shared/types";

export function repoStatus(repo: string): Promise<RepoStatus> {
  return call("repo_status", { repo });
}

// El diff de un archivo del working tree (staged o no) y el de un archivo sin
// trackear pertenecen a este slice: responden "qué cambió en el árbol de trabajo".
export function fileDiff(repo: string, path: string, staged: boolean): Promise<string> {
  return call("file_diff", { repo, path, staged });
}

export function untrackedDiff(repo: string, path: string): Promise<string> {
  return call("untracked_diff", { repo, path });
}

export function stageFile(repo: string, path: string): Promise<RepoStatus> {
  return call("stage_file", { repo, path });
}

export function unstageFile(repo: string, path: string): Promise<RepoStatus> {
  return call("unstage_file", { repo, path });
}

export function discardFile(repo: string, path: string): Promise<RepoStatus> {
  return call("discard_file", { repo, path });
}

export function commit(repo: string, message: string, amend: boolean): Promise<RepoStatus> {
  return call("commit", { repo, message, amend });
}
