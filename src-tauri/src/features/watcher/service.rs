use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Duration;

use notify::{RecommendedWatcher, RecursiveMode};
use notify_debouncer_mini::{new_debouncer, DebounceEventResult, DebouncedEvent, Debouncer};
use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::shared::error::{AppError, Result};

// Usamos el debouncer "mini" (no el "full") a propósito: `notify-debouncer-full`
// mantiene un cache de file-ids y al registrar un watch recursivo recorre TODO
// el árbol con `WalkDir` para sembrarlo. En un monorepo eso significa caminar
// `node_modules/`, `target/`, etc. de entrada → cuelga la app al abrir el repo.
// `mini` no tiene ese cache: solo coalesce eventos por ruta, sin escaneo previo.
type RepoDebouncer = Debouncer<RecommendedWatcher>;

/// Estado gestionado por Tauri: el debouncer del repo vigilado actualmente.
/// Solo se vigila un repo a la vez (el de la pestaña activa); al cambiar de
/// repo se reemplaza (drop = stop del watcher anterior).
#[derive(Default)]
pub struct WatcherState(Mutex<Option<RepoDebouncer>>);

/// Payload del evento `repo-changed` enviado al frontend.
#[derive(Clone, Serialize)]
struct ChangePayload {
    path: String,
    /// "git" → cambió `.git` (HEAD/index/refs): el frontend hace refresh completo.
    /// "worktree" → solo archivos del árbol de trabajo: recarga ligera del status.
    kind: &'static str,
}

enum Class {
    Ignore,
    Git,
    Worktree,
}

/// Empieza (o reemplaza) la vigilancia del repo indicado.
pub fn start(app: AppHandle, state: &WatcherState, repo: PathBuf) -> Result<()> {
    let mut guard = state.0.lock().map_err(|_| poisoned())?;
    // Suelta el watcher previo antes de crear el nuevo.
    *guard = None;

    let app_handle = app.clone();
    let repo_for_handler = repo.clone();
    let mut debouncer = new_debouncer(
        Duration::from_millis(400),
        move |result: DebounceEventResult| {
            if let Ok(events) = result {
                handle_events(&app_handle, &repo_for_handler, &events);
            }
        },
    )
    .map_err(|e| AppError::Watch(e.to_string()))?;

    debouncer
        .watcher()
        .watch(&repo, RecursiveMode::Recursive)
        .map_err(|e| AppError::Watch(e.to_string()))?;

    *guard = Some(debouncer);
    Ok(())
}

/// Detiene la vigilancia (al cerrar el último repo).
pub fn stop(state: &WatcherState) -> Result<()> {
    let mut guard = state.0.lock().map_err(|_| poisoned())?;
    *guard = None;
    Ok(())
}

fn handle_events(app: &AppHandle, repo: &Path, events: &[DebouncedEvent]) {
    let mut touched_git = false;
    let mut touched_worktree = false;

    for event in events {
        match classify(repo, &event.path) {
            Class::Git => touched_git = true,
            Class::Worktree => touched_worktree = true,
            Class::Ignore => {}
        }
    }

    // `.git` es el cambio más amplio (rama/commit) → tiene prioridad.
    let kind = if touched_git {
        "git"
    } else if touched_worktree {
        "worktree"
    } else {
        return;
    };

    let _ = app.emit(
        "repo-changed",
        ChangePayload {
            path: repo.display().to_string(),
            kind,
        },
    );
}

/// Clasifica una ruta absoluta de un evento del sistema de archivos.
fn classify(repo: &Path, path: &Path) -> Class {
    let rel = match path.strip_prefix(repo) {
        Ok(rel) => rel,
        Err(_) => return Class::Ignore,
    };

    let comps: Vec<&str> = rel
        .components()
        .filter_map(|c| c.as_os_str().to_str())
        .collect();
    let Some(first) = comps.first() else {
        return Class::Ignore;
    };

    // Directorios ruidosos del working tree (normalmente en .gitignore). En
    // monorepos, dev servers y build tools (vite, next, turbo…) escriben aquí
    // sin parar; si no los filtramos el watcher recarga en bucle.
    if comps.iter().any(|c| {
        matches!(
            *c,
            "node_modules"
                | "target"
                | "dist"
                | ".next"
                | ".turbo"
                | ".cache"
                | ".parcel-cache"
                | ".svelte-kit"
                | ".nuxt"
                | ".output"
                | ".vite"
                | "coverage"
        )
    }) {
        return Class::Ignore;
    }

    if *first == ".git" {
        return classify_git(&comps[1..]);
    }

    Class::Worktree
}

/// Clasifica una ruta dentro de `.git`: solo nos interesan HEAD/index/refs.
fn classify_git(rest: &[&str]) -> Class {
    let Some(inner) = rest.first() else {
        return Class::Ignore;
    };
    // Cambios de estado relevantes: stage (index), commit/checkout (HEAD, refs),
    // merge en curso (MERGE_HEAD).
    if matches!(*inner, "HEAD" | "index" | "MERGE_HEAD") || *inner == "refs" {
        return Class::Git;
    }
    // Ruido: objetos, reflogs, locks, FETCH_HEAD, mensajes de commit, etc.
    Class::Ignore
}

fn poisoned() -> AppError {
    AppError::Watch("estado del watcher corrupto".into())
}
