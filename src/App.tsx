import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useStore } from "./store";
import { useResizable } from "./lib/useResizable";
import { pickRepoFolder } from "./api/git";
import { Sidebar } from "./components/Sidebar";
import { CommitList } from "./components/CommitList";
import { ChangesView } from "./components/ChangesView";
import { DetailPanel } from "./components/DetailPanel";
import { StashPanel } from "./components/StashPanel";
import { ConflictBanner } from "./components/ConflictBanner";
import {
  Button,
  IconButton,
  Select,
  Toolbar,
  ResizeHandle,
  ContextMenu,
  IconOpenRepo,
  IconFetch,
  IconPull,
  IconPush,
  IconStash,
  IconOpenIn,
  IconRefresh,
  IconClose,
  IconChevronDown,
} from "./ui";

export default function App() {
  const {
    repo,
    loading,
    error,
    view,
    branches,
    recentRepos,
    openRepo,
    loadRecentRepos,
    forgetRecentRepo,
    refresh,
    remoteOp,
    checkoutBranch,
    openWorktree,
    clearError,
  } = useStore();
  const [showStash, setShowStash] = useState(false);
  const sidebar = useResizable({ key: "ast-git:sidebar-w", initial: 260, min: 180, max: 520 });

  useEffect(() => {
    loadRecentRepos();
  }, [loadRecentRepos]);

  async function handleOpen() {
    const path = await pickRepoFolder();
    if (path) openRepo(path);
  }

  const locals = branches.filter((b) => !b.isRemote);

  return (
    <div className="app">
      <Toolbar>
        <Toolbar.Group>
          <Button onClick={handleOpen}>
            <Button.Icon>
              <IconOpenRepo />
            </Button.Icon>
            <Button.Label>Abrir</Button.Label>
          </Button>
        </Toolbar.Group>

        {repo && (
          <>
            <Toolbar.Separator />
            <Toolbar.Group>
              <Button onClick={() => remoteOp("fetch")} disabled={loading}>
                <Button.Icon>
                  <IconFetch />
                </Button.Icon>
                <Button.Label>Fetch</Button.Label>
              </Button>
              <ContextMenu>
                <ContextMenu.ClickTrigger>
                  <Button disabled={loading}>
                    <Button.Icon>
                      <IconPull />
                    </Button.Icon>
                    <Button.Label>Pull</Button.Label>
                    <Button.Icon>
                      <IconChevronDown />
                    </Button.Icon>
                  </Button>
                </ContextMenu.ClickTrigger>
                <ContextMenu.Content>
                  <ContextMenu.Item onSelect={() => remoteOp("pull", "merge")}>
                    Merge (--no-rebase)
                  </ContextMenu.Item>
                  <ContextMenu.Item onSelect={() => remoteOp("pull", "rebase")}>
                    Rebase (--rebase)
                  </ContextMenu.Item>
                  <ContextMenu.Item onSelect={() => remoteOp("pull", "ffOnly")}>
                    Fast-forward only
                  </ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu>
              <Button onClick={() => remoteOp("push")} disabled={loading}>
                <Button.Icon>
                  <IconPush />
                </Button.Icon>
                <Button.Label>Push</Button.Label>
              </Button>
              <Button onClick={() => setShowStash((v) => !v)}>
                <Button.Icon>
                  <IconStash />
                </Button.Icon>
                <Button.Label>Stash</Button.Label>
              </Button>
            </Toolbar.Group>

            <Toolbar.Group grow>
              <span className="toolbar-repo" title={repo.path}>
                {repo.name}
              </span>
              <Select
                value={repo.head ?? ""}
                onChange={(name) => name && checkoutBranch(name)}
                placeholder="(detached)"
              >
                {locals.map((b) => (
                  <Select.Option key={b.name} value={b.name}>
                    {b.name}
                  </Select.Option>
                ))}
              </Select>
            </Toolbar.Group>

            <Toolbar.Group>
              <Button onClick={() => openWorktree(repo.path, "editor")}>
                <Button.Icon>
                  <IconOpenIn />
                </Button.Icon>
                <Button.Label>Open in</Button.Label>
              </Button>
              <Button onClick={refresh} disabled={loading}>
                <Button.Icon>
                  <IconRefresh />
                </Button.Icon>
                <Button.Label>{loading ? "…" : "Refresh"}</Button.Label>
              </Button>
            </Toolbar.Group>
          </>
        )}
      </Toolbar>

      {showStash && repo && (
        <div className="stash-popover">
          <StashPanel />
        </div>
      )}

      {error && (
        <div className="error-bar" onClick={clearError}>
          {error} <span className="dismiss">(clic para cerrar)</span>
        </div>
      )}

      {repo && <ConflictBanner />}

      {!repo ? (
        <div className="empty">
          <p>Abre un repositorio Git para empezar.</p>
          <Button variant="primary" onClick={handleOpen}>
            Abrir repositorio…
          </Button>
          {recentRepos.length > 0 && (
            <ul className="recent-repos">
              {recentRepos.map((r) => (
                <li key={r.path} className="recent-repo">
                  <button className="recent-open" onClick={() => openRepo(r.path)} title={r.path}>
                    <span className="recent-name">{r.name}</span>
                    <span className="recent-path">{r.path}</span>
                  </button>
                  <IconButton
                    variant="danger"
                    title="Quitar de recientes"
                    onClick={() => forgetRecentRepo(r.path)}
                  >
                    <IconClose />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="layout" style={{ "--sidebar-w": `${sidebar.width}px` } as CSSProperties}>
          <Sidebar />
          <ResizeHandle onPointerDown={sidebar.onPointerDown} onDoubleClick={sidebar.reset} />
          <main className="center">
            <div className="main-top">{view === "history" ? <CommitList /> : <ChangesView />}</div>
            <div className="main-bottom">
              <DetailPanel />
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
