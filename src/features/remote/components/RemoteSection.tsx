import { useState } from "react";
import { useStore } from "@/shared/store";
import { buildBranchTree } from "@/shared/lib/branchTree";
import { BranchTree } from "@/shared/components/branch-tree/BranchTree";
import {
  CollapsibleSection,
  Button,
  IconButton,
  Input,
  ContextMenu,
  IconClose,
  IconAdd,
  IconRemote,
  IconDelete,
} from "@/shared/ui";

export function RemoteSection({ query }: { query: string }) {
  const remotes = useStore((s) => s.remotes);
  const branches = useStore((s) => s.branches);
  const addRemote = useStore((s) => s.addRemote);
  const removeRemote = useStore((s) => s.removeRemote);

  const [addingRemote, setAddingRemote] = useState(false);
  const [remoteName, setRemoteName] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");

  const remoteBranches = branches.filter(
    (b) => b.isRemote && (!query || b.name.toLowerCase().includes(query)),
  );

  async function doAddRemote() {
    await addRemote(remoteName, remoteUrl);
    setRemoteName("");
    setRemoteUrl("");
    setAddingRemote(false);
  }

  return (
    <CollapsibleSection
      title="Remotes"
      count={remotes.length}
      action={
        <IconButton title="Añadir remote" onClick={() => setAddingRemote((v) => !v)}>
          {addingRemote ? <IconClose /> : <IconAdd />}
        </IconButton>
      }
    >
      {addingRemote && (
        <div className="branch-form remote-form">
          <Input value={remoteName} onChange={(e) => setRemoteName(e.target.value)} placeholder="origin" />
          <Input value={remoteUrl} onChange={(e) => setRemoteUrl(e.target.value)} placeholder="https://…" />
          <Button variant="primary" size="sm" onClick={doAddRemote}>
            Añadir
          </Button>
        </div>
      )}
      {remotes.map((r) => {
        const tree = buildBranchTree(
          remoteBranches.filter((b) => b.name.startsWith(`${r.name}/`)),
          true,
        );
        return (
          <div key={r.name} className="remote-block">
            <ContextMenu>
              <ContextMenu.Trigger>
                <div className="remote-head" title={`${r.url} · clic derecho para opciones`}>
                  <span className="branch-icon">
                    <IconRemote />
                  </span>
                  <span className="branch-name">{r.name}</span>
                </div>
              </ContextMenu.Trigger>
              <ContextMenu.Content>
                <ContextMenu.Item variant="danger" onSelect={() => removeRemote(r.name)}>
                  <IconDelete /> Eliminar remote
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu>
            <BranchTree node={tree} depth={1} readOnly />
          </div>
        );
      })}
    </CollapsibleSection>
  );
}
