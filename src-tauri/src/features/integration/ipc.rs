use std::path::PathBuf;

use tauri::State;

use super::model::ConflictState;
use super::use_case;
use crate::shared::error::Result;
use crate::shared::runner::blocking;
use crate::Backend;

#[tauri::command]
pub async fn merge_branch(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
) -> Result<String> {
    let integration = backend.integration.clone();
    blocking(move || use_case::merge(integration.as_ref(), &PathBuf::from(repo), &name)).await
}

#[tauri::command]
pub async fn rebase_onto(
    backend: State<'_, Backend>,
    repo: String,
    onto: String,
) -> Result<String> {
    let integration = backend.integration.clone();
    blocking(move || use_case::rebase(integration.as_ref(), &PathBuf::from(repo), &onto)).await
}

#[tauri::command]
pub async fn conflict_state(backend: State<'_, Backend>, repo: String) -> Result<ConflictState> {
    let integration = backend.integration.clone();
    blocking(move || use_case::conflict_state(integration.as_ref(), &PathBuf::from(repo))).await
}

#[tauri::command]
pub async fn conflict_content(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
) -> Result<String> {
    let integration = backend.integration.clone();
    blocking(move || use_case::conflict_content(integration.as_ref(), &PathBuf::from(repo), &path))
        .await
}

#[tauri::command]
pub async fn resolve_ours(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
) -> Result<ConflictState> {
    let integration = backend.integration.clone();
    blocking(move || use_case::resolve_ours(integration.as_ref(), &PathBuf::from(repo), &path))
        .await
}

#[tauri::command]
pub async fn resolve_theirs(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
) -> Result<ConflictState> {
    let integration = backend.integration.clone();
    blocking(move || use_case::resolve_theirs(integration.as_ref(), &PathBuf::from(repo), &path))
        .await
}

#[tauri::command]
pub async fn mark_resolved(
    backend: State<'_, Backend>,
    repo: String,
    path: String,
) -> Result<ConflictState> {
    let integration = backend.integration.clone();
    blocking(move || use_case::mark_resolved(integration.as_ref(), &PathBuf::from(repo), &path))
        .await
}

#[tauri::command]
pub async fn abort_operation(backend: State<'_, Backend>, repo: String) -> Result<ConflictState> {
    let integration = backend.integration.clone();
    blocking(move || use_case::abort(integration.as_ref(), &PathBuf::from(repo))).await
}

#[tauri::command]
pub async fn continue_operation(
    backend: State<'_, Backend>,
    repo: String,
) -> Result<ConflictState> {
    let integration = backend.integration.clone();
    blocking(move || use_case::continue_op(integration.as_ref(), &PathBuf::from(repo))).await
}
