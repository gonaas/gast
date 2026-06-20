import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function CollapsibleSection({
  title,
  count,
  action,
  defaultOpen = true,
  children,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="tree-section">
      <div className="tree-section-head">
        <button className="tree-toggle" onClick={() => setOpen((v) => !v)}>
          <span className="tree-caret">
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
          <span className="tree-title">{title}</span>
          {count !== undefined && <span className="tree-count">{count}</span>}
        </button>
        {action && <span className="tree-action">{action}</span>}
      </div>
      {open && <div className="tree-body">{children}</div>}
    </div>
  );
}
