use std::path::Path;

use super::model::Stash;
use crate::shared::error::Result;

pub trait StashPort: Send + Sync {
    fn list(&self, repo: &Path) -> Result<Vec<Stash>>;
    fn save(&self, repo: &Path, message: &str) -> Result<()>;
    fn apply(&self, repo: &Path, reference: &str) -> Result<()>;
    fn pop(&self, repo: &Path, reference: &str) -> Result<()>;
    fn drop(&self, repo: &Path, reference: &str) -> Result<()>;
}
