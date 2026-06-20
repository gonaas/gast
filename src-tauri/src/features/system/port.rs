use super::model::Target;
use crate::shared::error::Result;

pub trait SystemPort: Send + Sync {
    /// Abre `path` en el destino indicado.
    fn open(&self, path: &str, target: Target) -> Result<()>;
}
