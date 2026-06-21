import { call } from "@/shared/api/client";

export function listTags(repo: string): Promise<string[]> {
  return call("list_tags", { repo });
}

export function createTag(
  repo: string,
  name: string,
  message: string,
  target: string,
): Promise<string[]> {
  return call("create_tag", { repo, name, message, target });
}

export function deleteTag(repo: string, name: string): Promise<string[]> {
  return call("delete_tag", { repo, name });
}
