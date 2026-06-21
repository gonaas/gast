import { call } from "@/shared/api/client";
import type { Worktree } from "@/shared/types";

export function listWorktrees(repo: string): Promise<Worktree[]> {
  return call("list_worktrees", { repo });
}

export function addWorktree(
  repo: string,
  path: string,
  branch: string,
  newBranch: boolean,
  start: string,
): Promise<Worktree[]> {
  return call("add_worktree", { repo, path, branch, newBranch, start });
}

export function removeWorktree(repo: string, path: string, force: boolean): Promise<Worktree[]> {
  return call("remove_worktree", { repo, path, force });
}

export function pruneWorktrees(repo: string): Promise<Worktree[]> {
  return call("prune_worktrees", { repo });
}
