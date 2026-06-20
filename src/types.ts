// Tipos espejo de las structs serializadas en Rust (src-tauri/src/git).

export interface Repo {
  path: string;
  name: string;
  head: string | null;
}

export interface RecentRepo {
  path: string;
  name: string;
}

export interface Commit {
  hash: string;
  shortHash: string;
  parents: string[];
  authorName: string;
  authorEmail: string;
  timestamp: number; // epoch seconds
  subject: string;
  refs: string[];
}

export interface Branch {
  name: string;
  isHead: boolean;
  isRemote: boolean;
  upstream: string | null;
  target: string;
  ahead: number | null;
  behind: number | null;
  gone: boolean;
}

export interface FileStatus {
  path: string;
  indexStatus: string;
  worktreeStatus: string;
}

export interface RepoStatus {
  branch: string;
  files: FileStatus[];
}

export interface ConflictState {
  operation: string; // "merge" | "rebase" | "none"
  files: string[];
}

export interface Remote {
  name: string;
  url: string;
}

export interface GraphRow {
  hash: string;
  col: number;
  linksDown: [number, number][];
  merges: number[];
  width: number;
}

export interface Stash {
  reference: string;
  index: number;
  message: string;
}

export interface Worktree {
  path: string;
  head: string | null;
  branch: string | null;
  isBare: boolean;
  isDetached: boolean;
  locked: boolean;
  prunable: boolean;
}
