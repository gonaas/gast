use std::path::PathBuf;

use tauri::State;

use super::use_case;
use crate::shared::error::Result;
use crate::shared::runner::blocking;
use crate::Backend;

#[tauri::command]
pub async fn generate_commit_message(backend: State<'_, Backend>, repo: String) -> Result<String> {
    let assistant = backend.assistant.clone();
    blocking(move || use_case::commit_message(assistant.as_ref(), &PathBuf::from(repo))).await
}
