import { cloneElement, createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { MouseEvent, ReactElement, ReactNode } from "react";

// Menú contextual compound. El patrón de uso:
//
//   <ContextMenu>
//     <ContextMenu.Trigger>
//       <li className="branch">…</li>
//     </ContextMenu.Trigger>
//     <ContextMenu.Content>
//       <ContextMenu.Item onSelect={checkout}>Checkout</ContextMenu.Item>
//       <ContextMenu.Separator />
//       <ContextMenu.Item variant="danger" onSelect={remove}>Borrar</ContextMenu.Item>
//     </ContextMenu.Content>
//   </ContextMenu>
//
// El Trigger clona a su único hijo e inyecta onContextMenu (no añade markup
// extra, así que la fila sigue siendo un <li> dentro de su <ul>).

interface Pos {
  x: number;
  y: number;
}

interface ContextMenuCtx {
  pos: Pos | null;
  open: (e: MouseEvent) => void;
  openAt: (x: number, y: number) => void;
  close: () => void;
}

const ContextMenuContext = createContext<ContextMenuCtx | null>(null);

function useContextMenuCtx() {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) throw new Error("ContextMenu.Trigger / .Content deben usarse dentro de <ContextMenu>");
  return ctx;
}

interface ContextMenuComponent {
  (props: { children: ReactNode }): JSX.Element;
  Trigger: typeof Trigger;
  ClickTrigger: typeof ClickTrigger;
  Content: typeof Content;
  Item: typeof Item;
  Separator: typeof Separator;
}

const ContextMenu = function ContextMenu({ children }: { children: ReactNode }) {
  const [pos, setPos] = useState<Pos | null>(null);

  function openAt(x: number, y: number) {
    setPos({ x, y });
  }
  function open(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    openAt(e.clientX, e.clientY);
  }
  function close() {
    setPos(null);
  }

  return (
    <ContextMenuContext.Provider value={{ pos, open, openAt, close }}>
      {children}
    </ContextMenuContext.Provider>
  );
} as ContextMenuComponent;

function Trigger({ children }: { children: ReactElement }) {
  const ctx = useContextMenuCtx();
  return cloneElement(children, { onContextMenu: ctx.open });
}

// Igual que Trigger pero abre con clic izquierdo, anclado bajo el elemento
// (para botones tipo dropdown). Cierra si ya estaba abierto (toggle).
function ClickTrigger({ children }: { children: ReactElement }) {
  const ctx = useContextMenuCtx();
  return cloneElement(children, {
    onClick: (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (ctx.pos) {
        ctx.close();
        return;
      }
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      ctx.openAt(rect.left, rect.bottom + 4);
    },
  });
}

function Content({ children }: { children: ReactNode }) {
  const ctx = useContextMenuCtx();

  useEffect(() => {
    if (!ctx.pos) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && ctx.close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ctx.pos, ctx]);

  if (!ctx.pos) return null;

  return createPortal(
    <div className="ui-ctxmenu__overlay" onClick={ctx.close} onContextMenu={(e) => {
      e.preventDefault();
      ctx.close();
    }}>
      <div
        className="ui-ctxmenu"
        style={{ top: ctx.pos.y, left: ctx.pos.x }}
        onClick={(e) => e.stopPropagation()}
        role="menu"
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

function Item({
  children,
  onSelect,
  variant = "default",
  disabled,
}: {
  children: ReactNode;
  onSelect: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}) {
  const ctx = useContextMenuCtx();
  return (
    <button
      type="button"
      role="menuitem"
      className={`ui-ctxmenu__item ui-ctxmenu__item--${variant}`}
      disabled={disabled}
      onClick={() => {
        ctx.close();
        onSelect();
      }}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="ui-ctxmenu__sep" role="separator" />;
}

ContextMenu.Trigger = Trigger;
ContextMenu.ClickTrigger = ClickTrigger;
ContextMenu.Content = Content;
ContextMenu.Item = Item;
ContextMenu.Separator = Separator;

export { ContextMenu };
