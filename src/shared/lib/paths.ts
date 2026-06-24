export function samePath(a: string, b: string): boolean {
  return a.replace(/\/+$/, "") === b.replace(/\/+$/, "");
}

// Nombre del archivo (último segmento del path). "src/app/App.tsx" -> "App.tsx".
export function fileName(path: string): string {
  const clean = path.replace(/\/+$/, "");
  const i = clean.lastIndexOf("/");
  return i === -1 ? clean : clean.slice(i + 1);
}

// Carpeta contenedora con prefijo "/" (estilo Fork). "src/app/App.tsx" -> "/src/app";
// un archivo en la raíz -> "/".
export function fileLocation(path: string): string {
  const clean = path.replace(/\/+$/, "");
  const i = clean.lastIndexOf("/");
  return i === -1 ? "/" : "/" + clean.slice(0, i);
}
