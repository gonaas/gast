use std::path::PathBuf;

use tauri::State;

use super::model::RepoStatus;
use super::use_case;
use crate::shared::error::Result;
use crate::Backend;

#[tauri::command]
pub fn repo_status(backend: State<'_, Backend>, repo: String) -> Result<RepoStatus> {
    use_case::status(backend.working_tree.as_ref(), &PathBuf::from(repo))
}

#[tauri::command]
pub fn stage_file(backend: State<'_, Backend>, repo: String, path: String) -> Result<RepoStatus> {
    use_case::stage(backend.working_tree.as_ref(), &PathBuf::from(repo), &path)
}

#[tauri::command]
pub fn unstage_file(backend: State<'_, Backend>, repo: String, path: String) -> Result<RepoStatus> {
    use_case::unstage(backend.working_tree.as_ref(), &PathBuf::from(repo), &path)
}

#[tauri::command]
pub fn discard_file(backend: State<'_, Backend>, repo: String, path: String) -> Result<RepoStatus> {
    use_case::discard(backend.working_tree.as_ref(), &PathBuf::from(repo), &path)
}

#[tauri::command]
pub fn commit(
    backend: State<'_, Backend>,
    repo: String,
    message: String,
    amend: bool,
) -> Result<RepoStatus> {
    use_case::commit(backend.working_tree.as_ref(), &PathBuf::from(repo), &message, amend)
}
