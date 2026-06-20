import { create } from "zustand";
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
} from "./types";
import * as api from "./api/git";

interface State {
  repo: Repo | null;
  recentRepos: RecentRepo[];
  commits: Commit[];
  graph: GraphRow[];
  tags: string[];
  branches: Branch[];
  worktrees: Worktree[];
  stashes: Stash[];
  remotes: Remote[];
  conflict: ConflictState | null;
  status: RepoStatus | null;
  loading: boolean;
  error: string | null;

  view: "changes" | "history";

  // Rama resaltada en el sidebar (selección visual, independiente de HEAD).
  selectedBranch: string | null;
  selectBranch: (name: string) => void;

  // Diff seleccionado
  selectedPath: string | null;
  diffText: string;

  // Commit seleccionado en el historial y sus archivos (panel inferior).
  selectedCommit: string | null;
  commitFiles: FileStatus[];

  openRepo: (path: string) => Promise<void>;
  loadRecentRepos: () => Promise<void>;
  forgetRecentRepo: (path: string) => Promise<void>;
  refresh: () => Promise<void>;
  setView: (view: "changes" | "history") => void;
  selectCommit: (hash: string) => Promise<void>;
  addWorktree: (path: string, branch: string, newBranch: boolean, start: string) => Promise<void>;
  removeWorktree: (path: string, force: boolean) => Promise<void>;
  clearError: () => void;

  // Fase 2
  selectFile: (path: string, staged: boolean, untracked: boolean) => Promise<void>;
  selectCommitFile: (path: string) => Promise<void>;
  stageFile: (path: string) => Promise<void>;
  unstageFile: (path: string) => Promise<void>;
  discardFile: (path: string) => Promise<void>;
  commit: (message: string, amend: boolean) => Promise<void>;
  generateCommitMessage: () => Promise<string>;
  remoteOp: (op: "fetch" | "pull" | "push", strategy?: api.PullStrategy) => Promise<void>;

  // Ramas
  checkoutBranch: (name: string) => Promise<void>;
  createBranch: (name: string, start: string) => Promise<void>;
  deleteBranch: (name: string, force: boolean) => Promise<void>;
  renameBranch: (oldName: string, newName: string) => Promise<void>;

  // Stash
  saveStash: (message: string) => Promise<void>;
  applyStash: (reference: string, pop: boolean) => Promise<void>;
  dropStash: (reference: string) => Promise<void>;

  // Worktrees de lujo
  pruneWorktrees: () => Promise<void>;
  openWorktree: (path: string, target: api.OpenTarget) => Promise<void>;

  // Fase 3: tags y merge/rebase
  createTag: (name: string, message: string, target: string) => Promise<void>;
  deleteTag: (name: string) => Promise<void>;
  mergeBranch: (name: string) => Promise<void>;
  rebaseOnto: (onto: string) => Promise<void>;

  // Conflictos
  selectConflict: (path: string) => Promise<void>;
  resolveConflict: (path: string, side: "ours" | "theirs" | "resolved") => Promise<void>;
  abortOperation: () => Promise<void>;
  continueOperation: () => Promise<void>;

  // Remotes
  addRemote: (name: string, url: string) => Promise<void>;
  removeRemote: (name: string) => Promise<void>;
}

// Compara rutas de worktree ignorando la barra final. Suficiente para distinguir
// el worktree actual del resto sin meter normalización de SO en el frontend.
function samePath(a: string, b: string): boolean {
  return a.replace(/\/+$/, "") === b.replace(/\/+$/, "");
}

