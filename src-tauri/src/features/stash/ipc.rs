use std::path::PathBuf;

use tauri::State;

use super::model::Stash;
use super::use_case;
use crate::shared::error::Result;
use crate::Backend;

#[tauri::command]
pub fn list_stashes(backend: State<'_, Backend>, repo: String) -> Result<Vec<Stash>> {
    use_case::list(backend.stash.as_ref(), &PathBuf::from(repo))
}

#[tauri::command]
pub fn save_stash(
    backend: State<'_, Backend>,
    repo: String,
    message: String,
) -> Result<Vec<Stash>> {
    use_case::save(backend.stash.as_ref(), &PathBuf::from(repo), &message)
}

#[tauri::command]
pub fn apply_stash(
    backend: State<'_, Backend>,
    repo: String,
    reference: String,
) -> Result<Vec<Stash>> {
    use_case::apply(backend.stash.as_ref(), &PathBuf::from(repo), &reference)
}

#[tauri::command]
pub fn pop_stash(
    backend: State<'_, Backend>,
    repo: String,
    reference: String,
) -> Result<Vec<Stash>> {
    use_case::pop(backend.stash.as_ref(), &PathBuf::from(repo), &reference)
}

#[tauri::command]
pub fn drop_stash(
    backend: State<'_, Backend>,
    repo: String,
    reference: String,
) -> Result<Vec<Stash>> {
    use_case::drop(backend.stash.as_ref(), &PathBuf::from(repo), &reference)
}
