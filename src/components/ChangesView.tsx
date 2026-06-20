import { Fragment } from "react";
import type { ReactNode } from "react";
import { useStore } from "../store";
import type { FileStatus } from "../types";
import { IconButton } from "../ui";

export function ChangesView() {
  const { status, selectedPath, selectFile, stageFile, unstageFile, discardFile } = useStore();

  if (!status) return null;

  const staged = status.files.filter((f) => f.indexStatus !== " " && f.indexStatus !== "?");
  const untracked = status.files.filter((f) => f.indexStatus === "?");
  const unstaged = status.files.filter((f) => f.indexStatus !== "?" && f.worktreeStatus !== " ");

  return (
    <div className="changes-view">
      <div className="commits-head">Local Changes · {status.branch}</div>

      <Group title="Staged" files={staged}>
        {(f) => (
          <FileRow
            file={f}
            selected={selectedPath === f.path}
            onSelect={() => selectFile(f.path, true, false)}
            actions={[{ label: "−", title: "Quitar del stage", onClick: () => unstageFile(f.path) }]}
          />
        )}
      </Group>

      <Group title="Sin stage" files={unstaged}>
        {(f) => (
          <FileRow
            file={f}
            selected={selectedPath === f.path}
            onSelect={() => selectFile(f.path, false, false)}
            actions={[
              { label: "+", title: "Añadir al stage", onClick: () => stageFile(f.path) },
              { label: "↩", title: "Descartar cambios", onClick: () => discardFile(f.path) },
            ]}
          />
        )}
      </Group>

      <Group title="Sin seguimiento" files={untracked}>
        {(f) => (
          <FileRow
            file={f}
            selected={selectedPath === f.path}
            onSelect={() => selectFile(f.path, false, true)}
            actions={[{ label: "+", title: "Añadir al stage", onClick: () => stageFile(f.path) }]}
          />
        )}
      </Group>

      {status.files.length === 0 && <p className="clean">Árbol limpio ✓</p>}
    </div>
  );
}

interface Action {
  label: string;
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
            <IconButton key={a.label} size="sm" title={a.title} onClick={a.onClick}>
              {a.label}
            </IconButton>
          ))}
        </span>
      )}
    </li>
  );
}

function Group({
  title,
  files,
  children,
}: {
  title: string;
  files: FileStatus[];
  children: (f: FileStatus) => ReactNode;
}) {
  if (files.length === 0) return null;
  return (
    <div className="status-group">
      <h4>
        {title} ({files.length})
      </h4>
      <ul>
        {files.map((f) => (
          <Fragment key={f.path}>{children(f)}</Fragment>
        ))}
      </ul>
    </div>
  );
}
