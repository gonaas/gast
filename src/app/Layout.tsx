import type { CSSProperties } from "react";
import { useStore } from "@/shared/store";
import { useResizable } from "@/shared/lib/useResizable";
import { ResizeHandle } from "@/shared/ui";
import { Sidebar } from "./Sidebar";
import { DetailPanel } from "./DetailPanel";
import { CommitList } from "@/features/commit/components/CommitList";
import { ChangesWorkspace } from "@/features/working-tree/components/ChangesWorkspace";
import { CompareWorkspace } from "@/features/compare/components/CompareWorkspace";

export function Layout() {
  const view = useStore((s) => s.view);
  const sidebar = useResizable({ key: "ast-git:sidebar-w", initial: 260, min: 180, max: 520 });

  return (
    <div className="layout" style={{ "--sidebar-w": `${sidebar.width}px` } as CSSProperties}>
      <Sidebar />
      <ResizeHandle onPointerDown={sidebar.onPointerDown} onDoubleClick={sidebar.reset} />
      <main className="center">
        {view === "history" ? (
          <>
            <div className="main-top">
              <CommitList />
            </div>
            <div className="main-bottom">
              <DetailPanel />
            </div>
          </>
        ) : view === "compare" ? (
          <CompareWorkspace />
        ) : (
          <ChangesWorkspace />
        )}
      </main>
    </div>
  );
}
