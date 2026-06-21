import { call } from "@/shared/api/client";
import type { Stash } from "@/shared/types";

export function listStashes(repo: string): Promise<Stash[]> {
  return call("list_stashes", { repo });
}

export function saveStash(repo: string, message: string): Promise<Stash[]> {
  return call("save_stash", { repo, message });
}

export function applyStash(repo: string, reference: string): Promise<Stash[]> {
  return call("apply_stash", { repo, reference });
}

export function popStash(repo: string, reference: string): Promise<Stash[]> {
  return call("pop_stash", { repo, reference });
}

export function dropStash(repo: string, reference: string): Promise<Stash[]> {
  return call("drop_stash", { repo, reference });
}
