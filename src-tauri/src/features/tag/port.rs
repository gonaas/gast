use std::path::Path;

use crate::shared::error::Result;

pub trait TagPort: Send + Sync {
    fn list(&self, repo: &Path) -> Result<Vec<String>>;
    /// Crea un tag. `message` no vacío = anotado; `target` vacío = HEAD.
    fn create(&self, repo: &Path, name: &str, message: &str, target: &str) -> Result<()>;
    fn delete(&self, repo: &Path, name: &str) -> Result<()>;
}
