use std::path::Path;

use super::model::Branch;
use super::port::BranchPort;
use crate::shared::error::Result;
use crate::shared::parse::SEP;
use crate::shared::runner::git;

pub struct BranchGit;

impl BranchPort for BranchGit {
    fn list(&self, repo: &Path) -> Result<Vec<Branch>> {
        // `git branch --format` no interpreta %x1f, así que metemos el byte 0x1f
        // literal en la cadena de formato como separador de campos.
        let fmt = format!(
            "%(HEAD){SEP}%(refname){SEP}%(refname:short){SEP}%(objectname){SEP}%(upstream:short){SEP}%(upstream:track)"
        );
        let out = git(repo, ["branch", "--all", &format!("--format={fmt}")])?;
        Ok(parse_branches(&out))
    }

    fn switch(&self, repo: &Path, name: &str) -> Result<()> {
        git(repo, ["switch", name])?;
        Ok(())
    }

    fn switch_detached(&self, repo: &Path, hash: &str) -> Result<()> {
        git(repo, ["switch", "--detach", hash])?;
        Ok(())
    }

    fn create(&self, repo: &Path, name: &str, start: &str) -> Result<()> {
        if start.is_empty() {
            git(repo, ["switch", "-c", name])?;
        } else {
            git(repo, ["switch", "-c", name, start])?;
        }
        Ok(())
    }

    fn delete(&self, repo: &Path, name: &str, force: bool) -> Result<()> {
        git(repo, ["branch", if force { "-D" } else { "-d" }, name])?;
        Ok(())
    }

    fn rename(&self, repo: &Path, old: &str, new: &str) -> Result<()> {
        git(repo, ["branch", "-m", old, new])?;
        Ok(())
    }
}

/// Parsea la salida de `git branch --format` con separador 0x1f. Pura/testeable.
pub fn parse_branches(out: &str) -> Vec<Branch> {
    let mut branches = Vec::new();
    for line in out.lines() {
        if line.trim().is_empty() {
            continue;
        }
        let f: Vec<&str> = line.split(SEP).collect();
        if f.len() < 6 {
            continue;
        }
        // Refs simbólicas (p.ej. "origin/HEAD -> origin/main") se descartan.
        if f[2].contains("->") {
            continue;
        }

        let (ahead, behind, gone) = parse_track(f[5]);
        branches.push(Branch {
            name: f[2].to_string(),
            is_head: f[0].trim() == "*",
            is_remote: f[1].starts_with("refs/remotes/"),
            upstream: Some(f[4].to_string()).filter(|s| !s.is_empty()),
            target: f[3].to_string(),
            ahead,
            behind,
            gone,
        });
    }
    branches
}

/// Parsea el campo `%(upstream:track)`, que git emite como `[ahead 1, behind 2]`,
/// `[ahead 3]`, `[behind 4]`, `[gone]` o vacío. Pura/testeable.
fn parse_track(s: &str) -> (Option<u32>, Option<u32>, bool) {
    let s = s.trim();
    if s == "[gone]" {
        return (None, None, true);
    }
    let inner = s.trim_start_matches('[').trim_end_matches(']');
    let mut ahead = None;
    let mut behind = None;
    for part in inner.split(',') {
        let part = part.trim();
        if let Some(n) = part.strip_prefix("ahead ") {
            ahead = n.trim().parse().ok();
        } else if let Some(n) = part.strip_prefix("behind ") {
            behind = n.trim().parse().ok();
        }
    }
    (ahead, behind, false)
}

#[cfg(test)]
mod tests {
    use super::*;

    // Salida real de `git branch --all --format=...` con 0x1f como separador.
    // Campos: HEAD, refname, refname:short, objectname, upstream:short, upstream:track.
    const SAMPLE: &str = " \u{1f}refs/heads/feature\u{1f}feature\u{1f}561646d2\u{1f}\u{1f}\n\
*\u{1f}refs/heads/main\u{1f}main\u{1f}87643f92\u{1f}origin/main\u{1f}[ahead 2, behind 1]\n\
 \u{1f}refs/heads/stale\u{1f}stale\u{1f}aaaaaaaa\u{1f}origin/stale\u{1f}[gone]\n\
 \u{1f}refs/remotes/origin/main\u{1f}origin/main\u{1f}87643f92\u{1f}\u{1f}\n\
 \u{1f}refs/remotes/origin/HEAD\u{1f}origin/HEAD -> origin/main\u{1f}87643f92\u{1f}\u{1f}";

    #[test]
    fn skips_symbolic_ref() {
        let b = parse_branches(SAMPLE);
        // feature, main, stale, origin/main (origin/HEAD simbólica se descarta).
        assert_eq!(b.len(), 4);
    }

    #[test]
    fn detects_head_branch() {
        let b = parse_branches(SAMPLE);
        let main = b.iter().find(|b| b.name == "main").unwrap();
        assert!(main.is_head);
        assert_eq!(main.upstream.as_deref(), Some("origin/main"));
        assert!(!main.is_remote);
    }

    #[test]
    fn feature_branch_has_no_upstream() {
        let b = parse_branches(SAMPLE);
        let feat = b.iter().find(|b| b.name == "feature").unwrap();
        assert!(!feat.is_head);
        assert_eq!(feat.upstream, None);
        assert_eq!(feat.ahead, None);
        assert_eq!(feat.behind, None);
        assert!(!feat.gone);
    }

    #[test]
    fn parses_ahead_behind() {
        let b = parse_branches(SAMPLE);
        let main = b.iter().find(|b| b.name == "main").unwrap();
        assert_eq!(main.ahead, Some(2));
        assert_eq!(main.behind, Some(1));
        assert!(!main.gone);
    }

    #[test]
    fn detects_gone_upstream() {
        let b = parse_branches(SAMPLE);
        let stale = b.iter().find(|b| b.name == "stale").unwrap();
        assert!(stale.gone);
        assert_eq!(stale.ahead, None);
        assert_eq!(stale.behind, None);
    }

    #[test]
    fn parse_track_variants() {
        assert_eq!(parse_track(""), (None, None, false));
        assert_eq!(parse_track("[gone]"), (None, None, true));
        assert_eq!(parse_track("[ahead 5]"), (Some(5), None, false));
        assert_eq!(parse_track("[behind 3]"), (None, Some(3), false));
        assert_eq!(parse_track("[ahead 2, behind 7]"), (Some(2), Some(7), false));
    }

    #[test]
    fn detects_remote_branch() {
        let b = parse_branches(SAMPLE);
        let remote = b.iter().find(|b| b.is_remote).unwrap();
        assert_eq!(remote.name, "origin/main");
    }
}
