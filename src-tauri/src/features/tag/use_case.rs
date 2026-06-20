use std::path::Path;

use super::port::TagPort;
use crate::shared::error::Result;

pub fn list(port: &dyn TagPort, repo: &Path) -> Result<Vec<String>> {
    port.list(repo)
}

pub fn create(
    port: &dyn TagPort,
    repo: &Path,
    name: &str,
    message: &str,
    target: &str,
) -> Result<Vec<String>> {
    port.create(repo, name, message, target)?;
    port.list(repo)
}

pub fn delete(port: &dyn TagPort, repo: &Path, name: &str) -> Result<Vec<String>> {
    port.delete(repo, name)?;
    port.list(repo)
}
