use tauri::State;

use super::model::Target;
use super::use_case;
use crate::shared::error::Result;
use crate::shared::runner::blocking;
use crate::Backend;

#[tauri::command]
pub async fn open_path(backend: State<'_, Backend>, path: String, target: Target) -> Result<()> {
    let system = backend.system.clone();
    blocking(move || use_case::open(system.as_ref(), &path, target)).await
}
