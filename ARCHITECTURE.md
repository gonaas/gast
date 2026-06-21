# Arquitectura del frontend

El front (`src/`) es **feature-first hexagonal**, espejando los slices del backend Rust
(`src-tauri/src/features/*`). El objetivo: que la lógica de cada dominio viva en su slice,
que no haya acoplamiento cruzado entre features, y que el shell de la app sea fino.

## Capas

```
src/
├── app/        Composition root: shell de UI. Cablea features + shared.
├── features/   Un slice por dominio (mismos nombres que el backend).
│   └── <x>/    <x>.api.ts (puerto a Tauri) · <x>.slice.ts (estado+acciones) · components/
└── shared/     Kernel: lo importa todo el mundo.
    ├── store.ts          El store único (combina los slices). Ver excepción abajo.
    ├── ui/               Design system (compound components, icons). Nada de controles crudos.
    ├── components/       Presentacionales cross-feature (DiffView, FileRow, branch-tree).
    ├── lib/              Utilidades puras (useResizable, branchTree, paths).
    ├── api/              client.ts (wrapper invoke) · dialog.ts (diálogos nativos).
    ├── types.ts          DTOs espejo de las structs de Rust.
    ├── diff.slice.ts     Estado del diff visible (selectedPath/diffText): cross-cutting.
    └── ui.slice.ts       Estado de shell (view).
```

## La regla (dependencias hacia adentro)

- **`app/`** → puede importar `features/*` y `shared/*` (es el composition root).
- **`features/<x>/`** → solo importa `shared/*` y **su propia carpeta**. Nunca otro feature, nunca `app`.
- **`shared/`** → solo `shared/*`.
- La coordinación entre slices ocurre **únicamente a través del `Store` combinado vía `get()`**.
  El import de `Store` en cada slice es `import type` (lo borra TS): el ciclo es solo de tipos.

**Excepción única:** `shared/store.ts` es el *composition root del estado*: es el único módulo
de `shared` que importa slices de features (para combinarlos). Es inherente al patrón "slices"
de Zustand. Los slices solo importan de vuelta el **tipo** `Store` (sin runtime).

Se enforcea con ESLint (`eslint.config.js`, `eslint-plugin-boundaries`). Para activar:

```bash
npm i -D eslint typescript-eslint eslint-plugin-boundaries
npm run lint
```

## El store (patrón "slices" de Zustand)

`shared/store.ts` crea **un** store combinando un `StateCreator` por feature. El estado
combinado es la unión de todos los slices, así que `useStore((s) => s.x)` ve todo.

Cada slice:
- importa **solo** su `*.api`, `shared/*` y el **tipo** `Store`;
- alcanza a los demás slices por `get()` (nunca importa otro módulo de slice);
- expone un `loadX(repoPath)` que `repo.refresh()` dispara en paralelo.

`loading`/`error` son globales (los posee el slice `repo`); cualquier slice los escribe con
`set({ loading, error })` porque `set` opera sobre todo el `Store`.

## Convenciones

- **Un puerto por slice:** todas las llamadas a Tauri de un dominio viven en `features/<x>/<x>.api.ts`
  (vía `shared/api/client.ts`). Ningún componente llama a `invoke` directo.
- **Presentacional cross-feature → `shared/components/`:** si un componente lo usan dos features
  (p.ej. `DiffView`, `FileRow`, `branch-tree`), va a shared, no a un feature.
- **Diff cross-cutting:** `selectedPath`/`diffText` los producen working-tree, commit e integration;
  por eso viven en `shared/diff.slice.ts` (+ `clearDiff()`), no en un feature.

## Cómo agregar un feature

1. `features/<x>/<x>.api.ts` — funciones que envuelven `call("comando", {...})`.
2. `features/<x>/<x>.slice.ts` — `interface XSlice` + `createXSlice: StateCreator<Store, [], [], XSlice>`.
3. Sumar `createXSlice` + `XSlice` al `Store` y al `create()` en `shared/store.ts`.
4. `features/<x>/components/*` — UI del feature; importa `@/shared/*` y su propia carpeta.
5. Montar el componente desde `app/` (o desde otra sección de `app/`).
