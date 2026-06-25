import { create } from "zustand";
import { createRepoSlice, type RepoSlice } from "@/features/repo/repo.slice";
import { createCommitSlice, type CommitSlice } from "@/features/commit/commit.slice";
import {
  createWorkingTreeSlice,
  type WorkingTreeSlice,
} from "@/features/working-tree/working-tree.slice";
import { createDiffSlice, type DiffSlice } from "./diff.slice";
import { createBranchSlice, type BranchSlice } from "@/features/branch/branch.slice";
import { createTagSlice, type TagSlice } from "@/features/tag/tag.slice";
import { createRemoteSlice, type RemoteSlice } from "@/features/remote/remote.slice";
import { createStashSlice, type StashSlice } from "@/features/stash/stash.slice";
import { createWorktreeSlice, type WorktreeSlice } from "@/features/worktree/worktree.slice";
import {
  createIntegrationSlice,
  type IntegrationSlice,
} from "@/features/integration/integration.slice";
import { createSystemSlice, type SystemSlice } from "@/features/system/system.slice";
import { createAssistantSlice, type AssistantSlice } from "@/features/assistant/assistant.slice";
import { createCompareSlice, type CompareSlice } from "@/features/compare/compare.slice";
import { createUiSlice, type UiSlice } from "./ui.slice";

export type Store = RepoSlice &
  CommitSlice &
  WorkingTreeSlice &
  DiffSlice &
  BranchSlice &
  TagSlice &
  RemoteSlice &
  StashSlice &
  WorktreeSlice &
  IntegrationSlice &
  SystemSlice &
  AssistantSlice &
  CompareSlice &
  UiSlice;

export const useStore = create<Store>()((...a) => ({
  ...createRepoSlice(...a),
  ...createCommitSlice(...a),
  ...createWorkingTreeSlice(...a),
  ...createDiffSlice(...a),
  ...createBranchSlice(...a),
  ...createTagSlice(...a),
  ...createRemoteSlice(...a),
  ...createStashSlice(...a),
  ...createWorktreeSlice(...a),
  ...createIntegrationSlice(...a),
  ...createSystemSlice(...a),
  ...createAssistantSlice(...a),
  ...createCompareSlice(...a),
  ...createUiSlice(...a),
}));
