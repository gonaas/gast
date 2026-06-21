import type { Branch } from "@/shared/types";

export interface BranchNode {
  name: string;
  path: string;
  folders: BranchNode[];
  leaves: Branch[];
}

function emptyNode(name: string, path: string): BranchNode {
  return { name, path, folders: [], leaves: [] };
}

export function buildBranchTree(branches: Branch[], stripRemote = false): BranchNode {
  const root = emptyNode("", "");

  for (const branch of branches) {
    const full = branch.name;
    let segments = full.split("/");
    if (stripRemote && segments.length > 1) {
      segments = segments.slice(1);
    }

    let node = root;
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i];
      const childPath = node.path ? `${node.path}/${seg}` : seg;
      let child = node.folders.find((f) => f.name === seg);
      if (!child) {
        child = emptyNode(seg, childPath);
        node.folders.push(child);
      }
      node = child;
    }
    node.leaves.push(branch);
  }

  sortNode(root);
  return root;
}

function sortNode(node: BranchNode): void {
  node.folders.sort((a, b) => a.name.localeCompare(b.name));
  node.leaves.sort((a, b) => a.name.localeCompare(b.name));
  node.folders.forEach(sortNode);
}
