import { useState } from "react";
import { Tabs } from "@/shared/ui";
import { HistoryDetail } from "@/features/commit/components/HistoryDetail";

type DetailTab = "commit" | "changes" | "filetree";

export function DetailPanel() {
  const [tab, setTab] = useState<DetailTab>("changes");

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as DetailTab)}>
      <Tabs.List>
        <Tabs.Trigger value="commit">Commit</Tabs.Trigger>
        <Tabs.Trigger value="changes">Changes</Tabs.Trigger>
        <Tabs.Trigger value="filetree">File Tree</Tabs.Trigger>
      </Tabs.List>
      <div className="detail-body">
        <HistoryDetail tab={tab} />
      </div>
    </Tabs>
  );
}
