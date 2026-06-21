use std::path::PathBuf;

use tauri::State;

use super::model::{NewWorktree, Worktree};
use super::use_case;
use crate::shared::error::Result;
use crate::Backend;

#[tauri::command]
pub fn list_worktrees(backend: State<'_, Backend>, repo: String) -> Result<Vec<Worktree>> {
    use_case::list(backend.worktree.as_ref(), &PathBuf::from(repo))
}

#[tauri::command]
pub fn add_worktree(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
    branch: String,
    new_branch: bool,
    start: String,
) -> Result<Vec<Worktree>> {
    let spec = NewWorktree {
        path,
        branch,
        new_branch,
        start,
    };
    use_case::add(backend.worktree.as_ref(), &PathBuf::from(repo), spec)
}

#[tauri::command]
pub fn remove_worktree(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
    force: bool,
) -> Result<Vec<Worktree>> {
    use_case::remove(
        backend.worktree.as_ref(),
        &PathBuf::from(repo),
        &path,
        force,
    )
}

#[tauri::command]
pub fn prune_worktrees(backend: State<'_, Backend>, repo: String) -> Result<Vec<Worktree>> {
    use_case::prune(backend.worktree.as_ref(), &PathBuf::from(repo))
}
