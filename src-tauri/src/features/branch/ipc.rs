use std::path::PathBuf;

use tauri::State;

use super::model::Branch;
use super::use_case;
use crate::shared::error::Result;
use crate::Backend;

#[tauri::command]
pub fn list_branches(backend: State<'_, Backend>, repo: String) -> Result<Vec<Branch>> {
    use_case::list(backend.branch.as_ref(), &PathBuf::from(repo))
}

#[tauri::command]
pub fn checkout_branch(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
) -> Result<Vec<Branch>> {
    use_case::switch(backend.branch.as_ref(), &PathBuf::from(repo), &name)
}

#[tauri::command]
pub fn checkout_commit(
    backend: State<'_, Backend>,
    repo: String,
    hash: String,
) -> Result<Vec<Branch>> {
    use_case::switch_detached(backend.branch.as_ref(), &PathBuf::from(repo), &hash)
}

#[tauri::command]
pub fn create_branch(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
    start: String,
) -> Result<Vec<Branch>> {
    use_case::create(backend.branch.as_ref(), &PathBuf::from(repo), &name, &start)
}

#[tauri::command]
pub fn delete_branch(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
    force: bool,
) -> Result<Vec<Branch>> {
    use_case::delete(backend.branch.as_ref(), &PathBuf::from(repo), &name, force)
}

#[tauri::command]
pub fn rename_branch(
    backend: State<'_, Backend>,
    repo: String,
    old: String,
    new: String,
) -> Result<Vec<Branch>> {
    use_case::rename(backend.branch.as_ref(), &PathBuf::from(repo), &old, &new)
}
