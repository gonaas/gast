import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type BadgeVariant = "neutral" | "accent" | "success" | "warn" | "danger";

interface BadgeCtx {
  variant: BadgeVariant;
}

const BadgeContext = createContext<BadgeCtx | null>(null);

function useBadgeContext() {
  const ctx = useContext(BadgeContext);
  if (!ctx) throw new Error("Badge.Dot / Badge.Label deben usarse dentro de <Badge>");
  return ctx;
}

interface BadgeProps {
  variant?: BadgeVariant;
  title?: string;
  children: ReactNode;
}

interface BadgeComponent {
  (props: BadgeProps): JSX.Element;
  Dot: typeof Dot;
  Label: typeof Label;
}

const Badge = function Badge({ variant = "neutral", title, children }: BadgeProps) {
  return (
    <BadgeContext.Provider value={{ variant }}>
      <span className={`ui-badge ui-badge--${variant}`} title={title}>
        {children}
      </span>
    </BadgeContext.Provider>
  );
} as BadgeComponent;

function Dot() {
  useBadgeContext();
  return <span className="ui-badge__dot" />;
}

function Label({ children }: { children: ReactNode }) {
  useBadgeContext();
  return <span className="ui-badge__label">{children}</span>;
}

Badge.Dot = Dot;
Badge.Label = Label;

export { Badge };
