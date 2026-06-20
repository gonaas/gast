use std::path::PathBuf;

use tauri::State;

use super::use_case;
use crate::shared::error::Result;
use crate::Backend;

#[tauri::command]
pub fn list_tags(backend: State<'_, Backend>, repo: String) -> Result<Vec<String>> {
    use_case::list(backend.tag.as_ref(), &PathBuf::from(repo))
}

#[tauri::command]
pub fn create_tag(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
    message: String,
    target: String,
) -> Result<Vec<String>> {
    use_case::create(backend.tag.as_ref(), &PathBuf::from(repo), &name, &message, &target)
}

#[tauri::command]
pub fn delete_tag(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
) -> Result<Vec<String>> {
    use_case::delete(backend.tag.as_ref(), &PathBuf::from(repo), &name)
}
