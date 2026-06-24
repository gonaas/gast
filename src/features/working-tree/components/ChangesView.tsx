import { useStore } from "@/shared/store";
import type { FileStatus } from "@/shared/types";
import { IconAdd, IconRemove, IconDiscard, IconCheck } from "@/shared/ui";
import { FileRow } from "@/shared/components/FileRow";
import { FileGrid } from "./FileGrid";

export function ChangesView() {
  const {
    status,
    selectedPath,
    selectFile,
    stageFile,
    unstageFile,
    discardFile,
    stageAll,
    unstageAll,
  } = useStore();

  if (!status) return null;

  const staged = status.files.filter((f) => f.indexStatus !== " " && f.indexStatus !== "?");
  const untracked = status.files.filter((f) => f.indexStatus === "?");
  const unstaged = status.files.filter((f) => f.indexStatus !== "?" && f.worktreeStatus !== " ");

  // La caja "Unstaged" agrupa modificados sin stage + untracked (como Fork).
  const unstagedAll: { file: FileStatus; untracked: boolean }[] = [
    ...unstaged.map((file) => ({ file, untracked: false })),
    ...untracked.map((file) => ({ file, untracked: true })),
  ];

  if (status.files.length === 0) {
    return (
      <div className="changes-view">
        <p className="clean">
          <IconCheck /> Árbol limpio
        </p>
      </div>
    );
  }

  return (
    <div className="changes-view">
      <FileGrid
        title="Unstaged"
        count={unstagedAll.length}
        bulkLabel="Stage"
        bulkIcon={<IconAdd />}
        onBulk={stageAll}
      >
        {unstagedAll.map(({ file, untracked }) => (
          <FileRow
            key={file.path}
            file={file}
            selected={selectedPath === file.path}
            onSelect={() => selectFile(file.path, false, untracked)}
            actions={
              untracked
                ? [{ key: "stage", icon: <IconAdd />, title: "Añadir al stage", onClick: () => stageFile(file.path) }]
                : [
                    { key: "stage", icon: <IconAdd />, title: "Añadir al stage", onClick: () => stageFile(file.path) },
                    { key: "discard", icon: <IconDiscard />, title: "Descartar cambios", onClick: () => discardFile(file.path) },
                  ]
            }
          />
        ))}
      </FileGrid>

      <FileGrid
        title="Staged"
        count={staged.length}
        bulkLabel="Unstage"
        bulkIcon={<IconRemove />}
        onBulk={unstageAll}
      >
        {staged.map((file) => (
          <FileRow
            key={file.path}
            file={file}
            selected={selectedPath === file.path}
            onSelect={() => selectFile(file.path, true, false)}
            actions={[
              { key: "unstage", icon: <IconRemove />, title: "Quitar del stage", onClick: () => unstageFile(file.path) },
            ]}
          />
        ))}
      </FileGrid>
    </div>
  );
}
