use std::path::Path;

use crate::shared::error::Result;

pub trait AssistantPort: Send + Sync {
    fn commit_message(&self, repo: &Path) -> Result<String>;
}
