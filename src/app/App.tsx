import { useEffect } from "react";
import { useStore } from "@/shared/store";
import { pickRepoFolder } from "@/shared/api/dialog";
import { ConflictBanner } from "@/features/integration/components/ConflictBanner";
import { TabBar } from "./TabBar";
import { Toolbar } from "./Toolbar";
import { Layout } from "./Layout";
import { EmptyState } from "./EmptyState";
import { useRepoWatcher } from "./useRepoWatcher";

export default function App() {
  const repo = useStore((s) => s.repo);
  const error = useStore((s) => s.error);
  const clearError = useStore((s) => s.clearError);
  const openRepo = useStore((s) => s.openRepo);
  const loadRecentRepos = useStore((s) => s.loadRecentRepos);
  const restoreOpenTabs = useStore((s) => s.restoreOpenTabs);

  useRepoWatcher();

  useEffect(() => {
    loadRecentRepos();
    restoreOpenTabs();
  }, [loadRecentRepos, restoreOpenTabs]);

  async function handleOpen() {
    const path = await pickRepoFolder();
    if (path) openRepo(path);
  }

  return (
    <div className="app">
      <TabBar onOpen={handleOpen} />
      <Toolbar onOpen={handleOpen} />

      {error && (
        <div className="error-bar" onClick={clearError}>
          {error} <span className="dismiss">(clic para cerrar)</span>
        </div>
      )}

      {repo && <ConflictBanner />}

      {repo ? <Layout /> : <EmptyState onOpen={handleOpen} />}
    </div>
  );
}
