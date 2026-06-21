import { call } from "@/shared/api/client";
import type { Repo, RecentRepo } from "@/shared/types";

export function openRepo(path: string): Promise<Repo> {
  return call("open_repo", { path });
}

export function recentRepos(): Promise<RecentRepo[]> {
  return call("recent_repos", {});
}

export function forgetRecentRepo(path: string): Promise<RecentRepo[]> {
  return call("forget_recent_repo", { path });
}
