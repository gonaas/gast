import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FolderGit2,
  GitBranch,
  Check,
  Plus,
  X,
  Cloud,
  Tag,
  Trash2,
  GitMerge,
  Spline,
  ArrowRightLeft,
  FileDiff,
  GitCommitHorizontal,
  TriangleAlert,
  Brush,
} from "lucide-react";
import { useStore } from "../store";
import type { Branch } from "../types";
import { buildBranchTree } from "../lib/branchTree";
import type { BranchNode } from "../lib/branchTree";
import { CollapsibleSection } from "./CollapsibleSection";
import { WorktreePanel } from "./WorktreePanel";
import { Badge, Button, ContextMenu, IconButton, Input } from "../ui";

export function Sidebar() {
  const {
    repo,
    branches,
    tags,
    remotes,
    worktrees,
    pruneWorktrees,
    status,
    view,
    setView,
    checkoutBranch,
    createBranch,
    deleteBranch,
    mergeBranch,
    rebaseOnto,
    createTag,
    deleteTag,
    addRemote,
    removeRemote,
  } = useStore();

  const [filter, setFilter] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [tagging, setTagging] = useState(false);
  const [tagName, setTagName] = useState("");
  const [creatingWt, setCreatingWt] = useState(false);
  const [addingRemote, setAddingRemote] = useState(false);
  const [remoteName, setRemoteName] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");

  const q = filter.trim().toLowerCase();
  const match = (s: string) => s.toLowerCase().includes(q);

  const locals = branches.filter((b) => !b.isRemote && (!q || match(b.name)));
  const remoteBranches = branches.filter((b) => b.isRemote && (!q || match(b.name)));
  const shownTags = tags.filter((t) => !q || match(t));

  const localTree = buildBranchTree(locals);
  const changesCount = status?.files.length ?? 0;

  async function doCreate() {
    await createBranch(name, "");
    setName("");
    setCreating(false);
  }
  async function doTag() {
    await createTag(tagName, "", "");
    setTagName("");
    setTagging(false);
  }
  async function doAddRemote() {
    await addRemote(remoteName, remoteUrl);
    setRemoteName("");
    setRemoteUrl("");
    setAddingRemote(false);
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-repo">{repo?.name ?? "—"}</div>

      <ul className="view-items">
        <li
          className={view === "changes" ? "view-item active" : "view-item"}
          onClick={() => setView("changes")}
        >
          <span className="view-icon">◔</span>
          <span className="view-label">Local Changes</span>
          {changesCount > 0 && <Badge variant="accent">{changesCount}</Badge>}
        </li>
        <li
          className={view === "history" ? "view-item active" : "view-item"}
          onClick={() => setView("history")}
        >
          <span className="view-icon">≣</span>
          <span className="view-label">All Commits</span>
        </li>
      </ul>

      <div className="sidebar-filter">
        <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrar…" />
      </div>

      <CollapsibleSection
        title="Worktrees"
        count={worktrees.length}
        action={
          <>
            {worktrees.some((w) => w.prunable) && (
              <IconButton title="Limpiar worktrees obsoletos" onClick={pruneWorktrees}>
                🧹
              </IconButton>
            )}
            <IconButton title="Nuevo worktree" onClick={() => setCreatingWt((v) => !v)}>
              {creatingWt ? "×" : "+"}
            </IconButton>
          </>
        }
      >
        <WorktreePanel open={creatingWt} onClose={() => setCreatingWt(false)} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Branches"
        count={locals.length}
        action={
          <IconButton title="Crear rama" onClick={() => setCreating((v) => !v)}>
            {creating ? "×" : "+"}
          </IconButton>
        }
      >
        {creating && (
          <div className="branch-form">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doCreate()}
              placeholder="nombre-de-rama"
            />
            <Button variant="primary" size="sm" onClick={doCreate}>
              Crear
            </Button>
          </div>
        )}
        <BranchTreeView
          node={localTree}
          depth={0}
          onCheckout={(b) => checkoutBranch(b.name)}
          onDelete={(b) => deleteBranch(b.name, false)}
          onMerge={(b) => mergeBranch(b.name)}
          onRebase={(b) => rebaseOnto(b.name)}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Remotes"
        count={remotes.length}
        action={
          <IconButton title="Añadir remote" onClick={() => setAddingRemote((v) => !v)}>
            {addingRemote ? "×" : "+"}
          </IconButton>
        }
      >
        {addingRemote && (
          <div className="branch-form remote-form">
            <Input value={remoteName} onChange={(e) => setRemoteName(e.target.value)} placeholder="origin" />
            <Input value={remoteUrl} onChange={(e) => setRemoteUrl(e.target.value)} placeholder="https://…" />
            <Button variant="primary" size="sm" onClick={doAddRemote}>
              Añadir
            </Button>
          </div>
        )}
        {remotes.map((r) => {
          const tree = buildBranchTree(
            remoteBranches.filter((b) => b.name.startsWith(`${r.name}/`)),
            true,
          );
          return (
            <div key={r.name} className="remote-block">
              <ContextMenu>
                <ContextMenu.Trigger>
                  <div className="remote-head" title={`${r.url} · clic derecho para opciones`}>
                    <span className="branch-name">☁ {r.name}</span>
                  </div>
                </ContextMenu.Trigger>
                <ContextMenu.Content>
                  <ContextMenu.Item variant="danger" onSelect={() => removeRemote(r.name)}>
                    🗑 Eliminar remote
                  </ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu>
              <BranchTreeView node={tree} depth={1} readOnly />
            </div>
          );
        })}
      </CollapsibleSection>

      <CollapsibleSection
        title="Tags"
        count={tags.length}
        defaultOpen={false}
        action={
          <IconButton title="Crear tag en HEAD" onClick={() => setTagging((v) => !v)}>
            {tagging ? "×" : "+"}
          </IconButton>
        }
      >
        {tagging && (
          <div className="branch-form">
            <Input
              autoFocus
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doTag()}
              placeholder="v1.0.0"
            />
            <Button variant="primary" size="sm" onClick={doTag}>
              Crear
            </Button>
          </div>
        )}
        <ul>
          {shownTags.map((t) => (
            <ContextMenu key={t}>
              <ContextMenu.Trigger>
                <li className="branch tag-row" title="Clic derecho para opciones">
                  <span className="branch-name">🏷 {t}</span>
                </li>
              </ContextMenu.Trigger>
              <ContextMenu.Content>
                <ContextMenu.Item variant="danger" onSelect={() => deleteTag(t)}>
                  🗑 Borrar tag
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu>
          ))}
        </ul>
      </CollapsibleSection>
    </nav>
  );
}

