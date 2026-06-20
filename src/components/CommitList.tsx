import { useStore } from "../store";
import type { Commit } from "../types";
import { CommitGraph, graphWidth, ROW_H } from "./CommitGraph";
import { Badge } from "../ui";

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
      <div className="commit-main">
        {commit.refs.map((r) => (
          <Badge key={r} variant={r.startsWith("tag:") ? "warn" : "accent"}>
            {r.replace(/^tag:\s*/, "")}
          </Badge>
        ))}
        <span className="subject">{commit.subject}</span>
      </div>
      <div className="commit-meta">
        <code className="hash">{commit.shortHash}</code>
        <span className="author">{commit.authorName}</span>
        <span className="date">{formatDate(commit.timestamp)}</span>
      </div>
    </li>
  );
}

function formatDate(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toLocaleString();
}
