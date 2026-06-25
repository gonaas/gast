import type { CSSProperties } from "react";
import { useStore } from "@/shared/store";
import { useResizable } from "@/shared/lib/useResizable";
import { ResizeHandle } from "@/shared/ui";
import { DiffView } from "@/shared/components/DiffView";
import { FileRow } from "@/shared/components/FileRow";

// Diff acumulado entre la rama actual y la seleccionada (3 puntos:
// actual...seleccionada). Mismo layout que los cambios locales / detalle de
// commit: lista de archivos commiteados a la izquierda, visor de diff a la derecha.
export function CompareWorkspace() {
  const compareBase = useStore((s) => s.compareBase);
  const compareTarget = useStore((s) => s.compareTarget);
  const compareFiles = useStore((s) => s.compareFiles);
  const selectedPath = useStore((s) => s.selectedPath);
  const selectCompareFile = useStore((s) => s.selectCompareFile);
  const split = useResizable({ key: "ast-git:compare-list-w", initial: 360, min: 240, max: 640 });

  return (
    <div
      className="changes-workspace"
      style={{ "--changes-list-w": `${split.width}px` } as CSSProperties}
    >
      <div className="changes-list-pane">
        <div className="changes-view">
          <section className="file-grid">
            <header className="file-grid-head">
              <span className="file-grid-title">
                {compareBase ?? "HEAD"} ← {compareTarget} ({compareFiles.length})
              </span>
            </header>
            {compareFiles.length > 0 ? (
              <>
                <div className="file-grid-cols">
                  <span>Name</span>
                  <span>Location</span>
                </div>
                <ul className="file-grid-list">
                  {compareFiles.map((f) => (
                    <FileRow
                      key={f.path}
                      file={f}
                      selected={selectedPath === f.path}
                      onSelect={() => selectCompareFile(f.path)}
                    />
                  ))}
                </ul>
              </>
            ) : (
              <p className="clean">Sin diferencias con {compareTarget}.</p>
            )}
          </section>
        </div>
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
