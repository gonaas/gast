import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

// Estado de ancho redimensionable por arrastre horizontal, persistido en
// localStorage. Pensado para paneles tipo sidebar: el handle llama a
// onPointerDown, y el ancho resultante se aplica vía CSS variable en el layout.

interface Options {
  key: string;
  initial: number;
  min: number;
  max: number;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function useResizable({ key, initial, min, max }: Options) {
  const [width, setWidth] = useState<number>(() => {
    const stored = localStorage.getItem(key);
    const parsed = stored != null ? Number(stored) : NaN;
    return Number.isFinite(parsed) ? clamp(parsed, min, max) : initial;
  });

  // Origen del arrastre: posición X del puntero y ancho en ese instante.
  const drag = useRef<{ startX: number; startW: number } | null>(null);

  useEffect(() => {
    localStorage.setItem(key, String(width));
  }, [key, width]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      e.preventDefault();
      drag.current = { startX: e.clientX, startW: width };

      const prevCursor = document.body.style.cursor;
      const prevSelect = document.body.style.userSelect;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: PointerEvent) => {
        if (!drag.current) return;
        const next = drag.current.startW + (ev.clientX - drag.current.startX);
        setWidth(clamp(next, min, max));
      };
      const onUp = () => {
        drag.current = null;
        document.body.style.cursor = prevCursor;
        document.body.style.userSelect = prevSelect;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [width, min, max],
  );

  const reset = useCallback(() => setWidth(initial), [initial]);

  return { width, onPointerDown, reset };
}
