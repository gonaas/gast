use std::path::Path;

use super::model::{PullStrategy, Remote};
use super::port::RemotePort;
use crate::shared::error::Result;

pub fn fetch(port: &dyn RemotePort, repo: &Path) -> Result<String> {
    port.fetch(repo)
}

pub fn pull(port: &dyn RemotePort, repo: &Path, strategy: PullStrategy) -> Result<String> {
    port.pull(repo, strategy)
}

pub fn push(port: &dyn RemotePort, repo: &Path) -> Result<String> {
    port.push(repo)
}

pub fn list(port: &dyn RemotePort, repo: &Path) -> Result<Vec<Remote>> {
    port.list(repo)
}

pub fn add(port: &dyn RemotePort, repo: &Path, name: &str, url: &str) -> Result<Vec<Remote>> {
    port.add(repo, name, url)?;
    port.list(repo)
}

pub fn remove(port: &dyn RemotePort, repo: &Path, name: &str) -> Result<Vec<Remote>> {
    port.remove(repo, name)?;
    port.list(repo)
}

pub fn rename(port: &dyn RemotePort, repo: &Path, old: &str, new: &str) -> Result<Vec<Remote>> {
    port.rename(repo, old, new)?;
    port.list(repo)
}
