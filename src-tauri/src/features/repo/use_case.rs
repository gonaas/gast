use std::path::Path;

use super::model::{RecentRepo, Repo};
use super::port::{RecentReposStore, RepoPort};
use crate::shared::error::Result;

/// Máximo de repos recientes que se conservan.
const MAX_RECENT: usize = 15;

/// Abre un repo (lo valida con git) y lo registra como reciente. Compone los
/// dos puertos del slice: `RepoPort` (git) y `RecentReposStore` (persistencia).
pub fn open(repo_port: &dyn RepoPort, store: &dyn RecentReposStore, path: &Path) -> Result<Repo> {
    let repo = repo_port.open(path)?;
    record(
        store,
        RecentRepo {
            path: repo.path.clone(),
            name: repo.name.clone(),
        },
    )?;
    Ok(repo)
}

/// Inserta `repo` al frente de la lista de recientes: deduplica por path,
/// lo promueve a la posición 0 y aplica el cap. Devuelve la lista resultante.
pub fn record(store: &dyn RecentReposStore, repo: RecentRepo) -> Result<Vec<RecentRepo>> {
    let mut list = store.load()?;
    list.retain(|r| r.path != repo.path);
    list.insert(0, repo);
    list.truncate(MAX_RECENT);
    store.save(&list)?;
    Ok(list)
}

pub fn list_recent(store: &dyn RecentReposStore) -> Result<Vec<RecentRepo>> {
    store.load()
}

pub fn forget(store: &dyn RecentReposStore, path: &str) -> Result<Vec<RecentRepo>> {
    let mut list = store.load()?;
    list.retain(|r| r.path != path);
    store.save(&list)?;
    Ok(list)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Mutex;

    // Store en memoria: ejercita la lógica de negocio sin tocar disco.
    // `Mutex` (no `RefCell`) porque el puerto es `Send + Sync`.
    #[derive(Default)]
    struct InMemoryStore {
        data: Mutex<Vec<RecentRepo>>,
    }

    impl RecentReposStore for InMemoryStore {
        fn load(&self) -> Result<Vec<RecentRepo>> {
            Ok(self.data.lock().unwrap().clone())
        }
        fn save(&self, repos: &[RecentRepo]) -> Result<()> {
            *self.data.lock().unwrap() = repos.to_vec();
            Ok(())
        }
    }

    // Fake del puerto git: devuelve un Repo fijo a partir del path pedido.
    struct FakeRepoPort;
    impl RepoPort for FakeRepoPort {
        fn open(&self, path: &Path) -> Result<Repo> {
            let path = path.to_string_lossy().to_string();
            let name = path.rsplit('/').next().unwrap_or(&path).to_string();
            Ok(Repo {
                path,
                name,
                head: Some("main".into()),
            })
        }
    }

    fn repo(path: &str) -> RecentRepo {
        RecentRepo {
            path: path.into(),
            name: path.rsplit('/').next().unwrap_or(path).into(),
        }
    }

    #[test]
    fn record_dedupes_and_promotes_to_front() {
        let store = InMemoryStore::default();
        record(&store, repo("/a")).unwrap();
        record(&store, repo("/b")).unwrap();
        // Reabrir /a debe moverlo al frente sin duplicar.
        let list = record(&store, repo("/a")).unwrap();

        let paths: Vec<&str> = list.iter().map(|r| r.path.as_str()).collect();
        assert_eq!(paths, vec!["/a", "/b"]);
    }

    #[test]
    fn record_caps_at_max() {
        let store = InMemoryStore::default();
        for i in 0..(MAX_RECENT + 5) {
            record(&store, repo(&format!("/r{i}"))).unwrap();
        }
        let list = store.load().unwrap();
        assert_eq!(list.len(), MAX_RECENT);
        // El último insertado queda al frente.
        assert_eq!(list[0].path, format!("/r{}", MAX_RECENT + 4));
    }

    #[test]
    fn forget_removes_by_path() {
        let store = InMemoryStore::default();
        record(&store, repo("/a")).unwrap();
        record(&store, repo("/b")).unwrap();

        let list = forget(&store, "/a").unwrap();

        assert_eq!(list.len(), 1);
        assert_eq!(list[0].path, "/b");
    }

    #[test]
    fn open_records_the_opened_repo() {
        let store = InMemoryStore::default();
        let opened = open(&FakeRepoPort, &store, Path::new("/work/myrepo")).unwrap();

        assert_eq!(opened.name, "myrepo");
        let recent = store.load().unwrap();
        assert_eq!(recent.len(), 1);
        assert_eq!(recent[0].path, "/work/myrepo");
        assert_eq!(recent[0].name, "myrepo");
    }
}
