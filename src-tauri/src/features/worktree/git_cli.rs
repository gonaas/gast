use std::path::Path;

use super::model::{NewWorktree, Worktree};
use super::port::WorktreePort;
use crate::shared::error::Result;
use crate::shared::runner::git;

/// Adaptador de salida: implementa `WorktreePort` haciendo shell-out a `git`.
pub struct WorktreeGit;

impl WorktreePort for WorktreeGit {
    fn list(&self, repo: &Path) -> Result<Vec<Worktree>> {
        let out = git(repo, ["worktree", "list", "--porcelain"])?;
        Ok(parse_worktrees(&out))
    }

    fn add(&self, repo: &Path, spec: &NewWorktree) -> Result<()> {
        if spec.new_branch {
            let mut args = vec![
                "worktree",
                "add",
                "-b",
                spec.branch.as_str(),
                spec.path.as_str(),
            ];
            if !spec.start.is_empty() {
                args.push(spec.start.as_str());
            }
            git(repo, args)?;
        } else {
            git(repo, ["worktree", "add", spec.path.as_str(), spec.branch.as_str()])?;
        }
        Ok(())
    }

    fn remove(&self, repo: &Path, path: &str, force: bool) -> Result<()> {
        let mut args = vec!["worktree", "remove"];
        if force {
            args.push("--force");
        }
        args.push(path);
        git(repo, args)?;
        Ok(())
    }

    fn prune(&self, repo: &Path) -> Result<()> {
        git(repo, ["worktree", "prune"])?;
        Ok(())
    }
}

pub fn parse_worktrees(out: &str) -> Vec<Worktree> {
    let mut worktrees = Vec::new();
    let mut current: Option<Worktree> = None;

    for line in out.lines() {
        if line.trim().is_empty() {
            if let Some(wt) = current.take() {
                worktrees.push(wt);
            }
            continue;
        }

        let (key, value) = line.split_once(' ').unwrap_or((line, ""));

        match key {
            "worktree" => {
                if let Some(wt) = current.take() {
                    worktrees.push(wt);
                }
                current = Some(Worktree {
                    path: value.to_string(),
                    ..Default::default()
                });
            }
            "HEAD" => {
                if let Some(wt) = current.as_mut() {
                    wt.head = Some(value.to_string());
                }
            }
            "branch" => {
                if let Some(wt) = current.as_mut() {
                    wt.branch = Some(value.trim_start_matches("refs/heads/").to_string());
                }
            }
            "bare" => current.as_mut().map_or((), |wt| wt.is_bare = true),
            "detached" => current.as_mut().map_or((), |wt| wt.is_detached = true),
            "locked" => current.as_mut().map_or((), |wt| wt.locked = true),
            "prunable" => current.as_mut().map_or((), |wt| wt.prunable = true),
            _ => {}
        }
    }
    if let Some(wt) = current.take() {
        worktrees.push(wt);
    }

    worktrees
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = "worktree /repo\n\
HEAD 87643f92831199db0fc7e089acb0c119bc372e38\n\
branch refs/heads/main\n\
\n\
worktree /repo/../wt-feature\n\
HEAD 561646d2875e6f714af72011cd10569a67077d72\n\
branch refs/heads/feature\n\
\n\
worktree /repo/../wt-detached\n\
HEAD 561646d2875e6f714af72011cd10569a67077d72\n\
detached\n\
prunable gitdir file points to non-existent location\n";

    #[test]
    fn parses_three_worktrees() {
        assert_eq!(parse_worktrees(SAMPLE).len(), 3);
    }

    #[test]
    fn strips_refs_heads_prefix() {
        let wts = parse_worktrees(SAMPLE);
        assert_eq!(wts[0].branch.as_deref(), Some("main"));
        assert_eq!(wts[1].branch.as_deref(), Some("feature"));
    }

    #[test]
    fn detects_detached_and_prunable() {
        let wts = parse_worktrees(SAMPLE);
        assert!(wts[2].is_detached);
        assert!(wts[2].prunable);
        assert_eq!(wts[2].branch, None);
    }

    #[test]
    fn handles_trailing_block_without_blank_line() {
        let wts = parse_worktrees(SAMPLE);
        assert_eq!(wts[2].path, "/repo/../wt-detached");
    }
}
