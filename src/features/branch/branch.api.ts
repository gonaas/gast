import { call } from "@/shared/api/client";
import type { Branch } from "@/shared/types";

export function listBranches(repo: string): Promise<Branch[]> {
  return call("list_branches", { repo });
}

export function checkoutBranch(repo: string, name: string): Promise<Branch[]> {
  return call("checkout_branch", { repo, name });
}

export function createBranch(repo: string, name: string, start: string): Promise<Branch[]> {
  return call("create_branch", { repo, name, start });
}

export function deleteBranch(repo: string, name: string, force: boolean): Promise<Branch[]> {
  return call("delete_branch", { repo, name, force });
}

export function renameBranch(repo: string, oldName: string, newName: string): Promise<Branch[]> {
  return call("rename_branch", { repo, old: oldName, new: newName });
}
