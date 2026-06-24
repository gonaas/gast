use std::path::PathBuf;

use tauri::State;

use super::model::{PullStrategy, Remote};
use super::use_case;
use crate::shared::error::Result;
use crate::shared::runner::blocking;
use crate::Backend;

#[tauri::command]
pub async fn fetch(backend: State<'_, Backend>, repo: String) -> Result<String> {
    let remote = backend.remote.clone();
    blocking(move || use_case::fetch(remote.as_ref(), &PathBuf::from(repo))).await
}

#[tauri::command]
pub async fn pull(
    backend: State<'_, Backend>,
    repo: String,
    strategy: PullStrategy,
) -> Result<String> {
    let remote = backend.remote.clone();
    blocking(move || use_case::pull(remote.as_ref(), &PathBuf::from(repo), strategy)).await
}

#[tauri::command]
pub async fn push(backend: State<'_, Backend>, repo: String) -> Result<String> {
    let remote = backend.remote.clone();
    blocking(move || use_case::push(remote.as_ref(), &PathBuf::from(repo))).await
}

#[tauri::command]
pub async fn list_remotes(backend: State<'_, Backend>, repo: String) -> Result<Vec<Remote>> {
    let remote = backend.remote.clone();
    blocking(move || use_case::list(remote.as_ref(), &PathBuf::from(repo))).await
}

#[tauri::command]
pub async fn add_remote(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
    url: String,
) -> Result<Vec<Remote>> {
    let remote = backend.remote.clone();
    blocking(move || use_case::add(remote.as_ref(), &PathBuf::from(repo), &name, &url)).await
}

#[tauri::command]
pub async fn remove_remote(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
) -> Result<Vec<Remote>> {
    let remote = backend.remote.clone();
    blocking(move || use_case::remove(remote.as_ref(), &PathBuf::from(repo), &name)).await
}

#[tauri::command]
pub async fn rename_remote(
    backend: State<'_, Backend>,
    repo: String,
    old: String,
    new: String,
) -> Result<Vec<Remote>> {
    let remote = backend.remote.clone();
    blocking(move || use_case::rename(remote.as_ref(), &PathBuf::from(repo), &old, &new)).await
}
