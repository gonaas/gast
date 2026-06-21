import { call } from "@/shared/api/client";
import type { Remote } from "@/shared/types";

// Debe casar con el enum serde camelCase de Rust (remote/model.rs::PullStrategy).
export type PullStrategy = "merge" | "rebase" | "ffOnly";

export function listRemotes(repo: string): Promise<Remote[]> {
  return call("list_remotes", { repo });
}

export function addRemote(repo: string, name: string, url: string): Promise<Remote[]> {
  return call("add_remote", { repo, name, url });
}

export function removeRemote(repo: string, name: string): Promise<Remote[]> {
  return call("remove_remote", { repo, name });
}

export function renameRemote(repo: string, oldName: string, newName: string): Promise<Remote[]> {
  return call("rename_remote", { repo, old: oldName, new: newName });
}

export function fetch(repo: string): Promise<string> {
  return call("fetch", { repo });
}

export function pull(repo: string, strategy: PullStrategy): Promise<string> {
  return call("pull", { repo, strategy });
}

export function push(repo: string): Promise<string> {
  return call("push", { repo });
}
