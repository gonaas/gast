use std::path::PathBuf;

use tauri::State;

use super::use_case;
use crate::shared::error::Result;
use crate::shared::runner::blocking;
use crate::Backend;

#[tauri::command]
pub async fn list_tags(backend: State<'_, Backend>, repo: String) -> Result<Vec<String>> {
    let tag = backend.tag.clone();
    blocking(move || use_case::list(tag.as_ref(), &PathBuf::from(repo))).await
}

#[tauri::command]
pub async fn create_tag(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
    message: String,
    target: String,
) -> Result<Vec<String>> {
    let tag = backend.tag.clone();
    blocking(move || use_case::create(tag.as_ref(), &PathBuf::from(repo), &name, &message, &target))
        .await
}

#[tauri::command]
pub async fn delete_tag(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
) -> Result<Vec<String>> {
    let tag = backend.tag.clone();
    blocking(move || use_case::delete(tag.as_ref(), &PathBuf::from(repo), &name)).await
}
