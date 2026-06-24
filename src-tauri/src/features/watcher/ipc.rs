use std::path::PathBuf;

use tauri::{AppHandle, State};

use super::service::{self, WatcherState};
use crate::shared::error::Result;

#[tauri::command]
pub fn watch_repo(app: AppHandle, state: State<'_, WatcherState>, path: String) -> Result<()> {
    service::start(app, state.inner(), PathBuf::from(path))
}

#[tauri::command]
pub fn unwatch_repo(state: State<'_, WatcherState>) -> Result<()> {
    service::stop(state.inner())
}
