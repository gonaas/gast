import { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface FieldCtx {
  id?: string;
  disabled?: boolean;
}

const FieldContext = createContext<FieldCtx | null>(null);

function useFieldContext() {
  const ctx = useContext(FieldContext);
  if (!ctx) throw new Error("Field.Label / Field.Control / Field.Hint deben usarse dentro de <Field>");
  return ctx;
}

interface FieldProps extends FieldCtx {
  children: ReactNode;
}

interface FieldComponent {
  (props: FieldProps): JSX.Element;
  Label: typeof Label;
  Control: typeof Control;
  Hint: typeof Hint;
}

const Field = function Field({ id, disabled, children }: FieldProps) {
  return (
    <FieldContext.Provider value={{ id, disabled }}>
      <div className={["ui-field", disabled ? "ui-field--disabled" : ""].filter(Boolean).join(" ")}>
        {children}
      </div>
    </FieldContext.Provider>
  );
} as FieldComponent;

function Label({ children }: { children: ReactNode }) {
  const { id } = useFieldContext();
  return (
    <label className="ui-field__label" htmlFor={id}>
      {children}
    </label>
  );
}

function Control({ children }: { children: ReactNode }) {
  useFieldContext();
  return <div className="ui-field__control">{children}</div>;
}

function Hint({ children }: { children: ReactNode }) {
  useFieldContext();
  return <p className="ui-field__hint">{children}</p>;
}

Field.Label = Label;
Field.Control = Control;
Field.Hint = Hint;

export { Field };
