use std::path::Path;

use super::model::RepoStatus;
use crate::shared::error::Result;

pub trait WorkingTreePort: Send + Sync {
    fn status(&self, repo: &Path) -> Result<RepoStatus>;
    fn stage(&self, repo: &Path, path: &str) -> Result<()>;
    fn unstage(&self, repo: &Path, path: &str) -> Result<()>;
    fn discard(&self, repo: &Path, path: &str) -> Result<()>;
    fn commit(&self, repo: &Path, message: &str, amend: bool) -> Result<()>;
}
