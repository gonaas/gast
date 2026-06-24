use std::path::PathBuf;

use tauri::State;

use super::model::{RecentRepo, Repo};
use super::use_case;
use crate::shared::error::Result;
use crate::shared::runner::blocking;
use crate::Backend;

#[tauri::command]
pub async fn open_repo(backend: State<'_, Backend>, path: String) -> Result<Repo> {
    let repo = backend.repo.clone();
    let recent = backend.recent_repos.clone();
    blocking(move || use_case::open(repo.as_ref(), recent.as_ref(), &PathBuf::from(path))).await
}

#[tauri::command]
pub async fn recent_repos(backend: State<'_, Backend>) -> Result<Vec<RecentRepo>> {
    let recent = backend.recent_repos.clone();
    blocking(move || use_case::list_recent(recent.as_ref())).await
}

#[tauri::command]
pub async fn forget_recent_repo(
    backend: State<'_, Backend>,
    path: String,
) -> Result<Vec<RecentRepo>> {
    let recent = backend.recent_repos.clone();
    blocking(move || use_case::forget(recent.as_ref(), &path)).await
}
