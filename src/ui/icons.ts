// Iconos del design system. El resto de la app NUNCA importa de "lucide-react"
// directamente: tira de aquí con nombres semánticos. Cambiar el set (o un icono
// concreto) es un solo punto de edición.
//
// El dimensionado y color se controlan por CSS: todo <svg class="lucide"> hereda
// width/height: 1em y stroke: currentColor desde su contenedor (ver ui.css).
export {
  FolderOpen as IconOpenRepo,
  ArrowDownToLine as IconFetch,
  Download as IconPull,
  Upload as IconPush,
  Archive as IconStash,
  ExternalLink as IconOpenIn,
  RefreshCw as IconRefresh,
  X as IconClose,
  Plus as IconAdd,
  Minus as IconUnstage,
  Undo2 as IconDiscard,
  Tag as IconTag,
  Cloud as IconRemote,
  Trash2 as IconDelete,
  ArrowRightLeft as IconCheckout,
  GitMerge as IconMerge,
  Spline as IconRebase,
  ChevronDown as IconChevronDown,
  ChevronRight as IconChevronRight,
  FolderGit2 as IconWorktree,
  GitCommitHorizontal as IconHistory,
  FileDiff as IconChanges,
  Check as IconClean,
  ArrowDownToLine as IconStashApply,
  ArrowUpFromLine as IconStashPop,
} from "lucide-react";
