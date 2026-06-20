import { Children, createContext, isValidElement, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface SelectCtx {
  value: string;
  select: (value: string) => void;
}

const SelectContext = createContext<SelectCtx | null>(null);

function useSelectContext() {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("Select.Option debe usarse dentro de <Select>");
  return ctx;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  children: ReactNode;
}

interface SelectComponent {
  (props: SelectProps): JSX.Element;
  Option: typeof Option;
}

const Select = function Select({ value, onChange, placeholder, disabled, children }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function select(next: string) {
    onChange(next);
    setOpen(false);
  }

  // Etiqueta del trigger: las children cuyo value coincide con el actual.
  let label: ReactNode = placeholder ?? "Seleccionar…";
  Children.forEach(children, (child) => {
    if (isValidElement(child) && (child.props as { value?: string }).value === value) {
      label = (child.props as { children?: ReactNode }).children;
    }
  });

  return (
    <SelectContext.Provider value={{ value, select }}>
      <div className="ui-select" ref={ref}>
        <button
          type="button"
          className="ui-select__trigger"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="ui-select__value">{label}</span>
          <span className="ui-select__chevron">▾</span>
        </button>
        {open && <div className="ui-select__menu">{children}</div>}
      </div>
    </SelectContext.Provider>
  );
} as SelectComponent;

function Option({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useSelectContext();
  const active = ctx.value === value;
  return (
    <button
      type="button"
      className={active ? "ui-select__option ui-select__option--active" : "ui-select__option"}
      onClick={() => ctx.select(value)}
    >
      <span className="ui-select__check">{active ? "✓" : ""}</span>
      {children}
    </button>
  );
}

Select.Option = Option;

export { Select };
