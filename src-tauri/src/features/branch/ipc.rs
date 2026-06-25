use std::path::PathBuf;

use tauri::State;

use super::model::Branch;
use super::use_case;
use crate::shared::error::Result;
use crate::shared::runner::blocking;
use crate::Backend;

#[tauri::command]
pub async fn list_branches(backend: State<'_, Backend>, repo: String) -> Result<Vec<Branch>> {
    let branch = backend.branch.clone();
    blocking(move || use_case::list(branch.as_ref(), &PathBuf::from(repo))).await
}

#[tauri::command]
pub async fn checkout_branch(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
) -> Result<Vec<Branch>> {
    let branch = backend.branch.clone();
    blocking(move || use_case::switch(branch.as_ref(), &PathBuf::from(repo), &name)).await
}

#[tauri::command]
pub async fn checkout_commit(
    backend: State<'_, Backend>,
    repo: String,
    hash: String,
) -> Result<Vec<Branch>> {
    let branch = backend.branch.clone();
    blocking(move || use_case::switch_detached(branch.as_ref(), &PathBuf::from(repo), &hash)).await
}

#[tauri::command]
pub async fn create_branch(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
    start: String,
) -> Result<Vec<Branch>> {
    let branch = backend.branch.clone();
    blocking(move || use_case::create(branch.as_ref(), &PathBuf::from(repo), &name, &start)).await
}

#[tauri::command]
pub async fn delete_branch(
    backend: State<'_, Backend>,
    repo: String,
    name: String,
    force: bool,
) -> Result<Vec<Branch>> {
    let branch = backend.branch.clone();
    blocking(move || use_case::delete(branch.as_ref(), &PathBuf::from(repo), &name, force)).await
}

#[tauri::command]
pub async fn rename_branch(
    backend: State<'_, Backend>,
    repo: String,
    old: String,
    new: String,
) -> Result<Vec<Branch>> {
    let branch = backend.branch.clone();
    blocking(move || use_case::rename(branch.as_ref(), &PathBuf::from(repo), &old, &new)).await
}

#[tauri::command]
pub async fn track_remote_branches(
    backend: State<'_, Backend>,
    repo: String,
    remote: String,
) -> Result<Vec<Branch>> {
    let branch = backend.branch.clone();
    blocking(move || use_case::track_all_remote(branch.as_ref(), &PathBuf::from(repo), &remote))
        .await
}
