import { useState } from "react";
import { useStore } from "@/shared/store";
import { buildBranchTree } from "@/shared/lib/branchTree";
import { BranchTree } from "@/shared/components/branch-tree/BranchTree";
import { CollapsibleSection, Button, IconButton, Input, IconClose, IconAdd } from "@/shared/ui";

export function BranchSection({ query }: { query: string }) {
  const branches = useStore((s) => s.branches);
  const checkoutBranch = useStore((s) => s.checkoutBranch);
  const createBranch = useStore((s) => s.createBranch);
  const deleteBranch = useStore((s) => s.deleteBranch);
  const mergeBranch = useStore((s) => s.mergeBranch);
  const rebaseOnto = useStore((s) => s.rebaseOnto);

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  // La rama actual (head) siempre se muestra, aunque no coincida con el filtro.
  const locals = branches.filter(
    (b) => !b.isRemote && (!query || b.isHead || b.name.toLowerCase().includes(query)),
  );
  const localTree = buildBranchTree(locals);

  async function doCreate() {
    await createBranch(name, "");
    setName("");
    setCreating(false);
  }

  return (
    <CollapsibleSection
      title="Branches"
      count={locals.length}
      action={
        <IconButton title="Crear rama" onClick={() => setCreating((v) => !v)}>
          {creating ? <IconClose /> : <IconAdd />}
        </IconButton>
      }
    >
      {creating && (
        <div className="branch-form">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doCreate()}
            placeholder="nombre-de-rama"
          />
          <Button variant="primary" size="sm" onClick={doCreate}>
            Crear
          </Button>
        </div>
      )}
      <BranchTree
        node={localTree}
        depth={0}
        onCheckout={(b) => checkoutBranch(b.name)}
        onDelete={(b) => deleteBranch(b.name, false)}
        onMerge={(b) => mergeBranch(b.name)}
        onRebase={(b) => rebaseOnto(b.name)}
      />
    </CollapsibleSection>
  );
}
