import type { PointerEvent } from "react";

// Separador arrastrable entre dos paneles. Es presentacional: la lógica de
// arrastre/clamp/persistencia vive en el hook que provee onPointerDown
// (p.ej. lib/useResizable). Doble clic suele resetear al ancho por defecto.

interface ResizeHandleProps {
  onPointerDown: (e: PointerEvent) => void;
  onDoubleClick?: () => void;
  orientation?: "vertical" | "horizontal";
  title?: string;
}

export function ResizeHandle({
  onPointerDown,
  onDoubleClick,
  orientation = "vertical",
  title = "Arrastra para redimensionar · doble clic para restablecer",
}: ResizeHandleProps) {
  return (
    <div
      className={`ui-resize-handle ui-resize-handle--${orientation}`}
      role="separator"
      aria-orientation={orientation}
      title={title}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    />
  );
}
