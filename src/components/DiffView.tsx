import { useStore } from "../store";

// Renderiza un diff unificado coloreando según el prefijo de cada línea.
export function DiffView() {
  const { selectedPath, diffText } = useStore();
  if (!selectedPath) return null;

  const lines = diffText.split("\n");

  return (
    <div className="diff">
      <div className="diff-head">{selectedPath}</div>
      <pre>
        {lines.map((line, i) => (
          <div key={i} className={`dl ${lineClass(line)}`}>
            {line || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}

function lineClass(line: string): string {
  if (line.startsWith("<<<<<<<") || line.startsWith("=======") || line.startsWith(">>>>>>>"))
    return "conflict";
  if (line.startsWith("+++") || line.startsWith("---")) return "meta";
  if (line.startsWith("@@")) return "hunk";
  if (line.startsWith("diff ") || line.startsWith("index ")) return "meta";
  if (line.startsWith("+")) return "add";
  if (line.startsWith("-")) return "del";
  return "";
}
