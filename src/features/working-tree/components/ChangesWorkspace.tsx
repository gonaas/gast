import type { CSSProperties } from "react";
import { useStore } from "@/shared/store";
import { useResizable } from "@/shared/lib/useResizable";
import { ResizeHandle } from "@/shared/ui";
import { DiffView } from "@/shared/components/DiffView";
import { ChangesView } from "./ChangesView";
import { CommitBox } from "./CommitBox";
import { useFileNavigation } from "../useFileNavigation";

// Workspace de cambios estilo Fork: a la izquierda las cuadrículas de archivos
// (con la caja de commit anclada abajo), a la derecha el visor de diff.
export function ChangesWorkspace() {
  const selectedPath = useStore((s) => s.selectedPath);
  const split = useResizable({ key: "ast-git:changes-list-w", initial: 360, min: 240, max: 640 });

  useFileNavigation();

  return (
    <div
      className="changes-workspace"
      style={{ "--changes-list-w": `${split.width}px` } as CSSProperties}
    >
      <div className="changes-list-pane">
        <ChangesView />
        <CommitBox />
      </div>
      <ResizeHandle onPointerDown={split.onPointerDown} onDoubleClick={split.reset} />
      <div className="changes-diff-pane">
        {selectedPath ? (
          <DiffView />
        ) : (
          <p className="detail-placeholder">Selecciona un archivo para ver su diff.</p>
        )}
      </div>
    </div>
  );
}
