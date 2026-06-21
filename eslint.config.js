// Enforcement de la regla de dependencias del front (ver ARCHITECTURE.md).
//
// Para activarlo:
//   npm i -D eslint typescript-eslint eslint-plugin-boundaries
//   npm run lint
//
// Regla: las dependencias apuntan hacia adentro.
//   app      -> shared, store, features, app
//   feature  -> shared, store, y SOLO su propia familia de feature
//   shared   -> shared, store
//   store    -> shared, store, features   (agregador de slices; única excepción)
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";

export default tseslint.config({
  files: ["src/**/*.{ts,tsx}"],
  plugins: { boundaries },
  settings: {
    // El orden importa: los patrones de archivo (store, root) van antes que el
    // glob de shared para que tengan prioridad.
    "boundaries/elements": [
      { type: "store", mode: "file", pattern: "src/shared/store.ts" },
      { type: "root", mode: "file", pattern: "src/main.tsx" },
      { type: "shared", pattern: "src/shared/**" },
      { type: "feature", pattern: "src/features/*/**", capture: ["family"] },
      { type: "app", pattern: "src/app/**" },
    ],
    "boundaries/ignore": ["**/*.css", "**/*.d.ts"],
  },
  rules: {
    "boundaries/no-unknown": "error",
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        rules: [
          { from: "store", allow: ["shared", "store", "feature"] },
          { from: "shared", allow: ["shared", "store"] },
          {
            from: "feature",
            allow: ["shared", "store", ["feature", { family: "${from.family}" }]],
          },
          { from: "app", allow: ["shared", "store", "feature", "app"] },
          { from: "root", allow: ["app", "shared", "store"] },
        ],
      },
    ],
  },
});
