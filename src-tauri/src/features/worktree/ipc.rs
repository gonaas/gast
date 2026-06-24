use std::path::PathBuf;

use tauri::State;

use super::model::{NewWorktree, Worktree};
use super::use_case;
use crate::shared::error::Result;
use crate::shared::runner::blocking;
use crate::Backend;

#[tauri::command]
pub async fn list_worktrees(backend: State<'_, Backend>, repo: String) -> Result<Vec<Worktree>> {
    let worktree = backend.worktree.clone();
    blocking(move || use_case::list(worktree.as_ref(), &PathBuf::from(repo))).await
}

#[tauri::command]
pub async fn add_worktree(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
    branch: String,
    new_branch: bool,
    start: String,
) -> Result<Vec<Worktree>> {
    let worktree = backend.worktree.clone();
    blocking(move || {
        let spec = NewWorktree {
            path,
            branch,
            new_branch,
            start,
        };
        use_case::add(worktree.as_ref(), &PathBuf::from(repo), spec)
    })
    .await
}

#[tauri::command]
pub async fn remove_worktree(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
    force: bool,
) -> Result<Vec<Worktree>> {
    let worktree = backend.worktree.clone();
    blocking(move || use_case::remove(worktree.as_ref(), &PathBuf::from(repo), &path, force)).await
}

#[tauri::command]
pub async fn prune_worktrees(backend: State<'_, Backend>, repo: String) -> Result<Vec<Worktree>> {
    let worktree = backend.worktree.clone();
    blocking(move || use_case::prune(worktree.as_ref(), &PathBuf::from(repo))).await
}
