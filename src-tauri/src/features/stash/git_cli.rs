use std::path::Path;

use super::model::Stash;
use super::port::StashPort;
use crate::shared::error::Result;
use crate::shared::parse::SEP;
use crate::shared::runner::git;

pub struct StashGit;

impl StashPort for StashGit {
    fn list(&self, repo: &Path) -> Result<Vec<Stash>> {
        let out = git(repo, ["stash", "list", &format!("--format=%gd{SEP}%gs")])?;
        Ok(parse_stashes(&out))
    }

    fn save(&self, repo: &Path, message: &str) -> Result<()> {
        if message.is_empty() {
            git(repo, ["stash", "push"])?;
        } else {
            git(repo, ["stash", "push", "-m", message])?;
        }
        Ok(())
    }

    fn apply(&self, repo: &Path, reference: &str) -> Result<()> {
        git(repo, ["stash", "apply", reference])?;
        Ok(())
    }

    fn pop(&self, repo: &Path, reference: &str) -> Result<()> {
        git(repo, ["stash", "pop", reference])?;
        Ok(())
    }

    fn drop(&self, repo: &Path, reference: &str) -> Result<()> {
        git(repo, ["stash", "drop", reference])?;
        Ok(())
    }
}

/// Parsea `git stash list --format=%gd<0x1f>%gs`. Pura/testeable.
pub fn parse_stashes(out: &str) -> Vec<Stash> {
    let mut stashes = Vec::new();
    for line in out.lines() {
        if line.trim().is_empty() {
            continue;
        }
        let (reference, message) = line.split_once(SEP).unwrap_or((line, ""));
        let index = reference
            .trim_start_matches("stash@{")
            .trim_end_matches('}')
            .parse()
            .unwrap_or(stashes.len());
        stashes.push(Stash {
            reference: reference.to_string(),
            index,
            message: message.to_string(),
        });
    }
    stashes
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = "stash@{0}\u{1f}WIP on main: 1a2b3c4 último commit\n\
stash@{1}\u{1f}On feature: trabajo a medias\n";

    #[test]
    fn parses_two_stashes() {
        assert_eq!(parse_stashes(SAMPLE).len(), 2);
    }

    #[test]
    fn parses_reference_and_index() {
        let s = parse_stashes(SAMPLE);
        assert_eq!(s[0].reference, "stash@{0}");
        assert_eq!(s[0].index, 0);
        assert_eq!(s[1].index, 1);
    }

    #[test]
    fn parses_message() {
        let s = parse_stashes(SAMPLE);
        assert_eq!(s[0].message, "WIP on main: 1a2b3c4 último commit");
    }

    #[test]
    fn empty_output_yields_no_stashes() {
        assert!(parse_stashes("").is_empty());
    }
}
