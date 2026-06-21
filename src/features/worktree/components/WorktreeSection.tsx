import { useState } from "react";
import { useStore } from "@/shared/store";
import { CollapsibleSection, IconButton, IconClose, IconAdd, IconSweep } from "@/shared/ui";
import { WorktreePanel } from "./WorktreePanel";

export function WorktreeSection() {
  const worktrees = useStore((s) => s.worktrees);
  const pruneWorktrees = useStore((s) => s.pruneWorktrees);
  const [creatingWt, setCreatingWt] = useState(false);

  return (
    <CollapsibleSection
      title="Worktrees"
      count={worktrees.length}
      action={
        <>
          {worktrees.some((w) => w.prunable) && (
            <IconButton title="Limpiar worktrees obsoletos" onClick={pruneWorktrees}>
              <IconSweep />
            </IconButton>
          )}
          <IconButton title="Nuevo worktree" onClick={() => setCreatingWt((v) => !v)}>
            {creatingWt ? <IconClose /> : <IconAdd />}
          </IconButton>
        </>
      }
    >
      <WorktreePanel open={creatingWt} onClose={() => setCreatingWt(false)} />
    </CollapsibleSection>
  );
}
