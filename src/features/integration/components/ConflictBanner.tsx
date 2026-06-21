import { useStore } from "@/shared/store";
import { Button } from "@/shared/ui";

export function ConflictBanner() {
  const { conflict, selectConflict, resolveConflict, abortOperation, continueOperation } =
    useStore();

  if (!conflict || conflict.operation === "none") return null;

  const { operation, files } = conflict;
  const allResolved = files.length === 0;

  return (
    <div className="conflict-banner">
      <div className="conflict-head">
        <strong>{operation === "merge" ? "Merge" : "Rebase"} en curso</strong>
        <span className="conflict-count">
          {allResolved ? "sin conflictos pendientes" : `${files.length} archivo(s) en conflicto`}
        </span>
        <span className="spacer" />
        <Button variant="primary" disabled={!allResolved} onClick={continueOperation}>
          Continuar
        </Button>
        <Button variant="danger" onClick={abortOperation}>
          Abortar
        </Button>
      </div>

      {files.length > 0 && (
        <ul className="conflict-files">
          {files.map((f) => (
            <li key={f}>
              <span className="conflict-path" onClick={() => selectConflict(f)} title="Ver con marcadores">
                {f}
              </span>
              <span className="conflict-actions">
                <Button size="sm" title="Quedarme con lo mío (HEAD)" onClick={() => resolveConflict(f, "ours")}>
                  Mío
                </Button>
                <Button size="sm" title="Quedarme con lo entrante" onClick={() => resolveConflict(f, "theirs")}>
                  Suyo
                </Button>
                <Button size="sm" title="Marcar como resuelto" onClick={() => resolveConflict(f, "resolved")}>
                  Resuelto
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
