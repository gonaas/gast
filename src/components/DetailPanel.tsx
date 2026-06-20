import { useState } from "react";
import { useStore } from "../store";
import { DiffView } from "./DiffView";
import { FileRow } from "./ChangesView";
import { Button, Tabs, Textarea } from "../ui";

type Tab = "commit" | "changes" | "filetree";

// Panel inferior estilo Fork con pestañas Commit / Changes / File Tree.
// Su contenido depende de la vista activa: "changes" (working tree) muestra
// la caja de commit y el diff; "history" muestra el detalle del commit
// seleccionado (metadatos + archivos + diff).
export function DetailPanel() {
  const { view } = useStore();
  const [tab, setTab] = useState<Tab>("changes");

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
      <Tabs.List>
        <Tabs.Trigger value="commit">Commit</Tabs.Trigger>
        <Tabs.Trigger value="changes">Changes</Tabs.Trigger>
        <Tabs.Trigger value="filetree">File Tree</Tabs.Trigger>
      </Tabs.List>
      <div className="detail-body">
        {view === "changes" ? <ChangesDetail tab={tab} /> : <HistoryDetail tab={tab} />}
      </div>
    </Tabs>
  );
}

function ChangesDetail({ tab }: { tab: Tab }) {
  const { status, selectedPath, selectFile, commit, generateCommitMessage } = useStore();
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);

  const staged = (status?.files ?? []).filter((f) => f.indexStatus !== " " && f.indexStatus !== "?");

  async function doCommit() {
    await commit(message, false);
    setMessage("");
  }

  async function doGenerate() {
    setGenerating(true);
    try {
      const suggestion = await generateCommitMessage();
      if (suggestion) setMessage(suggestion);
    } finally {
      setGenerating(false);
    }
  }

  if (tab === "commit") {
    return (
      <div className="commit-box">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensaje del commit…"
          rows={4}
        />
        <div className="commit-actions">
          <Button
            size="sm"
            disabled={generating || staged.length === 0}
            onClick={doGenerate}
            title="Generar mensaje con IA (CLI claude) a partir del diff staged"
          >
            {generating ? "Generando…" : "✨ Generar"}
          </Button>
          <Button
            variant="primary"
            disabled={!message.trim() || staged.length === 0}
            onClick={doCommit}
          >
            Commit ({staged.length})
          </Button>
        </div>
      </div>
    );
  }

  if (tab === "filetree") {
    return (
      <ul className="file-tree">
        {(status?.files ?? []).map((f) => (
          <FileRow
            key={f.path}
            file={f}
            selected={selectedPath === f.path}
            onSelect={() => selectFile(f.path, f.indexStatus !== " " && f.indexStatus !== "?", f.indexStatus === "?")}
          />
        ))}
      </ul>
    );
  }

  // tab === "changes": diff del archivo seleccionado.
  return selectedPath ? <DiffView /> : <Placeholder text="Selecciona un archivo para ver su diff." />;
}

function HistoryDetail({ tab }: { tab: Tab }) {
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

  // tab === "changes": lista de archivos a la izquierda, diff a la derecha.
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
