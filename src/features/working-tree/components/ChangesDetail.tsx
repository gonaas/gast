import { useState } from "react";
import { useStore } from "@/shared/store";
import { Button, Textarea } from "@/shared/ui";
import { DiffView } from "@/shared/components/DiffView";
import { FileRow } from "@/shared/components/FileRow";

type DetailTab = "commit" | "changes" | "filetree";

export function ChangesDetail({ tab }: { tab: DetailTab }) {
  const { status, selectedPath, selectFile, commit, generateCommitMessage } = useStore();
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);

  const staged = (status?.files ?? []).filter(
    (f) => f.indexStatus !== " " && f.indexStatus !== "?",
  );

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
          <Button variant="primary" disabled={!message.trim() || staged.length === 0} onClick={doCommit}>
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
            onSelect={() =>
              selectFile(f.path, f.indexStatus !== " " && f.indexStatus !== "?", f.indexStatus === "?")
            }
          />
        ))}
      </ul>
    );
  }

  return selectedPath ? <DiffView /> : <Placeholder text="Selecciona un archivo para ver su diff." />;
}

function Placeholder({ text }: { text: string }) {
  return <p className="detail-placeholder">{text}</p>;
}
