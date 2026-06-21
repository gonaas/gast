import { useEffect } from "react";
import { useStore } from "@/shared/store";
import { pickRepoFolder } from "@/shared/api/dialog";
import { ConflictBanner } from "@/features/integration/components/ConflictBanner";
import { Toolbar } from "./Toolbar";
import { Layout } from "./Layout";
import { EmptyState } from "./EmptyState";

// Composition root: cablea toolbar, banner de conflictos y layout/empty.
export default function App() {
  const repo = useStore((s) => s.repo);
  const error = useStore((s) => s.error);
  const clearError = useStore((s) => s.clearError);
  const openRepo = useStore((s) => s.openRepo);
  const loadRecentRepos = useStore((s) => s.loadRecentRepos);

  useEffect(() => {
    loadRecentRepos();
  }, [loadRecentRepos]);

  async function handleOpen() {
    const path = await pickRepoFolder();
    if (path) openRepo(path);
  }

  return (
    <div className="app">
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
