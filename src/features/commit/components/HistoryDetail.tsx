import { useStore } from "@/shared/store";
import { DiffView } from "@/shared/components/DiffView";
import { FileRow } from "@/shared/components/FileRow";

type DetailTab = "commit" | "changes" | "filetree";

export function HistoryDetail({ tab }: { tab: DetailTab }) {
  const { commits, selectedCommit, commitFiles, selectedPath, selectCommitFile } = useStore();

  if (!selectedCommit) {
    return <Placeholder text="Selecciona un commit del historial." />;
  }

  const commit = commits.find((c) => c.hash === selectedCommit);

  if (tab === "commit") {
    return (
      <div className="commit-detail">
        {commit && (
          <>
            <div className="commit-detail-subject">{commit.subject}</div>
            <div className="commit-detail-meta">
              <code className="hash">{commit.shortHash}</code>
              <span>{commit.authorName}</span>
              <span>{commit.authorEmail}</span>
              <span>{new Date(commit.timestamp * 1000).toLocaleString()}</span>
            </div>
          </>
        )}
        <ul className="file-tree">
          {commitFiles.map((f) => (
            <FileRow
              key={f.path}
              file={f}
              selected={selectedPath === f.path}
              onSelect={() => selectCommitFile(f.path)}
            />
          ))}
        </ul>
      </div>
    );
  }

  if (tab === "filetree") {
    return (
      <ul className="file-tree">
        {commitFiles.map((f) => (
          <FileRow
            key={f.path}
            file={f}
            selected={selectedPath === f.path}
            onSelect={() => selectCommitFile(f.path)}
          />
        ))}
      </ul>
    );
  }

  return (
    <div className="detail-split">
      <ul className="detail-files">
        {commitFiles.map((f) => (
          <FileRow
            key={f.path}
            file={f}
            selected={selectedPath === f.path}
            onSelect={() => selectCommitFile(f.path)}
          />
        ))}
      </ul>
      <div className="detail-diff">
        {selectedPath ? <DiffView /> : <Placeholder text="Selecciona un archivo del commit." />}
      </div>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return <p className="detail-placeholder">{text}</p>;
}
