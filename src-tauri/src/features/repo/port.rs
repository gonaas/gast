use std::path::Path;

use super::model::{RecentRepo, Repo};
use crate::shared::error::Result;

pub trait RepoPort: Send + Sync {
    /// Valida que `path` sea (o esté dentro de) un repo git y devuelve sus datos.
    fn open(&self, path: &Path) -> Result<Repo>;
}

/// Puerto de persistencia: store puro de I/O para los repos recientes. La lógica
/// (dedup, orden, cap) NO vive aquí, sino en `use_case`.
pub trait RecentReposStore: Send + Sync {
    fn load(&self) -> Result<Vec<RecentRepo>>;
    fn save(&self, repos: &[RecentRepo]) -> Result<()>;
}
