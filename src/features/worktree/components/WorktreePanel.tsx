import { useState } from "react";
import { useStore } from "@/shared/store";
import { pickRepoFolder } from "@/shared/api/dialog";
import {
  Badge,
  Button,
  Field,
  IconButton,
  Input,
  Select,
  IconWorktree,
  IconFolderOpen,
  IconEditor,
  IconTerminal,
} from "@/shared/ui";

export function WorktreePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { worktrees, branches, addWorktree, openWorktree } = useStore();
  const [path, setPath] = useState("");
  const [branch, setBranch] = useState("");
  const [newBranch, setNewBranch] = useState(true);
  const [start, setStart] = useState("");

  async function pick() {
    const p = await pickRepoFolder();
    if (p) setPath(p);
  }

  async function submit() {
    if (!path || !branch) return;
    await addWorktree(path, branch, newBranch, newBranch ? start : "");
    onClose();
    setPath("");
    setBranch("");
    setStart("");
  }

  return (
    <section className="worktrees embedded">
      {open && (
        <div className="wt-form">
          <Field>
            <Field.Label>Carpeta destino</Field.Label>
            <Field.Control>
              <Input value={path} onChange={(e) => setPath(e.target.value)} placeholder="/ruta/al/worktree" />
              <Button size="sm" onClick={pick} title="Elegir carpeta">
                <IconFolderOpen />
              </Button>
            </Field.Control>
          </Field>
          <Field>
            <Field.Label>{newBranch ? "Rama nueva" : "Rama existente"}</Field.Label>
            <Field.Control>
              <Input value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="feature/x" />
            </Field.Control>
          </Field>
          <label className="wt-checkbox">
            <input type="checkbox" checked={newBranch} onChange={(e) => setNewBranch(e.target.checked)} />
            Crear rama nueva
          </label>
          {newBranch && (
            <Field>
              <Field.Label>Partir de (opcional)</Field.Label>
              <Field.Control>
                <Select value={start} onChange={setStart} placeholder="HEAD actual">
                  <Select.Option value="">HEAD actual</Select.Option>
                  {branches.map((b) => (
                    <Select.Option key={b.name} value={b.name}>
                      {b.name}
                    </Select.Option>
                  ))}
                </Select>
              </Field.Control>
            </Field>
          )}
          <Button variant="primary" onClick={submit}>
            Crear worktree
          </Button>
        </div>
      )}

      <ul className="wt-list">
        {worktrees.map((wt) => (
          <li key={wt.path} className="wt" title={wt.path}>
            <span className="wt-icon">
              <IconWorktree />
            </span>
            <span className="wt-branch">
              {wt.branch ?? (wt.isDetached ? "(detached)" : "(bare)")}
            </span>
            {wt.prunable && <Badge variant="warn">prunable</Badge>}
            {wt.locked && <Badge variant="neutral">locked</Badge>}
            <span className="wt-actions">
              <IconButton title="Abrir en VS Code" onClick={() => openWorktree(wt.path, "editor")}>
                <IconEditor />
              </IconButton>
              <IconButton title="Abrir en Terminal" onClick={() => openWorktree(wt.path, "terminal")}>
                <IconTerminal />
              </IconButton>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
