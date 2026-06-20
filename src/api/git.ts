import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type {
  Branch,
  Commit,
  ConflictState,
  FileStatus,
  GraphRow,
  RecentRepo,
  Remote,
  Repo,
  RepoStatus,
  Stash,
  Worktree,
} from "../types";

export function pickRepoFolder(): Promise<string | null> {
  return open({ directory: true, multiple: false }) as Promise<string | null>;
}

export function openRepo(path: string): Promise<Repo> {
  return invoke("open_repo", { path });
}

export function recentRepos(): Promise<RecentRepo[]> {
  return invoke("recent_repos", {});
}

export function forgetRecentRepo(path: string): Promise<RecentRepo[]> {
  return invoke("forget_recent_repo", { path });
}

export function commitLog(repo: string, limit = 200): Promise<Commit[]> {
  return invoke("commit_log", { repo, limit });
}

export function listBranches(repo: string): Promise<Branch[]> {
  return invoke("list_branches", { repo });
}

export function repoStatus(repo: string): Promise<RepoStatus> {
  return invoke("repo_status", { repo });
}

export function listWorktrees(repo: string): Promise<Worktree[]> {
  return invoke("list_worktrees", { repo });
}

export function addWorktree(
  repo: string,
  path: string,
  branch: string,
  newBranch: boolean,
  start: string,
): Promise<Worktree[]> {
  return invoke("add_worktree", { repo, path, branch, newBranch, start });
}

export function removeWorktree(
  repo: string,
  path: string,
  force: boolean,
): Promise<Worktree[]> {
  return invoke("remove_worktree", { repo, path, force });
}


export function fileDiff(repo: string, path: string, staged: boolean): Promise<string> {
  return invoke("file_diff", { repo, path, staged });
}

export function untrackedDiff(repo: string, path: string): Promise<string> {
  return invoke("untracked_diff", { repo, path });
}

export function commitFiles(repo: string, hash: string): Promise<FileStatus[]> {
  return invoke("commit_files", { repo, hash });
}

export function commitDiff(repo: string, hash: string, path: string): Promise<string> {
  return invoke("commit_diff", { repo, hash, path });
}

export function stageFile(repo: string, path: string): Promise<RepoStatus> {
  return invoke("stage_file", { repo, path });
}

export function unstageFile(repo: string, path: string): Promise<RepoStatus> {
  return invoke("unstage_file", { repo, path });
}

export function discardFile(repo: string, path: string): Promise<RepoStatus> {
  return invoke("discard_file", { repo, path });
}

export function commit(repo: string, message: string, amend: boolean): Promise<RepoStatus> {
  return invoke("commit", { repo, message, amend });
}

export function fetch(repo: string): Promise<string> {
  return invoke("fetch", { repo });
}

// Debe casar con el enum serde camelCase de Rust (remote/model.rs::PullStrategy).
export type PullStrategy = "merge" | "rebase" | "ffOnly";

export function pull(repo: string, strategy: PullStrategy): Promise<string> {
  return invoke("pull", { repo, strategy });
}

export function push(repo: string): Promise<string> {
  return invoke("push", { repo });
}

export function checkoutBranch(repo: string, name: string): Promise<Branch[]> {
  return invoke("checkout_branch", { repo, name });
}

export function createBranch(repo: string, name: string, start: string): Promise<Branch[]> {
  return invoke("create_branch", { repo, name, start });
}

export function deleteBranch(repo: string, name: string, force: boolean): Promise<Branch[]> {
  return invoke("delete_branch", { repo, name, force });
}

export function renameBranch(repo: string, oldName: string, newName: string): Promise<Branch[]> {
  return invoke("rename_branch", { repo, old: oldName, new: newName });
}

export function listStashes(repo: string): Promise<Stash[]> {
  return invoke("list_stashes", { repo });
}

export function saveStash(repo: string, message: string): Promise<Stash[]> {
  return invoke("save_stash", { repo, message });
}

export function applyStash(repo: string, reference: string): Promise<Stash[]> {
  return invoke("apply_stash", { repo, reference });
}

export function popStash(repo: string, reference: string): Promise<Stash[]> {
  return invoke("pop_stash", { repo, reference });
}

export function dropStash(repo: string, reference: string): Promise<Stash[]> {
  return invoke("drop_stash", { repo, reference });
}

export type OpenTarget = "editor" | "terminal" | "finder";

export function pruneWorktrees(repo: string): Promise<Worktree[]> {
  return invoke("prune_worktrees", { repo });
}

export function openPath(path: string, target: OpenTarget): Promise<void> {
  return invoke("open_path", { path, target });
}

export function commitGraph(repo: string, limit = 200): Promise<GraphRow[]> {
  return invoke("commit_graph", { repo, limit });
}

export function listTags(repo: string): Promise<string[]> {
  return invoke("list_tags", { repo });
}

export function createTag(
  repo: string,
  name: string,
  message: string,
  target: string,
): Promise<string[]> {
  return invoke("create_tag", { repo, name, message, target });
}

export function deleteTag(repo: string, name: string): Promise<string[]> {
  return invoke("delete_tag", { repo, name });
}

export function mergeBranch(repo: string, name: string): Promise<string> {
  return invoke("merge_branch", { repo, name });
}

export function rebaseOnto(repo: string, onto: string): Promise<string> {
  return invoke("rebase_onto", { repo, onto });
}

export function conflictState(repo: string): Promise<ConflictState> {
  return invoke("conflict_state", { repo });
}

export function conflictContent(repo: string, path: string): Promise<string> {
  return invoke("conflict_content", { repo, path });
}

export function resolveOurs(repo: string, path: string): Promise<ConflictState> {
  return invoke("resolve_ours", { repo, path });
}

export function resolveTheirs(repo: string, path: string): Promise<ConflictState> {
  return invoke("resolve_theirs", { repo, path });
}

export function markResolved(repo: string, path: string): Promise<ConflictState> {
  return invoke("mark_resolved", { repo, path });
}

export function abortOperation(repo: string): Promise<ConflictState> {
  return invoke("abort_operation", { repo });
}

export function continueOperation(repo: string): Promise<ConflictState> {
  return invoke("continue_operation", { repo });
}

export function listRemotes(repo: string): Promise<Remote[]> {
  return invoke("list_remotes", { repo });
}

export function addRemote(repo: string, name: string, url: string): Promise<Remote[]> {
  return invoke("add_remote", { repo, name, url });
}

export function removeRemote(repo: string, name: string): Promise<Remote[]> {
  return invoke("remove_remote", { repo, name });
}

export function renameRemote(repo: string, oldName: string, newName: string): Promise<Remote[]> {
  return invoke("rename_remote", { repo, old: oldName, new: newName });
}

export function generateCommitMessage(repo: string): Promise<string> {
  return invoke("generate_commit_message", { repo });
}
