import type { ReactNode } from "react";
import { Button } from "@/shared/ui";

// Una cuadrícula de archivos estilo Fork: cabecera con título, contador y botón
// bulk (Stage/Unstage), fila de columnas Name | Location y la lista de filas.
export function FileGrid({
  title,
  count,
  bulkLabel,
  bulkIcon,
  onBulk,
  children,
}: {
  title: string;
  count: number;
  bulkLabel: string;
  bulkIcon?: ReactNode;
  onBulk: () => void;
  children: ReactNode;
}) {
  return (
    <section className="file-grid">
      <header className="file-grid-head">
        <span className="file-grid-title">
          {title} ({count})
        </span>
        <Button size="sm" variant="secondary" disabled={count === 0} onClick={onBulk}>
          {bulkIcon}
          {bulkLabel}
        </Button>
      </header>
      <div className="file-grid-cols">
        <span>Name</span>
        <span>Location</span>
      </div>
      <ul className="file-grid-list">{children}</ul>
    </section>
  );
}
