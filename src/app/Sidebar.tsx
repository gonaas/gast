import { useState } from "react";
import { useStore } from "@/shared/store";
import { Badge, Input, IconChanges, IconHistory } from "@/shared/ui";
import { WorktreeSection } from "@/features/worktree/components/WorktreeSection";
import { BranchSection } from "@/features/branch/components/BranchSection";
import { RemoteSection } from "@/features/remote/components/RemoteSection";
import { TagSection } from "@/features/tag/components/TagSection";

export function Sidebar() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const changesCount = useStore((s) => s.status?.files.length ?? 0);
  const [filter, setFilter] = useState("");
  const query = filter.trim().toLowerCase();

  return (
    <nav className="sidebar">
      <ul className="view-items">
        <li
          className={view === "changes" ? "view-item active" : "view-item"}
          onClick={() => setView("changes")}
        >
          <span className="view-icon">
            <IconChanges />
          </span>
          <span className="view-label">Local Changes</span>
          {changesCount > 0 && <Badge variant="accent">{changesCount}</Badge>}
        </li>
        <li
          className={view === "history" ? "view-item active" : "view-item"}
          onClick={() => setView("history")}
        >
          <span className="view-icon">
            <IconHistory />
          </span>
          <span className="view-label">All Commits</span>
        </li>
      </ul>

      <div className="sidebar-filter">
        <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrar…" />
      </div>

      <WorktreeSection />
      <BranchSection query={query} />
      <RemoteSection query={query} />
      <TagSection query={query} />
    </nav>
  );
}
