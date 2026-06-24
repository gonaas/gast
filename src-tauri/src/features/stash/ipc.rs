use std::path::PathBuf;

use tauri::State;

use super::model::Stash;
use super::use_case;
use crate::shared::error::Result;
use crate::shared::runner::blocking;
use crate::Backend;

#[tauri::command]
pub async fn list_stashes(backend: State<'_, Backend>, repo: String) -> Result<Vec<Stash>> {
    let stash = backend.stash.clone();
    blocking(move || use_case::list(stash.as_ref(), &PathBuf::from(repo))).await
}

#[tauri::command]
pub async fn save_stash(
    backend: State<'_, Backend>,
    repo: String,
    message: String,
) -> Result<Vec<Stash>> {
    let stash = backend.stash.clone();
    blocking(move || use_case::save(stash.as_ref(), &PathBuf::from(repo), &message)).await
}

#[tauri::command]
pub async fn apply_stash(
    backend: State<'_, Backend>,
    repo: String,
    reference: String,
) -> Result<Vec<Stash>> {
    let stash = backend.stash.clone();
    blocking(move || use_case::apply(stash.as_ref(), &PathBuf::from(repo), &reference)).await
}

#[tauri::command]
pub async fn pop_stash(
    backend: State<'_, Backend>,
    repo: String,
    reference: String,
) -> Result<Vec<Stash>> {
    let stash = backend.stash.clone();
    blocking(move || use_case::pop(stash.as_ref(), &PathBuf::from(repo), &reference)).await
}

#[tauri::command]
pub async fn drop_stash(
    backend: State<'_, Backend>,
    repo: String,
    reference: String,
) -> Result<Vec<Stash>> {
    let stash = backend.stash.clone();
    blocking(move || use_case::drop(stash.as_ref(), &PathBuf::from(repo), &reference)).await
}
