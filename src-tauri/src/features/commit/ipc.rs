use std::path::PathBuf;

use tauri::State;

use super::model::{Commit, GraphRow};
use super::use_case;
use crate::features::working_tree::model::FileStatus;
use crate::shared::error::Result;
use crate::Backend;

#[tauri::command]
pub fn commit_log(backend: State<'_, Backend>, repo: String, limit: usize) -> Result<Vec<Commit>> {
    use_case::log(backend.commit.as_ref(), &PathBuf::from(repo), limit)
}

#[tauri::command]
pub fn commit_graph(
    backend: State<'_, Backend>,
    repo: String,
    limit: usize,
) -> Result<Vec<GraphRow>> {
    use_case::commit_graph(backend.commit.as_ref(), &PathBuf::from(repo), limit)
}

#[tauri::command]
pub fn file_diff(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
    staged: bool,
) -> Result<String> {
    use_case::file_diff(backend.commit.as_ref(), &PathBuf::from(repo), &path, staged)
}

#[tauri::command]
pub fn untracked_diff(backend: State<'_, Backend>, repo: String, path: String) -> Result<String> {
    use_case::untracked_diff(backend.commit.as_ref(), &PathBuf::from(repo), &path)
}

#[tauri::command]
pub fn commit_files(
    backend: State<'_, Backend>,
    repo: String,
    hash: String,
) -> Result<Vec<FileStatus>> {
    use_case::commit_files(backend.commit.as_ref(), &PathBuf::from(repo), &hash)
}

#[tauri::command]
pub fn commit_diff(
    backend: State<'_, Backend>,
    repo: String,
    hash: String,
    path: String,
) -> Result<String> {
    use_case::commit_diff(backend.commit.as_ref(), &PathBuf::from(repo), &hash, &path)
}
