import { useEffect } from "react";
import { useStore } from "@/shared/store";
import type { FileStatus } from "@/shared/types";

interface NavItem {
  path: string;
  staged: boolean;
  untracked: boolean;
}

function orderedFiles(files: FileStatus[]): NavItem[] {
  const staged = files.filter((f) => f.indexStatus !== " " && f.indexStatus !== "?");
  const untracked = files.filter((f) => f.indexStatus === "?");
  const unstaged = files.filter((f) => f.indexStatus !== "?" && f.worktreeStatus !== " ");
  return [
    ...unstaged.map((f) => ({ path: f.path, staged: false, untracked: false })),
    ...untracked.map((f) => ({ path: f.path, staged: false, untracked: true })),
    ...staged.map((f) => ({ path: f.path, staged: true, untracked: false })),
  ];
}

export function useFileNavigation() {
  useEffect(() => {
    async function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Enter") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const { status, selectedPath, selectFile } = useStore.getState();
      const items = orderedFiles(status?.files ?? []);
      if (items.length === 0) return;

      const current = items.findIndex((i) => i.path === selectedPath);

      if (e.key === "Enter") {
        e.preventDefault();
        if (current === -1) return;

        const item = items[current];
        const nextPath = items[current + 1]?.path ?? items[current - 1]?.path;

        const { stageFile, unstageFile } = useStore.getState();
        if (item.staged) await unstageFile(item.path);
        else await stageFile(item.path);

        const next = useStore.getState();
        const newItems = orderedFiles(next.status?.files ?? []);
        const focus = newItems.find((i) => i.path === (nextPath ?? item.path));
        if (focus) next.selectFile(focus.path, focus.staged, focus.untracked);
        return;
      }

      e.preventDefault();

      let next: number;
      if (current === -1) {
        next = e.key === "ArrowDown" ? 0 : items.length - 1;
      } else {
        const delta = e.key === "ArrowDown" ? 1 : -1;
        next = Math.min(items.length - 1, Math.max(0, current + delta));
      }

      const item = items[next];
      if (item && item.path !== selectedPath) {
        selectFile(item.path, item.staged, item.untracked);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
