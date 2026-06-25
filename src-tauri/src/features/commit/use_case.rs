use std::path::Path;

use super::model::{layout, History};
use super::port::CommitPort;
use crate::features::working_tree::model::FileStatus;
use crate::shared::error::Result;

/// Lee el historial una sola vez y deriva el grafo de los mismos commits.
pub fn history(port: &dyn CommitPort, repo: &Path, limit: usize) -> Result<History> {
    let commits = port.log(repo, limit)?;
    let graph = layout(&commits);
    Ok(History { commits, graph })
}

pub fn file_diff(port: &dyn CommitPort, repo: &Path, path: &str, staged: bool) -> Result<String> {
    port.file_diff(repo, path, staged)
}

pub fn untracked_diff(port: &dyn CommitPort, repo: &Path, path: &str) -> Result<String> {
    port.untracked_diff(repo, path)
}

pub fn commit_files(port: &dyn CommitPort, repo: &Path, hash: &str) -> Result<Vec<FileStatus>> {
    port.commit_files(repo, hash)
}

pub fn commit_diff(port: &dyn CommitPort, repo: &Path, hash: &str, path: &str) -> Result<String> {
    port.commit_diff(repo, hash, path)
}

pub fn range_files(
    port: &dyn CommitPort,
    repo: &Path,
    base: &str,
    target: &str,
) -> Result<Vec<FileStatus>> {
    port.range_files(repo, base, target)
}

pub fn range_diff(
    port: &dyn CommitPort,
    repo: &Path,
    base: &str,
    target: &str,
    path: &str,
) -> Result<String> {
    port.range_diff(repo, base, target, path)
}
