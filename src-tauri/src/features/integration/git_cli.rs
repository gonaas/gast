use std::path::Path;

use super::model::ConflictState;
use super::port::IntegrationPort;
use crate::shared::error::{AppError, Result};
use crate::shared::runner::{git, git_lenient};

pub struct IntegrationGit;

impl IntegrationPort for IntegrationGit {
    fn merge(&self, repo: &Path, name: &str) -> Result<String> {
        git(repo, ["merge", name])
    }

    fn rebase(&self, repo: &Path, onto: &str) -> Result<String> {
        git(repo, ["rebase", onto])
    }

    fn conflict_state(&self, repo: &Path) -> Result<ConflictState> {
        let operation = if is_merging(repo) {
            "merge"
        } else if is_rebasing(repo) {
            "rebase"
        } else {
            "none"
        };

        // Archivos sin fusionar (diff-filter=U).
        let out = git(repo, ["diff", "--name-only", "--diff-filter=U"])?;
        let files = out
            .lines()
            .map(str::to_string)
            .filter(|l| !l.is_empty())
            .collect();

        Ok(ConflictState {
            operation: operation.to_string(),
            files,
        })
    }

    fn conflict_content(&self, repo: &Path, path: &str) -> Result<String> {
        std::fs::read_to_string(repo.join(path)).map_err(|e| AppError::Spawn(e.to_string()))
    }

    fn resolve_ours(&self, repo: &Path, path: &str) -> Result<()> {
        git(repo, ["checkout", "--ours", "--", path])?;
        git(repo, ["add", "--", path])?;
        Ok(())
    }

    fn resolve_theirs(&self, repo: &Path, path: &str) -> Result<()> {
        git(repo, ["checkout", "--theirs", "--", path])?;
        git(repo, ["add", "--", path])?;
        Ok(())
    }

    fn mark_resolved(&self, repo: &Path, path: &str) -> Result<()> {
        git(repo, ["add", "--", path])?;
        Ok(())
    }

    fn abort(&self, repo: &Path) -> Result<()> {
        if is_merging(repo) {
            git(repo, ["merge", "--abort"])?;
        } else if is_rebasing(repo) {
            git(repo, ["rebase", "--abort"])?;
        }
        Ok(())
    }

    fn continue_op(&self, repo: &Path) -> Result<()> {
        if is_merging(repo) {
            git(repo, ["commit", "--no-edit"])?;
        } else if is_rebasing(repo) {
            git(repo, ["rebase", "--continue"])?;
        }
        Ok(())
    }
}

fn is_merging(repo: &Path) -> bool {
    git_lenient(repo, ["rev-parse", "--verify", "--quiet", "MERGE_HEAD"])
        .map(|s| !s.trim().is_empty())
        .unwrap_or(false)
}

fn is_rebasing(repo: &Path) -> bool {
    for dir in ["rebase-merge", "rebase-apply"] {
        if let Ok(p) = git(repo, ["rev-parse", "--git-path", dir]) {
            if repo.join(p.trim()).exists() {
                return true;
            }
        }
    }
    false
}
