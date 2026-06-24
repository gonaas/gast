import { useState } from "react";
import { useStore } from "@/shared/store";
import { Button, Textarea } from "@/shared/ui";

// Caja de commit anclada al fondo de la columna de cambios (estilo Fork):
// mensaje + generación con IA + botón Commit.
export function CommitBox() {
  const { status, commit, generateCommitMessage } = useStore();
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

  return (
    <div className="commit-box">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mensaje del commit…"
        rows={3}
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
