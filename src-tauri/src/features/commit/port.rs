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
    /// Archivos que `target` añadió respecto a `base` (diff de 3 puntos:
    /// `base...target`, desde el ancestro común). Para comparar dos ramas.
    fn range_files(&self, repo: &Path, base: &str, target: &str) -> Result<Vec<FileStatus>>;
    /// Diff de un archivo en ese mismo rango `base...target`.
    fn range_diff(&self, repo: &Path, base: &str, target: &str, path: &str) -> Result<String>;
}
