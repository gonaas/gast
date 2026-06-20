use std::path::Path;

use super::model::Branch;
use super::port::BranchPort;
use crate::shared::error::Result;

pub fn list(port: &dyn BranchPort, repo: &Path) -> Result<Vec<Branch>> {
    port.list(repo)
}

pub fn switch(port: &dyn BranchPort, repo: &Path, name: &str) -> Result<Vec<Branch>> {
    port.switch(repo, name)?;
    port.list(repo)
}

pub fn switch_detached(port: &dyn BranchPort, repo: &Path, hash: &str) -> Result<Vec<Branch>> {
    port.switch_detached(repo, hash)?;
    port.list(repo)
}

pub fn create(port: &dyn BranchPort, repo: &Path, name: &str, start: &str) -> Result<Vec<Branch>> {
    port.create(repo, name, start)?;
    port.list(repo)
}

pub fn delete(port: &dyn BranchPort, repo: &Path, name: &str, force: bool) -> Result<Vec<Branch>> {
    port.delete(repo, name, force)?;
    port.list(repo)
}

pub fn rename(port: &dyn BranchPort, repo: &Path, old: &str, new: &str) -> Result<Vec<Branch>> {
    port.rename(repo, old, new)?;
    port.list(repo)
}
