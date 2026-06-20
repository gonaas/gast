use std::path::Path;

use super::model::{layout, Commit, GraphRow};
use super::port::CommitPort;
use crate::features::working_tree::model::FileStatus;
use crate::shared::error::Result;

pub fn log(port: &dyn CommitPort, repo: &Path, limit: usize) -> Result<Vec<Commit>> {
    port.log(repo, limit)
}

pub fn commit_graph(port: &dyn CommitPort, repo: &Path, limit: usize) -> Result<Vec<GraphRow>> {
    let commits = port.log(repo, limit)?;
    Ok(layout(&commits))
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
