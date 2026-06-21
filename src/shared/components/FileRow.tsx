import type { ReactNode } from "react";
import type { FileStatus } from "@/shared/types";
import { IconButton } from "@/shared/ui";

export interface Action {
  key: string;
  icon: ReactNode;
  title: string;
  onClick: () => void;
}

export function FileRow({
  file,
  selected,
  onSelect,
  actions = [],
}: {
  file: FileStatus;
  selected: boolean;
  onSelect: () => void;
  actions?: Action[];
}) {
  return (
    <li className={selected ? "file-row selected" : "file-row"}>
      <code className="xy">
        {file.indexStatus}
        {file.worktreeStatus}
      </code>
      <span className="file-path" onClick={onSelect}>
        {file.path}
      </span>
      {actions.length > 0 && (
        <span className="file-actions">
          {actions.map((a) => (
            <IconButton key={a.key} size="sm" title={a.title} onClick={a.onClick}>
              {a.icon}
            </IconButton>
          ))}
        </span>
      )}
    </li>
  );
}
