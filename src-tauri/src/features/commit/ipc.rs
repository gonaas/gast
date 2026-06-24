use std::path::PathBuf;

use tauri::State;

use super::model::History;
use super::use_case;
use crate::features::working_tree::model::FileStatus;
use crate::shared::error::Result;
use crate::shared::runner::blocking;
use crate::Backend;

#[tauri::command]
pub async fn commit_history(
    backend: State<'_, Backend>,
    repo: String,
    limit: usize,
) -> Result<History> {
    let commit = backend.commit.clone();
    blocking(move || use_case::history(commit.as_ref(), &PathBuf::from(repo), limit)).await
}

#[tauri::command]
pub async fn file_diff(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
    staged: bool,
) -> Result<String> {
    let commit = backend.commit.clone();
    blocking(move || use_case::file_diff(commit.as_ref(), &PathBuf::from(repo), &path, staged))
        .await
}

#[tauri::command]
pub async fn untracked_diff(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
) -> Result<String> {
    let commit = backend.commit.clone();
    blocking(move || use_case::untracked_diff(commit.as_ref(), &PathBuf::from(repo), &path)).await
}

#[tauri::command]
pub async fn commit_files(
    backend: State<'_, Backend>,
    repo: String,
    hash: String,
) -> Result<Vec<FileStatus>> {
    let commit = backend.commit.clone();
    blocking(move || use_case::commit_files(commit.as_ref(), &PathBuf::from(repo), &hash)).await
}

#[tauri::command]
pub async fn commit_diff(
    backend: State<'_, Backend>,
    repo: String,
    hash: String,
    path: String,
) -> Result<String> {
    let commit = backend.commit.clone();
    blocking(move || use_case::commit_diff(commit.as_ref(), &PathBuf::from(repo), &hash, &path))
        .await
}
