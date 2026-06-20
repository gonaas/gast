use std::path::Path;

use super::model::{PullStrategy, Remote};
use super::port::RemotePort;
use crate::shared::error::Result;
use crate::shared::runner::git;

pub struct RemoteGit;

impl RemotePort for RemoteGit {
    fn fetch(&self, repo: &Path) -> Result<String> {
        git(repo, ["fetch", "--all", "--prune"])
    }

    fn pull(&self, repo: &Path, strategy: PullStrategy) -> Result<String> {
        git(repo, ["pull", strategy.flag()])
    }

    fn push(&self, repo: &Path) -> Result<String> {
        git(repo, ["push"])
    }

    fn list(&self, repo: &Path) -> Result<Vec<Remote>> {
        let out = git(repo, ["remote", "-v"])?;
        Ok(parse_remotes(&out))
    }

    fn add(&self, repo: &Path, name: &str, url: &str) -> Result<()> {
        git(repo, ["remote", "add", name, url])?;
        Ok(())
    }

    fn remove(&self, repo: &Path, name: &str) -> Result<()> {
        git(repo, ["remote", "remove", name])?;
        Ok(())
    }

    fn rename(&self, repo: &Path, old: &str, new: &str) -> Result<()> {
        git(repo, ["remote", "rename", old, new])?;
        Ok(())
    }
}

pub fn parse_remotes(out: &str) -> Vec<Remote> {
    let mut remotes = Vec::new();
    for line in out.lines() {
        let mut parts = line.split_whitespace();
        let (Some(name), Some(url), Some(kind)) = (parts.next(), parts.next(), parts.next()) else {
            continue;
        };
        if kind == "(fetch)" {
            remotes.push(Remote {
                name: name.to_string(),
                url: url.to_string(),
            });
        }
    }
    remotes
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = "origin\thttps://github.com/u/repo.git (fetch)\n\
origin\thttps://github.com/u/repo.git (push)\n\
upstream\tgit@github.com:o/repo.git (fetch)\n\
upstream\tgit@github.com:o/repo.git (push)\n";

    #[test]
    fn dedupes_fetch_and_push() {
        let r = parse_remotes(SAMPLE);
        assert_eq!(r.len(), 2);
    }

    #[test]
    fn parses_name_and_url() {
        let r = parse_remotes(SAMPLE);
        assert_eq!(
            r[0],
            Remote {
                name: "origin".into(),
                url: "https://github.com/u/repo.git".into()
            }
        );
        assert_eq!(r[1].name, "upstream");
        assert_eq!(r[1].url, "git@github.com:o/repo.git");
    }

    #[test]
    fn empty_output_yields_no_remotes() {
        assert!(parse_remotes("").is_empty());
    }

    #[test]
    fn pull_strategy_maps_to_git_flag() {
        assert_eq!(PullStrategy::Merge.flag(), "--no-rebase");
        assert_eq!(PullStrategy::Rebase.flag(), "--rebase");
        assert_eq!(PullStrategy::FfOnly.flag(), "--ff-only");
    }
}
