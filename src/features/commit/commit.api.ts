import { call } from "@/shared/api/client";
import type { Commit, GraphRow, FileStatus } from "@/shared/types";

export function commitLog(repo: string, limit = 200): Promise<Commit[]> {
  return call("commit_log", { repo, limit });
}

export function commitGraph(repo: string, limit = 200): Promise<GraphRow[]> {
  return call("commit_graph", { repo, limit });
}

export function commitFiles(repo: string, hash: string): Promise<FileStatus[]> {
  return call("commit_files", { repo, hash });
}

export function commitDiff(repo: string, hash: string, path: string): Promise<string> {
  return call("commit_diff", { repo, hash, path });
}
