import { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface TabsCtx {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsCtx | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs.List / Tabs.Trigger deben usarse dentro de <Tabs>");
  return ctx;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

interface TabsComponent {
  (props: TabsProps): JSX.Element;
  List: typeof List;
  Trigger: typeof Trigger;
}

const Tabs = function Tabs({ value, onValueChange, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className="ui-tabs">{children}</div>
    </TabsContext.Provider>
  );
} as TabsComponent;

function List({ children }: { children: ReactNode }) {
  useTabsContext();
  return <div className="ui-tabs__list">{children}</div>;
}

function Trigger({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useTabsContext();
  const active = ctx.value === value;
  return (
    <button
      type="button"
      className={active ? "ui-tabs__trigger ui-tabs__trigger--active" : "ui-tabs__trigger"}
      onClick={() => ctx.onValueChange(value)}
    >
      {children}
    </button>
  );
}

Tabs.List = List;
Tabs.Trigger = Trigger;

export { Tabs };
