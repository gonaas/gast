use tauri::State;

use super::model::Target;
use super::use_case;
use crate::shared::error::Result;
use crate::Backend;

#[tauri::command]
pub fn open_path(backend: State<'_, Backend>, path: String, target: Target) -> Result<()> {
    use_case::open(backend.system.as_ref(), &path, target)
}
