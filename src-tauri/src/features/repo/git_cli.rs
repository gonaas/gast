use std::path::Path;

use super::model::Repo;
use super::port::RepoPort;
use crate::shared::error::{AppError, Result};
use crate::shared::runner::git;

pub struct RepoGit;

impl RepoPort for RepoGit {
    fn open(&self, path: &Path) -> Result<Repo> {
        let toplevel = git(path, ["rev-parse", "--show-toplevel"])?
            .trim()
            .to_string();
        if toplevel.is_empty() {
            return Err(AppError::InvalidPath("no parece un repositorio git".into()));
        }

        let name = Path::new(&toplevel)
            .file_name()
            .map(|s| s.to_string_lossy().to_string())
            .unwrap_or_else(|| toplevel.clone());

        let head = git(path, ["rev-parse", "--abbrev-ref", "HEAD"])
            .ok()
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty() && s != "HEAD");

        Ok(Repo {
            path: toplevel,
            name,
            head,
        })
    }
}
