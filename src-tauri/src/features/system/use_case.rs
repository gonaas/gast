use super::model::Target;
use super::port::SystemPort;
use crate::shared::error::Result;

pub fn open(port: &dyn SystemPort, path: &str, target: Target) -> Result<()> {
    port.open(path, target)
}
