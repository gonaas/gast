import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { ButtonSize } from "./Button";

interface ToolbarCtx {
  size: ButtonSize;
}

const ToolbarContext = createContext<ToolbarCtx | null>(null);

export function useToolbarContext() {
  const ctx = useContext(ToolbarContext);
  if (!ctx) throw new Error("Toolbar.Group / Toolbar.Separator deben usarse dentro de <Toolbar>");
  return ctx;
}

interface ToolbarProps {
  size?: ButtonSize;
  children: ReactNode;
}

interface ToolbarComponent {
  (props: ToolbarProps): JSX.Element;
  Group: typeof Group;
  Separator: typeof Separator;
}

const Toolbar = function Toolbar({ size = "md", children }: ToolbarProps) {
  return (
    <ToolbarContext.Provider value={{ size }}>
      <div className="ui-toolbar" data-tauri-drag-region>{children}</div>
    </ToolbarContext.Provider>
  );
} as ToolbarComponent;

function Group({ children, grow = false }: { children: ReactNode; grow?: boolean }) {
  useToolbarContext();
  return <div className={["ui-toolbar__group", grow ? "ui-toolbar__group--grow" : ""].filter(Boolean).join(" ")}>{children}</div>;
}

function Separator() {
  useToolbarContext();
  return <div className="ui-toolbar__separator" />;
}

Toolbar.Group = Group;
Toolbar.Separator = Separator;

export { Toolbar };
