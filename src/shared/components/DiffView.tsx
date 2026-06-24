import { useMemo, useState } from "react";
import { Diff, Hunk, parseDiff, tokenize } from "react-diff-view";
import type { FileData, HunkData, HunkTokens, ViewType } from "react-diff-view";
import { useStore } from "@/shared/store";
import { refractor, languageForPath } from "@/shared/lib/diffLang";

const VIEW_KEY = "ast-git:diff-view-type";

function initialViewType(): ViewType {
  return localStorage.getItem(VIEW_KEY) === "unified" ? "unified" : "split";
}

export function DiffView() {
  const { selectedPath, diffText } = useStore();
  const [viewType, setViewType] = useState<ViewType>(initialViewType);

  function changeView(v: ViewType) {
    setViewType(v);
    localStorage.setItem(VIEW_KEY, v);
  }

  const file: FileData | undefined = useMemo(() => {
    try {
      return parseDiff(diffText)[0];
    } catch {
      return undefined;
    }
  }, [diffText]);

  const tokens: HunkTokens | undefined = useMemo(() => {
    if (!file || file.hunks.length === 0) return undefined;
    const language = languageForPath(selectedPath);
    if (!language) return undefined;
    try {
      return tokenize(file.hunks, { highlight: true, refractor, language });
    } catch {
      return undefined;
    }
  }, [file, selectedPath]);

  if (!selectedPath) return null;

  const hasHunks = file && file.hunks.length > 0;

  return (
    <div className="diff">
      <div className="diff-head">
        <span className="diff-path">{selectedPath}</span>
        <div className="diff-view-toggle">
          <button
            className={viewType === "split" ? "active" : ""}
            onClick={() => changeView("split")}
          >
            Split
          </button>
          <button
            className={viewType === "unified" ? "active" : ""}
            onClick={() => changeView("unified")}
          >
            Unified
          </button>
        </div>
      </div>

      {hasHunks ? (
        <Diff
          viewType={viewType}
          diffType={file.type}
          hunks={file.hunks}
          tokens={tokens}
          className="diff-table"
        >
          {(hunks: HunkData[]) => hunks.map((h) => <Hunk key={h.content} hunk={h} />)}
        </Diff>
      ) : (
        <p className="detail-placeholder">
          {diffText.trim() ? "Sin cambios de texto (binario o solo metadatos)." : "Sin cambios para mostrar."}
        </p>
      )}
    </div>
  );
}