// Render recursivo de un nodo de ramas: primero las subcarpetas plegables,
// luego las ramas hoja de este nivel.
function BranchTreeView({
  node,
  depth,
  readOnly = false,
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
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="folder-icon">
          {open ? <FolderOpen size={14} /> : <Folder size={14} />}
        </span>
        <span className="folder-name">{node.name}</span>
      </div>
      {open && (
        <BranchTreeView
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
  // ¿Esta rama vive en otro worktree? Entonces "checkout" navega a ese worktree
  // en vez de hacer un switch (que git rechazaría).
  const inWorktree = !branch.isHead && worktrees.some((w) => w.branch === branch.name);
  const selected = !readOnly && selectedBranch === branch.name;

  const title = readOnly
    ? branch.name
    : inWorktree
      ? "Doble clic para abrir su worktree · clic derecho para opciones"
      : "Doble clic para checkout · clic derecho para opciones";

  const className = [
    "branch",
    branch.isHead ? "head" : "",
    selected ? "selected" : "",
  ]
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
        {branch.isHead ? (
          <Check size={14} />
        ) : inWorktree ? (
          <FolderGit2 size={14} />
        ) : (
          <GitBranch size={14} />
        )}
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
          ⚠
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
          {inWorktree ? "📁 Abrir worktree" : "⇄ Checkout"}
        </ContextMenu.Item>
        <ContextMenu.Item onSelect={onMerge}>⛙ Fusionar en la rama actual</ContextMenu.Item>
        <ContextMenu.Item onSelect={onRebase}>⤵ Rebase de la actual sobre esta</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item variant="danger" onSelect={onDelete}>
          🗑 Borrar rama
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
}

function leafName(full: string): string {
  const parts = full.split("/");
  return parts[parts.length - 1];
}
