use std::path::PathBuf;

use tauri::State;

use super::use_case;
use crate::shared::error::Result;
use crate::Backend;

#[tauri::command]
pub fn generate_commit_message(backend: State<'_, Backend>, repo: String) -> Result<String> {
    use_case::commit_message(backend.assistant.as_ref(), &PathBuf::from(repo))
}
