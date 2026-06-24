import { call } from "@/shared/api/client";
import type { Commit, GraphRow, FileStatus } from "@/shared/types";

// Una sola lectura: commits + grafo derivados del mismo `git log` en el backend
// (antes eran `commit_log` + `commit_graph`, dos `git log --all` por refresh).
export function commitHistory(
  repo: string,
  limit = 200,
): Promise<{ commits: Commit[]; graph: GraphRow[] }> {
  return call("commit_history", { repo, limit });
}

export function commitFiles(repo: string, hash: string): Promise<FileStatus[]> {
  return call("commit_files", { repo, hash });
}

export function commitDiff(repo: string, hash: string, path: string): Promise<string> {
  return call("commit_diff", { repo, hash, path });
}
