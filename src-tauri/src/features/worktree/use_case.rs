use std::path::Path;

use super::model::{NewWorktree, Worktree};
use super::port::WorktreePort;
use crate::shared::error::Result;

// Casos de uso: orquestan el puerto. Tras una mutación devuelven la lista
// actualizada, que es lo que el frontend espera tras la operación.

pub fn list(port: &dyn WorktreePort, repo: &Path) -> Result<Vec<Worktree>> {
    port.list(repo)
}

pub fn add(port: &dyn WorktreePort, repo: &Path, spec: NewWorktree) -> Result<Vec<Worktree>> {
    port.add(repo, &spec)?;
    port.list(repo)
}

pub fn remove(
    port: &dyn WorktreePort,
    repo: &Path,
    path: &str,
    force: bool,
) -> Result<Vec<Worktree>> {
    port.remove(repo, path, force)?;
    port.list(repo)
}

pub fn prune(port: &dyn WorktreePort, repo: &Path) -> Result<Vec<Worktree>> {
    port.prune(repo)?;
    port.list(repo)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::shared::error::AppError;
    use std::sync::Mutex;

    // Puerto falso: registra el orden de llamadas. Sin git ni FS de por medio.
    // `Mutex` (no `RefCell`) porque el puerto es `Send + Sync`.
    #[derive(Default)]
    struct FakePort {
        calls: Mutex<Vec<&'static str>>,
        fail_mutation: bool,
    }

    impl FakePort {
        fn calls(&self) -> Vec<&'static str> {
            self.calls.lock().unwrap().clone()
        }
    }

    impl WorktreePort for FakePort {
        fn list(&self, _repo: &Path) -> Result<Vec<Worktree>> {
            self.calls.lock().unwrap().push("list");
            Ok(vec![Worktree {
                path: "/wt".into(),
                ..Default::default()
            }])
        }
        fn add(&self, _repo: &Path, _spec: &NewWorktree) -> Result<()> {
            self.calls.lock().unwrap().push("add");
            self.result()
        }
        fn remove(&self, _repo: &Path, _path: &str, _force: bool) -> Result<()> {
            self.calls.lock().unwrap().push("remove");
            self.result()
        }
        fn prune(&self, _repo: &Path) -> Result<()> {
            self.calls.lock().unwrap().push("prune");
            self.result()
        }
    }

    impl FakePort {
        fn result(&self) -> Result<()> {
            if self.fail_mutation {
                Err(AppError::Git("boom".into()))
            } else {
                Ok(())
            }
        }
    }

    fn spec() -> NewWorktree {
        NewWorktree {
            path: "p".into(),
            branch: "b".into(),
            new_branch: true,
            start: String::new(),
        }
    }

    #[test]
    fn add_mutates_then_relists() {
        let port = FakePort::default();
        let out = add(&port, Path::new("/repo"), spec()).unwrap();
        // El caso de uso compone: primero muta, luego relee.
        assert_eq!(port.calls(), vec!["add", "list"]);
        assert_eq!(out.len(), 1);
    }

    #[test]
    fn add_does_not_relist_when_mutation_fails() {
        let port = FakePort {
            fail_mutation: true,
            ..Default::default()
        };
        let err = add(&port, Path::new("/repo"), spec());
        assert!(err.is_err());
        // Si la mutación falla, no se vuelve a listar (la `?` corta antes).
        assert_eq!(port.calls(), vec!["add"]);
    }

    #[test]
    fn remove_and_prune_also_relist() {
        let port = FakePort::default();
        remove(&port, Path::new("/repo"), "/wt", true).unwrap();
        prune(&port, Path::new("/repo")).unwrap();
        assert_eq!(port.calls(), vec!["remove", "list", "prune", "list"]);
    }
}
