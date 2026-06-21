use std::path::Path;

use super::model::{FileStatus, RepoStatus};
use super::port::WorkingTreePort;
use crate::shared::error::Result;
use crate::shared::runner::git;

pub struct WorkingTreeGit;

impl WorkingTreePort for WorkingTreeGit {
    fn status(&self, repo: &Path) -> Result<RepoStatus> {
        let out = git(repo, ["status", "--porcelain=v1", "--branch"])?;
        Ok(parse_status(&out))
    }

    fn stage(&self, repo: &Path, path: &str) -> Result<()> {
        git(repo, ["add", "--", path])?;
        Ok(())
    }

    fn unstage(&self, repo: &Path, path: &str) -> Result<()> {
        git(repo, ["restore", "--staged", "--", path])?;
        Ok(())
    }

    fn discard(&self, repo: &Path, path: &str) -> Result<()> {
        git(repo, ["restore", "--", path])?;
        Ok(())
    }

    fn commit(&self, repo: &Path, message: &str, amend: bool) -> Result<()> {
        let mut args = vec!["commit", "-m", message];
        if amend {
            args.push("--amend");
        }
        git(repo, args)?;
        Ok(())
    }
}

/// Parsea `git status --porcelain=v1 --branch`. Pura/testeable.
pub fn parse_status(out: &str) -> RepoStatus {
    let mut branch = String::new();
    let mut files = Vec::new();

    for line in out.lines() {
        if let Some(rest) = line.strip_prefix("## ") {
            branch = rest.split(['.', ' ']).next().unwrap_or(rest).to_string();
            continue;
        }
        if line.len() < 3 {
            continue;
        }
        let (xy, path) = line.split_at(2);
        let mut chars = xy.chars();
        let index_status = chars.next().unwrap_or(' ').to_string();
        let worktree_status = chars.next().unwrap_or(' ').to_string();
        let path = path.trim_start();
        let path = path.split(" -> ").last().unwrap_or(path).to_string();

        files.push(FileStatus {
            path,
            index_status,
            worktree_status,
        });
    }

    RepoStatus { branch, files }
}

#[cfg(test)]
mod tests {
    use super::*;

    // OJO: con `concat!` para preservar los espacios iniciales de cada línea;
    // la continuación con `\` en literales Rust se los comería.
    const SAMPLE: &str = concat!(
        "## main...origin/main [ahead 1]\n",
        "M  staged.txt\n",
        " M modified.txt\n",
        "MM both.txt\n",
        "?? untracked.txt\n",
        "R  old.txt -> new.txt\n",
    );

    #[test]
    fn parses_branch_name() {
        assert_eq!(parse_status(SAMPLE).branch, "main");
    }

    #[test]
    fn parses_all_files() {
        assert_eq!(parse_status(SAMPLE).files.len(), 5);
    }

    #[test]
    fn splits_index_and_worktree_columns() {
        let s = parse_status(SAMPLE);
        let both = s.files.iter().find(|f| f.path == "both.txt").unwrap();
        assert_eq!(both.index_status, "M");
        assert_eq!(both.worktree_status, "M");

        let modified = s.files.iter().find(|f| f.path == "modified.txt").unwrap();
        assert_eq!(modified.index_status, " ");
        assert_eq!(modified.worktree_status, "M");
    }

    #[test]
    fn untracked_uses_question_marks() {
        let s = parse_status(SAMPLE);
        let u = s.files.iter().find(|f| f.path == "untracked.txt").unwrap();
        assert_eq!(u.index_status, "?");
    }

    #[test]
    fn rename_keeps_new_path() {
        let s = parse_status(SAMPLE);
        assert!(s.files.iter().any(|f| f.path == "new.txt"));
        assert!(!s.files.iter().any(|f| f.path.contains("->")));
    }
}
