import { createContext, useContext } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

interface ButtonCtx {
  variant: ButtonVariant;
  size: ButtonSize;
}

const ButtonContext = createContext<ButtonCtx | null>(null);

function useButtonContext() {
  const ctx = useContext(ButtonContext);
  if (!ctx) throw new Error("Button.Icon / Button.Label deben usarse dentro de <Button>");
  return ctx;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

interface ButtonComponent {
  (props: ButtonProps): JSX.Element;
  Icon: typeof Icon;
  Label: typeof Label;
}

const Button = function Button({
  variant = "secondary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "ui-btn",
    `ui-btn--${variant}`,
    `ui-btn--${size}`,
    fullWidth ? "ui-btn--full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ButtonContext.Provider value={{ variant, size }}>
      <button className={classes} {...rest}>
        {children}
      </button>
    </ButtonContext.Provider>
  );
} as ButtonComponent;

function Icon({ children }: { children: ReactNode }) {
  useButtonContext();
  return <span className="ui-btn__icon">{children}</span>;
}

function Label({ children }: { children: ReactNode }) {
  useButtonContext();
  return <span className="ui-btn__label">{children}</span>;
}

Button.Icon = Icon;
Button.Label = Label;

export { Button };
