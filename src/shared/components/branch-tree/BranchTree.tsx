import { useState } from "react";
import { useStore } from "@/shared/store";
import type { Branch } from "@/shared/types";
import type { BranchNode } from "@/shared/lib/branchTree";
import {
  ContextMenu,
  IconChevronDown,
  IconChevronRight,
  IconFolder,
  IconFolderOpen,
  IconWorktree,
  IconBranch,
  IconCheck,
  IconCheckout,
  IconMerge,
  IconRebase,
  IconDelete,
  IconWarning,
} from "@/shared/ui";

interface BranchTreeProps {
  node: BranchNode;
  depth: number;
  readOnly?: boolean;
  onCheckout?: (b: Branch) => void;
  onDelete?: (b: Branch) => void;
  onMerge?: (b: Branch) => void;
  onRebase?: (b: Branch) => void;
}

export function BranchTree({
  node,
  depth,
  readOnly = false,
  onCheckout,
  onDelete,
  onMerge,
  onRebase,
}: BranchTreeProps) {
  return (
    <ul className="branch-tree">
      {node.folders.map((folder) => (
        <FolderNode
          key={folder.path}
          node={folder}
          depth={depth}
          readOnly={readOnly}
          onCheckout={onCheckout}
          onDelete={onDelete}
          onMerge={onMerge}
          onRebase={onRebase}
        />
      ))}
      {node.leaves.map((b) => (
        <BranchRow
          key={b.name}
          branch={b}
          depth={depth}
          readOnly={readOnly}
          leafName={leafName(b.name)}
          onCheckout={() => onCheckout?.(b)}
          onDelete={() => onDelete?.(b)}
          onMerge={() => onMerge?.(b)}
          onRebase={() => onRebase?.(b)}
        />
      ))}
    </ul>
  );
}

function FolderNode({
  node,
  depth,
  readOnly,
  onCheckout,
  onDelete,
  onMerge,
  onRebase,
}: {
  node: BranchNode;
  depth: number;
  readOnly?: boolean;
  onCheckout?: (b: Branch) => void;
  onDelete?: (b: Branch) => void;
  onMerge?: (b: Branch) => void;
  onRebase?: (b: Branch) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <li className="branch-folder">
      <div
        className="branch-folder-head"
        style={{ paddingLeft: 12 + depth * 14 }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="tree-caret">
          {open ? <IconChevronDown /> : <IconChevronRight />}
        </span>
        <span className="folder-icon">
          {open ? <IconFolderOpen /> : <IconFolder />}
        </span>
        <span className="folder-name">{node.name}</span>
      </div>
      {open && (
        <BranchTree
          node={node}
          depth={depth + 1}
          readOnly={readOnly}
          onCheckout={onCheckout}
          onDelete={onDelete}
          onMerge={onMerge}
          onRebase={onRebase}
        />
      )}
    </li>
  );
}

function BranchRow({
  branch,
  depth,
  leafName,
  readOnly,
  onCheckout,
  onDelete,
  onMerge,
  onRebase,
}: {
  branch: Branch;
  depth: number;
  leafName: string;
  readOnly?: boolean;
  onCheckout: () => void;
  onDelete: () => void;
  onMerge: () => void;
  onRebase: () => void;
}) {
  const worktrees = useStore((s) => s.worktrees);
  const selectedBranch = useStore((s) => s.selectedBranch);
  const selectBranch = useStore((s) => s.selectBranch);
  const inWorktree = !branch.isHead && worktrees.some((w) => w.branch === branch.name);
  const selected = !readOnly && selectedBranch === branch.name;

  const title = readOnly
    ? branch.name
    : inWorktree
      ? "Doble clic para abrir su worktree · clic derecho para opciones"
      : "Doble clic para checkout · clic derecho para opciones";

  const className = ["branch", branch.isHead ? "head" : "", selected ? "selected" : ""]
    .filter(Boolean)
    .join(" ");

  const row = (
    <li
      className={className}
      style={{ paddingLeft: 12 + depth * 14 }}
      onClick={readOnly ? undefined : () => selectBranch(branch.name)}
      onDoubleClick={readOnly ? undefined : onCheckout}
      title={title}
    >
      <span className="branch-icon">
        {branch.isHead ? <IconCheck /> : inWorktree ? <IconWorktree /> : <IconBranch />}
      </span>
      <span className="branch-name">{leafName}</span>
      {branch.behind ? (
        <span className="track behind" title={`${branch.behind} commits por detrás (pull)`}>
          ↓{branch.behind}
        </span>
      ) : null}
      {branch.ahead ? (
        <span className="track ahead" title={`${branch.ahead} commits por delante (push)`}>
          ↑{branch.ahead}
        </span>
      ) : null}
      {branch.gone && (
        <span className="track gone" title="el upstream fue borrado">
          <IconWarning />
        </span>
      )}
    </li>
  );

  if (readOnly || branch.isHead) return row;

  return (
    <ContextMenu>
      <ContextMenu.Trigger>{row}</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item onSelect={onCheckout}>
          {inWorktree ? (
            <>
              <IconFolderOpen /> Abrir worktree
            </>
          ) : (
            <>
              <IconCheckout /> Checkout
            </>
          )}
        </ContextMenu.Item>
        <ContextMenu.Item onSelect={onMerge}>
          <IconMerge /> Fusionar en la rama actual
        </ContextMenu.Item>
        <ContextMenu.Item onSelect={onRebase}>
          <IconRebase /> Rebase de la actual sobre esta
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item variant="danger" onSelect={onDelete}>
          <IconDelete /> Borrar rama
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
}

function leafName(full: string): string {
  const parts = full.split("/");
  return parts[parts.length - 1];
}
