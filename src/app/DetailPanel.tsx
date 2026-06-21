import { useState } from "react";
import { useStore } from "@/shared/store";
import { Tabs } from "@/shared/ui";
import { ChangesDetail } from "@/features/working-tree/components/ChangesDetail";
import { HistoryDetail } from "@/features/commit/components/HistoryDetail";

type DetailTab = "commit" | "changes" | "filetree";

export function DetailPanel() {
  const view = useStore((s) => s.view);
  const [tab, setTab] = useState<DetailTab>("changes");

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as DetailTab)}>
      <Tabs.List>
        <Tabs.Trigger value="commit">Commit</Tabs.Trigger>
        <Tabs.Trigger value="changes">Changes</Tabs.Trigger>
        <Tabs.Trigger value="filetree">File Tree</Tabs.Trigger>
      </Tabs.List>
      <div className="detail-body">
        {view === "changes" ? <ChangesDetail tab={tab} /> : <HistoryDetail tab={tab} />}
      </div>
    </Tabs>
  );
}
