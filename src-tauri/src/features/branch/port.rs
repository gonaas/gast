use std::path::Path;

use super::model::Branch;
use crate::shared::error::Result;

pub trait BranchPort: Send + Sync {
    fn list(&self, repo: &Path) -> Result<Vec<Branch>>;
    fn switch(&self, repo: &Path, name: &str) -> Result<()>;
    fn switch_detached(&self, repo: &Path, hash: &str) -> Result<()>;
    fn create(&self, repo: &Path, name: &str, start: &str) -> Result<()>;
    fn delete(&self, repo: &Path, name: &str, force: bool) -> Result<()>;
    fn rename(&self, repo: &Path, old: &str, new: &str) -> Result<()>;
}
