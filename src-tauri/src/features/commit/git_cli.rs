use std::path::Path;

use super::model::Commit;
use super::port::CommitPort;
use crate::features::working_tree::model::FileStatus;
use crate::shared::error::Result;
use crate::shared::parse::SEP;
use crate::shared::runner::{git, git_lenient};

const RECORD: char = '\u{1e}';
const FMT: &str = "%H%x1f%h%x1f%P%x1f%an%x1f%ae%x1f%at%x1f%s%x1f%D%x1e";

pub struct CommitGit;

impl CommitPort for CommitGit {
    fn log(&self, repo: &Path, limit: usize) -> Result<Vec<Commit>> {
        let out = git(
            repo,
            [
                "log",
                "--all",
                &format!("--max-count={limit}"),
                &format!("--pretty=format:{FMT}"),
            ],
        )?;
        Ok(parse_commits(&out))
    }

    fn file_diff(&self, repo: &Path, path: &str, staged: bool) -> Result<String> {
        let mut args = vec!["diff", "--no-color"];
        if staged {
            args.push("--cached");
        }
        args.push("--");
        args.push(path);
        git(repo, args)
    }

    fn untracked_diff(&self, repo: &Path, path: &str) -> Result<String> {
        git_lenient(repo, ["diff", "--no-color", "--no-index", "/dev/null", path])
    }

    fn commit_files(&self, repo: &Path, hash: &str) -> Result<Vec<FileStatus>> {
        let out = git(
            repo,
            ["show", "--no-color", "--name-status", "--format=", hash],
        )?;
        Ok(parse_name_status(&out))
    }

    fn commit_diff(&self, repo: &Path, hash: &str, path: &str) -> Result<String> {
        git(repo, ["show", "--no-color", "--format=", hash, "--", path])
    }
}

/// Parsea la salida del pretty-format definido en `FMT`. Pura/testeable.
pub fn parse_commits(out: &str) -> Vec<Commit> {
    let mut commits = Vec::new();
    for record in out.split(RECORD) {
        let record = record.trim_matches(['\n', '\r']);
        if record.is_empty() {
            continue;
        }
        let f: Vec<&str> = record.split(SEP).collect();
        if f.len() < 8 {
            continue;
        }
        let parents = f[2].split_whitespace().map(str::to_string).collect();
        let refs = f[7]
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        commits.push(Commit {
            hash: f[0].to_string(),
            short_hash: f[1].to_string(),
            parents,
            author_name: f[3].to_string(),
            author_email: f[4].to_string(),
            timestamp: f[5].parse().unwrap_or(0),
            subject: f[6].to_string(),
            refs,
        });
    }
    commits
}

/// Parsea la salida de `git show --name-status`. Cada línea es
/// `<estado>\t<path>` (o `R100\t<viejo>\t<nuevo>` en renombrados); nos
/// quedamos con la primera letra del estado y el último campo como path.
fn parse_name_status(out: &str) -> Vec<FileStatus> {
    out.lines()
        .filter(|l| !l.trim().is_empty())
        .filter_map(|line| {
            let mut cols = line.split('\t');
            let status = cols.next()?;
            let path = cols.last()?;
            if path.is_empty() {
                return None;
            }
            Some(FileStatus {
                path: path.to_string(),
                index_status: status.chars().next().unwrap_or(' ').to_string(),
                worktree_status: " ".to_string(),
            })
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    // Reproduce la salida real de:
    // git log --all --pretty=format:'%H%x1f%h%x1f%P%x1f%an%x1f%ae%x1f%at%x1f%s%x1f%D%x1e'
    const SAMPLE: &str = "561646d\u{1f}561646d\u{1f}87643f9\u{1f}Tester\u{1f}t@t.com\u{1f}1781779170\u{1f}en feature\u{1f}feature\u{1e}\n\
87643f9\u{1f}87643f9\u{1f}\u{1f}Tester\u{1f}t@t.com\u{1f}1781779170\u{1f}primer commit\u{1f}HEAD -> main, origin/main\u{1e}";

    #[test]
    fn parses_two_commits() {
        let commits = parse_commits(SAMPLE);
        assert_eq!(commits.len(), 2);
    }

    #[test]
    fn first_commit_has_parent_and_ref() {
        let c = &parse_commits(SAMPLE)[0];
        assert_eq!(c.subject, "en feature");
        assert_eq!(c.parents, vec!["87643f9"]);
        assert_eq!(c.refs, vec!["feature"]);
        assert_eq!(c.timestamp, 1781779170);
    }

    #[test]
    fn root_commit_has_no_parents_and_splits_refs() {
        let c = &parse_commits(SAMPLE)[1];
        assert!(c.parents.is_empty());
        assert_eq!(c.refs, vec!["HEAD -> main", "origin/main"]);
    }

    #[test]
    fn empty_output_yields_no_commits() {
        assert!(parse_commits("").is_empty());
        assert!(parse_commits("\n\n").is_empty());
    }

    const NAME_STATUS: &str = concat!(
        "M\tsrc/main.rs\n",
        "A\tsrc/nuevo.rs\n",
        "D\tviejo.txt\n",
        "R100\tantes.txt\tdespues.txt\n",
    );

    #[test]
    fn parses_all_name_status_entries() {
        assert_eq!(parse_name_status(NAME_STATUS).len(), 4);
    }

    #[test]
    fn keeps_status_letter() {
        let files = parse_name_status(NAME_STATUS);
        assert_eq!(files[0].index_status, "M");
        assert_eq!(files[1].index_status, "A");
        assert_eq!(files[2].index_status, "D");
        assert_eq!(files[3].index_status, "R");
    }

    #[test]
    fn rename_keeps_new_path() {
        let files = parse_name_status(NAME_STATUS);
        assert_eq!(files[3].path, "despues.txt");
    }
}
