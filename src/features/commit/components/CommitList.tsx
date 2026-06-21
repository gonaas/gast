import { useStore } from "@/shared/store";
import type { Commit, CommitRef } from "@/shared/types";
import { CommitGraph, graphWidth, ROW_H } from "./CommitGraph";
import { Avatar, IconCheck, IconRemote, IconBranch, IconTag } from "@/shared/ui";

export function CommitList() {
  const commits = useStore((s) => s.commits);
  const graph = useStore((s) => s.graph);
  const selectedCommit = useStore((s) => s.selectedCommit);
  const selectCommit = useStore((s) => s.selectCommit);

  const gutter = graphWidth(graph) + 12;

  return (
    <div className="commits">
      <div className="commits-head">Historial ({commits.length})</div>
      <div className="commits-body" style={{ position: "relative" }}>
        <div className="graph-gutter" style={{ width: gutter }}>
          <CommitGraph rows={graph} />
        </div>
        <ul style={{ paddingLeft: gutter }}>
          {commits.map((c) => (
            <CommitRow
              key={c.hash}
              commit={c}
              selected={selectedCommit === c.hash}
              onSelect={() => selectCommit(c.hash)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function CommitRow({
  commit,
  selected,
  onSelect,
}: {
  commit: Commit;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li
      className={selected ? "commit selected" : "commit"}
      style={{ height: ROW_H }}
      onClick={onSelect}
    >
      <div className="commit-subject">
        {commit.refs.map((r) => (
          <RefPill key={`${r.kind}:${r.name}`} refItem={r} />
        ))}
        <span className="subject">{commit.subject}</span>
      </div>
      <div className="commit-author">
        <Avatar name={commit.authorName} seed={commit.authorEmail} size={20} />
        <span className="author-name">{commit.authorName}</span>
      </div>
      <code className="hash">{commit.shortHash}</code>
      <span className="date" title={new Date(commit.timestamp * 1000).toLocaleString()}>
        {formatRelative(commit.timestamp)}
      </span>
    </li>
  );
}

// Renderiza una ref ya clasificada por el backend (ver RefKind en Rust).
// El icono, color y título salen del `kind`; no se parsea ningún string.
function RefPill({ refItem: { kind, name } }: { refItem: CommitRef }) {
  switch (kind) {
    case "tag":
      return (
        <span className="ref-pill ref-tag" title={`tag ${name}`}>
          <IconTag /> {name}
        </span>
      );
    case "current":
      return (
        <span className="ref-pill ref-current" title="rama actual">
          <IconCheck /> {name}
        </span>
      );
    case "remote":
      return (
        <span className="ref-pill ref-remote" title={`remoto ${name}`}>
          <IconRemote /> {name}
        </span>
      );
    case "local":
      return (
        <span className="ref-pill ref-local" title={`rama ${name}`}>
          <IconBranch /> {name}
        </span>
      );
  }
}

function formatRelative(epochSeconds: number): string {
  const d = new Date(epochSeconds * 1000);
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(d)) / 86_400_000);

  if (days === 0) return `Hoy a las ${time}`;
  if (days === 1) return `Ayer a las ${time}`;
  if (days < 7) return `Hace ${days} días`;

  const date = d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
  return `${date}`;
}
