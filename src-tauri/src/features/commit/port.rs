use std::path::Path;

use super::model::Commit;
use crate::features::working_tree::model::FileStatus;
use crate::shared::error::Result;

pub trait CommitPort: Send + Sync {
    fn log(&self, repo: &Path, limit: usize) -> Result<Vec<Commit>>;
    fn file_diff(&self, repo: &Path, path: &str, staged: bool) -> Result<String>;
    fn untracked_diff(&self, repo: &Path, path: &str) -> Result<String>;
    fn commit_files(&self, repo: &Path, hash: &str) -> Result<Vec<FileStatus>>;
    fn commit_diff(&self, repo: &Path, hash: &str, path: &str) -> Result<String>;
}
