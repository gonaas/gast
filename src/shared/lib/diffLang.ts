import { refractor } from "refractor";
import jsx from "refractor/lang/jsx.js";
import tsx from "refractor/lang/tsx.js";
import toml from "refractor/lang/toml.js";

// El `refractor` por defecto ya trae la mayoría de lenguajes (typescript, javascript,
// python, rust, json, css, markdown, markup, bash, yaml…); registramos los que faltan.
refractor.register(jsx);
refractor.register(tsx);
refractor.register(toml);

export { refractor };

// Mapea la extensión del archivo al lenguaje de Prism/refractor. Devuelve undefined
// si no hay match (el diff se muestra sin resaltado de sintaxis).
const BY_EXT: Record<string, string> = {
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  tsx: "tsx",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "jsx",
  py: "python",
  rs: "rust",
  json: "json",
  css: "css",
  scss: "css",
  md: "markdown",
  markdown: "markdown",
  html: "markup",
  htm: "markup",
  xml: "markup",
  svg: "markup",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  toml: "toml",
  yml: "yaml",
  yaml: "yaml",
};

export function languageForPath(path: string | null): string | undefined {
  if (!path) return undefined;
  const clean = path.replace(/[?#].*$/, "");
  const dot = clean.lastIndexOf(".");
  if (dot === -1) return undefined;
  const ext = clean.slice(dot + 1).toLowerCase();
  return BY_EXT[ext];
}
