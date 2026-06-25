import { useState } from "react";
import { useStore } from "@/shared/store";
import { StashPanel } from "@/features/stash/components/StashPanel";
import {
  Button,
  Select,
  Toolbar as Bar,
  ContextMenu,
  IconOpenRepo,
  IconFetch,
  IconPull,
  IconPush,
  IconStash,
  IconOpenIn,
  IconRefresh,
  IconChevronDown,
  IconCompare,
} from "@/shared/ui";

export function Toolbar({ onOpen }: { onOpen: () => void }) {
  const repo = useStore((s) => s.repo);
  const loading = useStore((s) => s.loading);
  const branches = useStore((s) => s.branches);
  const refresh = useStore((s) => s.refresh);
  const remoteOp = useStore((s) => s.remoteOp);
  const checkoutBranch = useStore((s) => s.checkoutBranch);
  const openWorktree = useStore((s) => s.openWorktree);
  const selectedBranch = useStore((s) => s.selectedBranch);
  const openCompare = useStore((s) => s.openCompare);
  const [showStash, setShowStash] = useState(false);

  // "Ver cambios" compara la rama seleccionada en el sidebar contra la actual.
  // Solo tiene sentido si hay una seleccionada distinta de HEAD.
  const canCompare = !!selectedBranch && selectedBranch !== repo?.head;

  const locals = branches.filter((b) => !b.isRemote);

  return (
    <>
      <Bar>
        <Bar.Group>
          <Button onClick={onOpen}>
            <Button.Icon>
              <IconOpenRepo />
            </Button.Icon>
            <Button.Label>Abrir</Button.Label>
          </Button>
        </Bar.Group>

        {repo && (
          <>
            <Bar.Separator />
            <Bar.Group>
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
              <Button
                onClick={() => selectedBranch && openCompare(selectedBranch)}
                disabled={loading || !canCompare}
                title={
                  canCompare
                    ? `Ver cambios de ${selectedBranch} respecto a la rama actual`
                    : "Selecciona en el sidebar una rama distinta a la actual"
                }
              >
                <Button.Icon>
                  <IconCompare />
                </Button.Icon>
                <Button.Label>Ver cambios</Button.Label>
              </Button>
              <Button onClick={() => setShowStash((v) => !v)}>
                <Button.Icon>
                  <IconStash />
                </Button.Icon>
                <Button.Label>Stash</Button.Label>
              </Button>
            </Bar.Group>

            <Bar.Group grow>
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
            </Bar.Group>

            <Bar.Group>
              <Button onClick={() => openWorktree(repo.path, "editor")}>
                <Button.Icon>
                  <IconOpenIn />
                </Button.Icon>
                <Button.Label>Open in</Button.Label>
              </Button>
              <Button onClick={() => refresh()} disabled={loading}>
                <Button.Icon>
                  <IconRefresh />
                </Button.Icon>
                <Button.Label>{loading ? "…" : "Refresh"}</Button.Label>
              </Button>
            </Bar.Group>
          </>
        )}
      </Bar>

      {showStash && repo && (
        <div className="stash-popover">
          <StashPanel />
        </div>
      )}
    </>
  );
}
