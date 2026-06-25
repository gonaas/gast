// Iconos del design system. El resto de la app NUNCA importa de "lucide-react"
// directamente: tira de aquí (vía el barril "../ui") con nombres semánticos.
// Cambiar el set o un icono concreto es un único punto de edición.
//
// El tamaño y el color se controlan por CSS: todo <svg class="lucide"> hereda
// width/height: 1em y stroke: currentColor de su contenedor (ver ui.css). Para
// reescalar un icono se ajusta el font-size del contenedor, no un prop `size`.
export {
  // -- Toolbar / acciones --
  FolderOpen as IconOpenRepo,
  ArrowDownToLine as IconFetch,
  Download as IconPull,
  Upload as IconPush,
  Archive as IconStash,
  ExternalLink as IconOpenIn,
  RefreshCw as IconRefresh,
  // -- Acciones genéricas --
  X as IconClose,
  Plus as IconAdd,
  Minus as IconRemove,
  Undo2 as IconDiscard,
  Trash2 as IconDelete,
  Check as IconCheck,
  Brush as IconSweep,
  TriangleAlert as IconWarning,
  ChevronDown as IconChevronDown,
  ChevronRight as IconChevronRight,
  // -- Git / estructura --
  GitBranch as IconBranch,
  GitMerge as IconMerge,
  Spline as IconRebase,
  ArrowRightLeft as IconCheckout,
  Tag as IconTag,
  Cloud as IconRemote,
  Folder as IconFolder,
  FolderOpen as IconFolderOpen,
  FolderGit2 as IconWorktree,
  GitCommitHorizontal as IconHistory,
  FileDiff as IconChanges,
  GitCompare as IconCompare,
  // -- Worktree: destinos de apertura --
  Code2 as IconEditor,
  Terminal as IconTerminal,
  // -- Stash --
  ArrowDownToLine as IconStashApply,
  ArrowUpFromLine as IconStashPop,
} from "lucide-react";
