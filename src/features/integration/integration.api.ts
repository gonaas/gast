import { call } from "@/shared/api/client";
import type { ConflictState } from "@/shared/types";

export function mergeBranch(repo: string, name: string): Promise<string> {
  return call("merge_branch", { repo, name });
}

export function rebaseOnto(repo: string, onto: string): Promise<string> {
  return call("rebase_onto", { repo, onto });
}

export function conflictState(repo: string): Promise<ConflictState> {
  return call("conflict_state", { repo });
}

export function conflictContent(repo: string, path: string): Promise<string> {
  return call("conflict_content", { repo, path });
}

export function resolveOurs(repo: string, path: string): Promise<ConflictState> {
  return call("resolve_ours", { repo, path });
}

export function resolveTheirs(repo: string, path: string): Promise<ConflictState> {
  return call("resolve_theirs", { repo, path });
}

export function markResolved(repo: string, path: string): Promise<ConflictState> {
  return call("mark_resolved", { repo, path });
}

export function abortOperation(repo: string): Promise<ConflictState> {
  return call("abort_operation", { repo });
}

export function continueOperation(repo: string): Promise<ConflictState> {
  return call("continue_operation", { repo });
}