export const useStore = create<State>((set, get) => ({
  repo: null,
  recentRepos: [],
  commits: [],
  graph: [],
  tags: [],
  branches: [],
  worktrees: [],
  stashes: [],
  remotes: [],
  conflict: null,
  status: null,
  loading: false,
  error: null,
  view: "history",
  selectedBranch: null,
  selectedPath: null,
  diffText: "",
  selectedCommit: null,
  commitFiles: [],

  clearError: () => set({ error: null }),

  selectBranch: (name) => set({ selectedBranch: name }),

  setView: (view) => set({ view, selectedPath: null, diffText: "" }),

  selectCommit: async (hash) => {
    const repo = get().repo;
    if (!repo) return;
    set({ selectedCommit: hash, selectedPath: null, diffText: "", error: null });
    try {
      const commitFiles = await api.commitFiles(repo.path, hash);
      set({ commitFiles });
    } catch (e) {
      set({ error: String(e), commitFiles: [] });
    }
  },

  openRepo: async (path) => {
    set({ loading: true, error: null });
    try {
      const repo = await api.openRepo(path);
      set({ repo });
      await get().refresh();
      // El backend ya registró el repo al abrirlo; refrescamos la lista local.
      set({ recentRepos: await api.recentRepos() });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  loadRecentRepos: async () => {
    try {
      set({ recentRepos: await api.recentRepos() });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  forgetRecentRepo: async (path) => {
    try {
      set({ recentRepos: await api.forgetRecentRepo(path) });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  refresh: async () => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      const [commits, graph, tags, branches, worktrees, stashes, remotes, conflict, status] =
        await Promise.all([
          api.commitLog(repo.path),
          api.commitGraph(repo.path),
          api.listTags(repo.path),
          api.listBranches(repo.path),
          api.listWorktrees(repo.path),
          api.listStashes(repo.path),
          api.listRemotes(repo.path),
          api.conflictState(repo.path),
          api.repoStatus(repo.path),
        ]);
      set({ commits, graph, tags, branches, worktrees, stashes, remotes, conflict, status });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  addWorktree: async (path, branch, newBranch, start) => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      const worktrees = await api.addWorktree(repo.path, path, branch, newBranch, start);
      set({ worktrees });
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  removeWorktree: async (path, force) => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      const worktrees = await api.removeWorktree(repo.path, path, force);
      set({ worktrees });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  selectFile: async (path, staged, untracked) => {
    const repo = get().repo;
    if (!repo) return;
    set({ selectedPath: path, error: null });
    try {
      const diffText = untracked
        ? await api.untrackedDiff(repo.path, path)
        : await api.fileDiff(repo.path, path, staged);
      set({ diffText });
    } catch (e) {
      set({ error: String(e), diffText: "" });
    }
  },

  selectCommitFile: async (path) => {
    const { repo, selectedCommit } = get();
    if (!repo || !selectedCommit) return;
    set({ selectedPath: path, error: null });
    try {
      const diffText = await api.commitDiff(repo.path, selectedCommit, path);
      set({ diffText });
    } catch (e) {
      set({ error: String(e), diffText: "" });
    }
  },

  stageFile: async (path) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ status: await api.stageFile(repo.path, path) });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  unstageFile: async (path) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ status: await api.unstageFile(repo.path, path) });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  discardFile: async (path) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ status: await api.discardFile(repo.path, path), diffText: "" });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  commit: async (message, amend) => {
    const repo = get().repo;
    if (!repo || !message.trim()) return;
    set({ loading: true, error: null });
    try {
      await api.commit(repo.path, message, amend);
      set({ selectedPath: null, diffText: "" });
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  // Genera un mensaje de commit con el CLI `claude` a partir del diff staged.
  // Devuelve el texto para que el componente lo coloque en el textarea.
  generateCommitMessage: async () => {
    const repo = get().repo;
    if (!repo) return "";
    try {
      return await api.generateCommitMessage(repo.path);
    } catch (e) {
      set({ error: String(e) });
      return "";
    }
  },

  remoteOp: async (op, strategy) => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      if (op === "fetch") await api.fetch(repo.path);
      else if (op === "pull") await api.pull(repo.path, strategy ?? "ffOnly");
      else await api.push(repo.path);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  checkoutBranch: async (name) => {
    const { repo, worktrees } = get();
    if (!repo) return;
    // Git no permite hacer checkout de una rama que ya está ocupada por otro
    // worktree. En vez de propagar el error, navegamos a ese worktree: "ir a
    // la rama" abre su worktree, que es donde realmente vive.
    const wt = worktrees.find((w) => w.branch === name && !samePath(w.path, repo.path));
    if (wt) {
      await get().openRepo(wt.path);
      return;
    }
    set({ loading: true, error: null });
    try {
      await api.checkoutBranch(repo.path, name);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  createBranch: async (name, start) => {
    const repo = get().repo;
    if (!repo || !name.trim()) return;
    set({ loading: true, error: null });
    try {
      await api.createBranch(repo.path, name, start);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  deleteBranch: async (name, force) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ branches: await api.deleteBranch(repo.path, name, force) });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  renameBranch: async (oldName, newName) => {
    const repo = get().repo;
    if (!repo || !newName.trim()) return;
    try {
      set({ branches: await api.renameBranch(repo.path, oldName, newName) });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  saveStash: async (message) => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      await api.saveStash(repo.path, message);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  applyStash: async (reference, pop) => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      if (pop) await api.popStash(repo.path, reference);
      else await api.applyStash(repo.path, reference);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  dropStash: async (reference) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ stashes: await api.dropStash(repo.path, reference) });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  pruneWorktrees: async () => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ worktrees: await api.pruneWorktrees(repo.path) });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  openWorktree: async (path, target) => {
    try {
      await api.openPath(path, target);
    } catch (e) {
      set({ error: String(e) });
    }
  },

  createTag: async (name, message, target) => {
    const repo = get().repo;
    if (!repo || !name.trim()) return;
    try {
      set({ tags: await api.createTag(repo.path, name, message, target) });
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    }
  },

  deleteTag: async (name) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ tags: await api.deleteTag(repo.path, name) });
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    }
  },

  mergeBranch: async (name) => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      await api.mergeBranch(repo.path, name);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  rebaseOnto: async (onto) => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      await api.rebaseOnto(repo.path, onto);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  selectConflict: async (path) => {
    const repo = get().repo;
    if (!repo) return;
    set({ selectedPath: path, error: null });
    try {
      set({ diffText: await api.conflictContent(repo.path, path) });
    } catch (e) {
      set({ error: String(e), diffText: "" });
    }
  },

  resolveConflict: async (path, side) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      const fn =
        side === "ours" ? api.resolveOurs : side === "theirs" ? api.resolveTheirs : api.markResolved;
      const conflict = await fn(repo.path, path);
      set({ conflict, selectedPath: null, diffText: "" });
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    }
  },

  abortOperation: async () => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      set({ conflict: await api.abortOperation(repo.path) });
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  continueOperation: async () => {
    const repo = get().repo;
    if (!repo) return;
    set({ loading: true, error: null });
    try {
      set({ conflict: await api.continueOperation(repo.path) });
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  addRemote: async (name, url) => {
    const repo = get().repo;
    if (!repo || !name.trim() || !url.trim()) return;
    try {
      set({ remotes: await api.addRemote(repo.path, name, url) });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  removeRemote: async (name) => {
    const repo = get().repo;
    if (!repo) return;
    try {
      set({ remotes: await api.removeRemote(repo.path, name) });
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));
