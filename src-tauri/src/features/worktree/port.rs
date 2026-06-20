use std::path::Path;

use super::model::{NewWorktree, Worktree};
use crate::shared::error::Result;

/// Puerto de salida del slice. El caso de uso depende de esta interfaz, no de
/// cómo se hable con git (hoy shell-out, mañana libgit2). Cada método es una
/// operación atómica; la composición "mutar + releer" vive en `use_case`.
pub trait WorktreePort: Send + Sync {
    fn list(&self, repo: &Path) -> Result<Vec<Worktree>>;
    fn add(&self, repo: &Path, spec: &NewWorktree) -> Result<()>;
    fn remove(&self, repo: &Path, path: &str, force: bool) -> Result<()>;
    fn prune(&self, repo: &Path) -> Result<()>;
}
