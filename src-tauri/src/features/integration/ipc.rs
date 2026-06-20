use std::path::PathBuf;

use tauri::State;

use super::model::ConflictState;
use super::use_case;
use crate::shared::error::Result;
use crate::Backend;

#[tauri::command]
pub fn merge_branch(backend: State<'_, Backend>, repo: String, name: String) -> Result<String> {
    use_case::merge(backend.integration.as_ref(), &PathBuf::from(repo), &name)
}

#[tauri::command]
pub fn rebase_onto(backend: State<'_, Backend>, repo: String, onto: String) -> Result<String> {
    use_case::rebase(backend.integration.as_ref(), &PathBuf::from(repo), &onto)
}

#[tauri::command]
pub fn conflict_state(backend: State<'_, Backend>, repo: String) -> Result<ConflictState> {
    use_case::conflict_state(backend.integration.as_ref(), &PathBuf::from(repo))
}

#[tauri::command]
pub fn conflict_content(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
) -> Result<String> {
    use_case::conflict_content(backend.integration.as_ref(), &PathBuf::from(repo), &path)
}

#[tauri::command]
pub fn resolve_ours(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
) -> Result<ConflictState> {
    use_case::resolve_ours(backend.integration.as_ref(), &PathBuf::from(repo), &path)
}

#[tauri::command]
pub fn resolve_theirs(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
) -> Result<ConflictState> {
    use_case::resolve_theirs(backend.integration.as_ref(), &PathBuf::from(repo), &path)
}

#[tauri::command]
pub fn mark_resolved(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
) -> Result<ConflictState> {
    use_case::mark_resolved(backend.integration.as_ref(), &PathBuf::from(repo), &path)
}

#[tauri::command]
pub fn abort_operation(backend: State<'_, Backend>, repo: String) -> Result<ConflictState> {
    use_case::abort(backend.integration.as_ref(), &PathBuf::from(repo))
}

#[tauri::command]
pub fn continue_operation(backend: State<'_, Backend>, repo: String) -> Result<ConflictState> {
    use_case::continue_op(backend.integration.as_ref(), &PathBuf::from(repo))
}
