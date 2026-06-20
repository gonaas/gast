use std::path::Path;

use super::model::ConflictState;
use super::port::IntegrationPort;
use crate::shared::error::Result;

pub fn merge(port: &dyn IntegrationPort, repo: &Path, name: &str) -> Result<String> {
    port.merge(repo, name)
}

pub fn rebase(port: &dyn IntegrationPort, repo: &Path, onto: &str) -> Result<String> {
    port.rebase(repo, onto)
}

pub fn conflict_state(port: &dyn IntegrationPort, repo: &Path) -> Result<ConflictState> {
    port.conflict_state(repo)
}

pub fn conflict_content(port: &dyn IntegrationPort, repo: &Path, path: &str) -> Result<String> {
    port.conflict_content(repo, path)
}

pub fn resolve_ours(port: &dyn IntegrationPort, repo: &Path, path: &str) -> Result<ConflictState> {
    port.resolve_ours(repo, path)?;
    port.conflict_state(repo)
}

pub fn resolve_theirs(port: &dyn IntegrationPort, repo: &Path, path: &str) -> Result<ConflictState> {
    port.resolve_theirs(repo, path)?;
    port.conflict_state(repo)
}

pub fn mark_resolved(port: &dyn IntegrationPort, repo: &Path, path: &str) -> Result<ConflictState> {
    port.mark_resolved(repo, path)?;
    port.conflict_state(repo)
}

pub fn abort(port: &dyn IntegrationPort, repo: &Path) -> Result<ConflictState> {
    port.abort(repo)?;
    port.conflict_state(repo)
}

pub fn continue_op(port: &dyn IntegrationPort, repo: &Path) -> Result<ConflictState> {
    port.continue_op(repo)?;
    port.conflict_state(repo)
}
