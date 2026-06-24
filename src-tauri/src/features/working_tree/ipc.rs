use std::path::PathBuf;

use tauri::State;

use super::model::RepoStatus;
use super::use_case;
use crate::shared::error::Result;
use crate::shared::runner::blocking;
use crate::Backend;

#[tauri::command]
pub async fn repo_status(backend: State<'_, Backend>, repo: String) -> Result<RepoStatus> {
    let working_tree = backend.working_tree.clone();
    blocking(move || use_case::status(working_tree.as_ref(), &PathBuf::from(repo))).await
}

#[tauri::command]
pub async fn stage_file(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
) -> Result<RepoStatus> {
    let working_tree = backend.working_tree.clone();
    blocking(move || use_case::stage(working_tree.as_ref(), &PathBuf::from(repo), &path)).await
}

#[tauri::command]
pub async fn unstage_file(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
) -> Result<RepoStatus> {
    let working_tree = backend.working_tree.clone();
    blocking(move || use_case::unstage(working_tree.as_ref(), &PathBuf::from(repo), &path)).await
}

#[tauri::command]
pub async fn discard_file(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
) -> Result<RepoStatus> {
    let working_tree = backend.working_tree.clone();
    blocking(move || use_case::discard(working_tree.as_ref(), &PathBuf::from(repo), &path)).await
}

#[tauri::command]
pub async fn commit(
    backend: State<'_, Backend>,
    repo: String,
    message: String,
    amend: bool,
) -> Result<RepoStatus> {
    let working_tree = backend.working_tree.clone();
    blocking(move || use_case::commit(working_tree.as_ref(), &PathBuf::from(repo), &message, amend))
        .await
}
