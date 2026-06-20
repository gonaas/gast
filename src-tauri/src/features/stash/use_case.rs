use std::path::Path;

use super::model::Stash;
use super::port::StashPort;
use crate::shared::error::Result;

pub fn list(port: &dyn StashPort, repo: &Path) -> Result<Vec<Stash>> {
    port.list(repo)
}

pub fn save(port: &dyn StashPort, repo: &Path, message: &str) -> Result<Vec<Stash>> {
    port.save(repo, message)?;
    port.list(repo)
}

pub fn apply(port: &dyn StashPort, repo: &Path, reference: &str) -> Result<Vec<Stash>> {
    port.apply(repo, reference)?;
    port.list(repo)
}

pub fn pop(port: &dyn StashPort, repo: &Path, reference: &str) -> Result<Vec<Stash>> {
    port.pop(repo, reference)?;
    port.list(repo)
}

pub fn drop(port: &dyn StashPort, repo: &Path, reference: &str) -> Result<Vec<Stash>> {
    port.drop(repo, reference)?;
    port.list(repo)
}
