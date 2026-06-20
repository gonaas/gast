import { useState } from "react";
import { useStore } from "../store";
import { Button, IconButton, Input } from "../ui";

export function StashPanel() {
  const { stashes, status, saveStash, applyStash, dropStash } = useStore();
  const [message, setMessage] = useState("");

  const hasChanges = (status?.files.length ?? 0) > 0;

  async function doSave() {
    await saveStash(message);
    setMessage("");
  }

  return (
    <section className="panel stashes">
      <div className="panel-head">
        <h3>Stash ({stashes.length})</h3>
      </div>

      <div className="stash-form">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensaje (opcional)"
        />
        <Button size="sm" disabled={!hasChanges} onClick={doSave} title="Guardar cambios en stash">
          Stash
        </Button>
      </div>

      <ul>
        {stashes.map((s) => (
          <li key={s.reference} className="stash">
            <span className="stash-msg" title={s.message}>
              <code>{s.reference}</code> {s.message}
            </span>
            <span className="stash-actions">
              <IconButton size="sm" title="Aplicar" onClick={() => applyStash(s.reference, false)}>
                ↧
              </IconButton>
              <IconButton size="sm" title="Pop (aplicar y borrar)" onClick={() => applyStash(s.reference, true)}>
                ↥
              </IconButton>
              <IconButton size="sm" variant="danger" title="Descartar" onClick={() => dropStash(s.reference)}>
                🗑
              </IconButton>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
