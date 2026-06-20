use std::path::PathBuf;

use tauri::State;

use super::model::{RecentRepo, Repo};
use super::use_case;
use crate::shared::error::Result;
use crate::Backend;

#[tauri::command]
pub fn open_repo(backend: State<'_, Backend>, path: String) -> Result<Repo> {
    use_case::open(
        backend.repo.as_ref(),
        backend.recent_repos.as_ref(),
        &PathBuf::from(path),
    )
}

#[tauri::command]
pub fn recent_repos(backend: State<'_, Backend>) -> Result<Vec<RecentRepo>> {
    use_case::list_recent(backend.recent_repos.as_ref())
}

#[tauri::command]
pub fn forget_recent_repo(backend: State<'_, Backend>, path: String) -> Result<Vec<RecentRepo>> {
    use_case::forget(backend.recent_repos.as_ref(), &path)
}
