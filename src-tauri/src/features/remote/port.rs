use std::path::Path;

use super::model::{PullStrategy, Remote};
use crate::shared::error::Result;

pub trait RemotePort: Send + Sync {
    fn fetch(&self, repo: &Path) -> Result<String>;
    fn pull(&self, repo: &Path, strategy: PullStrategy) -> Result<String>;
    fn push(&self, repo: &Path) -> Result<String>;
    fn list(&self, repo: &Path) -> Result<Vec<Remote>>;
    fn add(&self, repo: &Path, name: &str, url: &str) -> Result<()>;
    fn remove(&self, repo: &Path, name: &str) -> Result<()>;
    fn rename(&self, repo: &Path, old: &str, new: &str) -> Result<()>;
}
