use std::path::Path;

use super::port::TagPort;
use crate::shared::error::Result;
use crate::shared::runner::git;

pub struct TagGit;

impl TagPort for TagGit {
    fn list(&self, repo: &Path) -> Result<Vec<String>> {
        let out = git(repo, ["tag", "--list", "--sort=-version:refname"])?;
        Ok(parse_lines(&out))
    }

    fn create(&self, repo: &Path, name: &str, message: &str, target: &str) -> Result<()> {
        let mut args = vec!["tag"];
        if !message.is_empty() {
            args.extend(["-a", "-m", message]);
        }
        args.push(name);
        if !target.is_empty() {
            args.push(target);
        }
        git(repo, args)?;
        Ok(())
    }

    fn delete(&self, repo: &Path, name: &str) -> Result<()> {
        git(repo, ["tag", "-d", name])?;
        Ok(())
    }
}

/// Una línea no vacía por elemento. Pura/testeable.
fn parse_lines(out: &str) -> Vec<String> {
    out.lines()
        .map(str::trim)
        .filter(|l| !l.is_empty())
        .map(str::to_string)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_tag_lines_and_skips_blanks() {
        assert_eq!(
            parse_lines("v1.0\nv0.9\n\nv0.1\n"),
            vec!["v1.0", "v0.9", "v0.1"]
        );
    }

    #[test]
    fn empty_output_yields_no_tags() {
        assert!(parse_lines("").is_empty());
    }
}
