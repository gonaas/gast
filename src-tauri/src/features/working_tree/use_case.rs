use std::path::Path;

use super::model::RepoStatus;
use super::port::WorkingTreePort;
use crate::shared::error::Result;

// Tras cada mutación se relee el estado: es lo que el frontend pinta de vuelta.

pub fn status(port: &dyn WorkingTreePort, repo: &Path) -> Result<RepoStatus> {
    port.status(repo)
}

pub fn stage(port: &dyn WorkingTreePort, repo: &Path, path: &str) -> Result<RepoStatus> {
    port.stage(repo, path)?;
    port.status(repo)
}

pub fn unstage(port: &dyn WorkingTreePort, repo: &Path, path: &str) -> Result<RepoStatus> {
    port.unstage(repo, path)?;
    port.status(repo)
}

pub fn discard(port: &dyn WorkingTreePort, repo: &Path, path: &str) -> Result<RepoStatus> {
    port.discard(repo, path)?;
    port.status(repo)
}

pub fn commit(
    port: &dyn WorkingTreePort,
    repo: &Path,
    message: &str,
    amend: bool,
) -> Result<RepoStatus> {
    port.commit(repo, message, amend)?;
    port.status(repo)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Mutex;

    // Puerto falso que registra llamadas; `Mutex` porque el puerto es Send+Sync.
    #[derive(Default)]
    struct FakePort {
        calls: Mutex<Vec<&'static str>>,
    }

    impl WorkingTreePort for FakePort {
        fn status(&self, _repo: &Path) -> Result<RepoStatus> {
            self.calls.lock().unwrap().push("status");
            Ok(RepoStatus {
                branch: "main".into(),
                files: vec![],
            })
        }
        fn stage(&self, _repo: &Path, _path: &str) -> Result<()> {
            self.calls.lock().unwrap().push("stage");
            Ok(())
        }
        fn unstage(&self, _repo: &Path, _path: &str) -> Result<()> {
            self.calls.lock().unwrap().push("unstage");
            Ok(())
        }
        fn discard(&self, _repo: &Path, _path: &str) -> Result<()> {
            self.calls.lock().unwrap().push("discard");
            Ok(())
        }
        fn commit(&self, _repo: &Path, _message: &str, _amend: bool) -> Result<()> {
            self.calls.lock().unwrap().push("commit");
            Ok(())
        }
    }

    #[test]
    fn stage_relists_status_after_mutation() {
        let port = FakePort::default();
        let out = stage(&port, Path::new("/repo"), "a.txt").unwrap();
        assert_eq!(*port.calls.lock().unwrap(), vec!["stage", "status"]);
        assert_eq!(out.branch, "main");
    }

    #[test]
    fn commit_then_status() {
        let port = FakePort::default();
        commit(&port, Path::new("/repo"), "msg", false).unwrap();
        assert_eq!(*port.calls.lock().unwrap(), vec!["commit", "status"]);
    }
}
