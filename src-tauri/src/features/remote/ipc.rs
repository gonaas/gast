use std::path::PathBuf;

use tauri::State;

use super::model::{PullStrategy, Remote};
use super::use_case;
use crate::shared::error::Result;
use crate::Backend;

#[tauri::command]
pub fn fetch(backend: State<'_, Backend>, repo: String) -> Result<String> {
    use_case::fetch(backend.remote.as_ref(), &PathBuf::from(repo))
}

#[tauri::command]
pub fn pull(backend: State<'_, Backend>, repo: String, strategy: PullStrategy) -> Result<String> {
    use_case::pull(backend.remote.as_ref(), &PathBuf::from(repo), strategy)
}

#[tauri::command]
pub fn push(backend: State<'_, Backend>, repo: String) -> Result<String> {
    use_case::push(backend.remote.as_ref(), &PathBuf::from(repo))
}

#[tauri::command]
pub fn list_remotes(backend: State<'_, Backend>, repo: String) -> Result<Vec<Remote>> {
    use_case::list(backend.remote.as_ref(), &PathBuf::from(repo))
}

#[tauri::command]
pub fn add_remote(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
    url: String,
) -> Result<Vec<Remote>> {
    use_case::add(backend.remote.as_ref(), &PathBuf::from(repo), &name, &url)
}

#[tauri::command]
pub fn remove_remote(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
) -> Result<Vec<Remote>> {
    use_case::remove(backend.remote.as_ref(), &PathBuf::from(repo), &name)
}

#[tauri::command]
pub fn rename_remote(
    backend: State<'_, Backend>,
    repo: String,
    old: String,
    new: String,
) -> Result<Vec<Remote>> {
    use_case::rename(backend.remote.as_ref(), &PathBuf::from(repo), &old, &new)
}
