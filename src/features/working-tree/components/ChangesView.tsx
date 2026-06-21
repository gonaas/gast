import { Fragment } from "react";
import type { ReactNode } from "react";
import { useStore } from "@/shared/store";
import type { FileStatus } from "@/shared/types";
import { IconAdd, IconRemove, IconDiscard, IconCheck } from "@/shared/ui";
import { FileRow } from "@/shared/components/FileRow";

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
            actions={[
              { key: "unstage", icon: <IconRemove />, title: "Quitar del stage", onClick: () => unstageFile(f.path) },
            ]}
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
              { key: "stage", icon: <IconAdd />, title: "Añadir al stage", onClick: () => stageFile(f.path) },
              { key: "discard", icon: <IconDiscard />, title: "Descartar cambios", onClick: () => discardFile(f.path) },
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
            actions={[
              { key: "stage", icon: <IconAdd />, title: "Añadir al stage", onClick: () => stageFile(f.path) },
            ]}
          />
        )}
      </Group>

      {status.files.length === 0 && (
        <p className="clean">
          <IconCheck /> Árbol limpio
        </p>
      )}
    </div>
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
