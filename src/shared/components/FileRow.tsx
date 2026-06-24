import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { FileStatus } from "@/shared/types";
import { fileName, fileLocation } from "@/shared/lib/paths";
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
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <li ref={ref} className={selected ? "file-row selected" : "file-row"}>
      <code className="xy">
        {file.indexStatus}
        {file.worktreeStatus}
      </code>
      <span className="file-name" onClick={onSelect}>
        {fileName(file.path)}
      </span>
      <span className="file-location" onClick={onSelect} title={file.path}>
        {fileLocation(file.path)}
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
