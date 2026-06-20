# Roadmap — clon de Fork (por fases)

Objetivo: paridad de features con [Fork](https://git-fork.com/), priorizando una
gestión de **worktrees** sencilla y visual.

## Fase 1 — MVP (en curso)
- [x] Scaffold Tauri v2 + React/TS
- [x] Backend git por shell-out (runner)
- [x] Abrir / validar repositorio
- [x] Lista de commits (`--all`, con refs y padres)
- [x] Listado de ramas (locales y remotas, upstream, HEAD)
- [x] Estado del working tree (porcelain)
- [x] Worktrees: listar, crear, eliminar
- [ ] Selector de carpeta nativo para abrir repo
- [ ] Persistir repos recientes

## Fase 2 — Cliente git usable a diario
- [x] Diff de archivos (staged / unstaged / untracked), unificado coloreado
- [x] Stage / unstage / descartar por archivo
- [x] Crear commit (mensaje, amend)
- [x] Pull / push / fetch
- [x] Checkout de rama (`switch`) y de commit (detached)
- [x] Crear / borrar / renombrar ramas
- [x] Stash (crear, listar, aplicar, pop, soltar)
- [ ] Stage / unstage por *hunk*
- [ ] Progreso en vivo de operaciones de red

## Fase 3 — Grafo y colaboración
- [x] Grafo de commits real (carriles + líneas entre padres/hijos, en SVG)
- [x] Merge y rebase (no interactivo)
- [x] Tags (listar, crear anotado/ligero, borrar)
- [x] Resolución de conflictos asistida (ours/theirs/manual, abortar, continuar)
- [x] Remotes (añadir / renombrar / eliminar)
- [ ] Rebase interactivo
- [ ] Cherry-pick, revert, reset (soft/mixed/hard)

## Fase 4 — Worktrees de lujo (diferenciador)
- [x] Crear worktree desde cualquier rama/commit (selector de "partir de")
- [x] Detección de worktrees prunables + limpieza (`prune`)
- [x] Vista que muestra qué rama está en qué worktree
- [x] Integración: abrir worktree en VS Code / Terminal / Finder (macOS)
- [ ] Plantillas: "worktree por PR" / "worktree por issue"
- [ ] Abrir en editor/terminal en Windows y Linux
- [ ] Lock / unlock de worktrees

## Fase 5 — Pulido y plataforma
- [ ] Submódulos
- [ ] LFS
- [ ] Hooks visibles / editor de config
- [ ] Búsqueda de commits / archivos / contenido (`git log -S`)
- [ ] Blame y file history
- [ ] Atajos de teclado, temas claro/oscuro
- [ ] Auto-update (tauri-plugin-updater)
- [ ] Builds firmados para macOS / Windows / Linux
