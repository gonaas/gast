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
    /// Crea una rama local que trackea cada rama de `remote` que aún no tenga
    /// equivalente local (estilo "traer todas a local" de Fork). No mueve HEAD.
    fn track_all_remote(&self, repo: &Path, remote: &str) -> Result<()>;
}
