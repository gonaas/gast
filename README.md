# ast-git

Cliente Git de escritorio, open source, inspirado en [Fork](https://git-fork.com/),
con **gestión de worktrees** como ciudadano de primera clase.

- **Backend:** Rust (Tauri v2), hablando con el binario `git` por debajo (shell out).
- **Frontend:** React + TypeScript + Vite.
- **Licencia:** MIT.

> Estado: **Fase 1 (MVP)** — abrir repo, grafo/lista de commits, ramas, estado del
> working tree y CRUD de worktrees. Ver [ROADMAP.md](./ROADMAP.md).

## Requisitos

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 18+ y [pnpm](https://pnpm.io/) (o npm)
- `git` en el PATH

En macOS también necesitas las herramientas de línea de comandos de Xcode
(`xcode-select --install`).

## Puesta en marcha

```bash
# 1. Instalar dependencias del frontend
pnpm install            # o: npm install

# 2. Instalar el CLI de Tauri (si no usas el de devDependencies)
#    ya viene en devDependencies, así que pnpm tauri funciona directamente

# 3. Arrancar en modo desarrollo (compila Rust + abre la ventana)
pnpm tauri dev

# 4. Build de producción
pnpm tauri build
```

> La primera compilación de Rust tarda un rato (descarga y compila Tauri).

## Iconos

El bundle final necesita iconos. Genera todos los tamaños a partir de un PNG:

```bash
pnpm tauri icon ruta/a/tu-logo.png
```

## Tests

```bash
# Tests unitarios de los parsers de git (Rust)
cd src-tauri && cargo test

# Comprobación de tipos del frontend
pnpm exec tsc --noEmit

# Verificación ejecutable: corre cada comando git que usa el backend
# contra el git real y comprueba los formatos de salida.
bash scripts/verify-git-commands.sh
```

Los parsers (`log`, `branch`, `status`, `worktree`) están separados de la
ejecución de git, así que se testean con fixtures sin necesidad de un repo real.

## Arquitectura

```
src/                  Frontend React + TS
  api/git.ts          Wrapper tipado sobre invoke() de Tauri
  components/         UI (sidebar, commits, worktrees, status)
  store.ts            Estado global (zustand)
  types.ts            Tipos espejo de las structs de Rust

src-tauri/src/
  git/                Toda la lógica de git (shell out)
    runner.rs         Ejecuta `git -C <repo> ...` y captura salida
    repo.rs           Abrir/validar repositorio
    log.rs            Historial de commits
    branch.rs         Listado de ramas
    status.rs         Estado del working tree
    worktree.rs       Listar / crear / borrar worktrees
    diff.rs           Diff unificado (staged / unstaged / untracked)
    changes.rs        Stage / unstage / descartar / commit
    remote.rs         Fetch / pull / push
  commands.rs         Comandos expuestos al frontend (#[tauri::command])
  lib.rs              Builder de Tauri + registro de comandos
```

La idea: el módulo `git` no sabe nada de Tauri (es Rust puro y testeable), y
`commands.rs` es la fina capa que lo conecta con la UI.
