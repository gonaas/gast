import type { OpenTab } from "@/shared/types";

// Cuando dos repos abiertos comparten el mismo nombre de carpeta (p.ej. un repo
// y su worktree, ambos "monorepo"), las pestañas quedan indistinguibles. Estilo
// VS Code: devolvemos, por cada path, el mínimo de segmentos del directorio
// padre necesarios para diferenciarlas. Si el nombre es único → sin sufijo.
export function disambiguateTabs(tabs: OpenTab[]): Map<string, string> {
  const suffixes = new Map<string, string>();

  // Agrupar por nombre mostrado.
  const groups = new Map<string, OpenTab[]>();
  for (const t of tabs) {
    const g = groups.get(t.name);
    if (g) g.push(t);
    else groups.set(t.name, [t]);
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue; // sin colisión → sin sufijo

    // Segmentos del directorio padre (la hoja es idéntica en todo el grupo).
    const parents = group.map((t) => parentSegments(t.path));

    // Mínima profundidad d cuyas colas de d segmentos sean todas distintas.
    // En la profundidad máxima siempre lo son: los paths son únicos.
    const maxDepth = Math.max(1, ...parents.map((p) => p.length));
    let depth = 1;
    for (; depth < maxDepth; depth++) {
      const tails = parents.map((p) => tail(p, depth).join("/"));
      if (new Set(tails).size === group.length) break;
    }

    group.forEach((t, i) => {
      const seg = tail(parents[i], depth).join("/");
      if (seg) suffixes.set(t.path, seg);
    });
  }

  return suffixes;
}

// Segmentos del path sin la última hoja (el nombre mostrado). Soporta "/" y "\".
function parentSegments(path: string): string[] {
  const segs = path.split(/[\\/]/).filter(Boolean);
  segs.pop();
  return segs;
}

function tail<T>(arr: T[], n: number): T[] {
  return arr.slice(Math.max(0, arr.length - n));
}
