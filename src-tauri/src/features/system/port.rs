use super::model::Target;
use crate::shared::error::Result;

pub trait SystemPort: Send + Sync {
    fn open(&self, path: &str, target: Target) -> Result<()>;
}
