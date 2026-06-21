import { call } from "@/shared/api/client";

export function generateCommitMessage(repo: string): Promise<string> {
  return call("generate_commit_message", { repo });
}
