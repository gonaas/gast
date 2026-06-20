use std::path::Path;

use super::model::ConflictState;
use crate::shared::error::Result;

pub trait IntegrationPort: Send + Sync {
    fn merge(&self, repo: &Path, name: &str) -> Result<String>;
    fn rebase(&self, repo: &Path, onto: &str) -> Result<String>;
    fn conflict_state(&self, repo: &Path) -> Result<ConflictState>;
    fn conflict_content(&self, repo: &Path, path: &str) -> Result<String>;
    fn resolve_ours(&self, repo: &Path, path: &str) -> Result<()>;
    fn resolve_theirs(&self, repo: &Path, path: &str) -> Result<()>;
    fn mark_resolved(&self, repo: &Path, path: &str) -> Result<()>;
    fn abort(&self, repo: &Path) -> Result<()>;
    fn continue_op(&self, repo: &Path) -> Result<()>;
}
