use std::path::PathBuf;

use super::model::RecentRepo;
use super::port::RecentReposStore;
use crate::shared::error::{AppError, Result};

/// Adaptador de salida de persistencia: guarda los repos recientes como JSON en
/// disco. No usa git; es el primer adaptador de la capa `persistence`.
pub struct RecentReposJson {
    file: PathBuf,
}

impl RecentReposJson {
    pub fn new(file: PathBuf) -> Self {
        Self { file }
    }
}

impl RecentReposStore for RecentReposJson {
    fn load(&self) -> Result<Vec<RecentRepo>> {
        match std::fs::read_to_string(&self.file) {
            Ok(text) => serde_json::from_str(&text).map_err(|e| AppError::Spawn(e.to_string())),
            // Aún no hay fichero (primer arranque): lista vacía, no es un error.
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(Vec::new()),
            Err(e) => Err(AppError::Spawn(e.to_string())),
        }
    }

    fn save(&self, repos: &[RecentRepo]) -> Result<()> {
        if let Some(parent) = self.file.parent() {
            std::fs::create_dir_all(parent).map_err(|e| AppError::Spawn(e.to_string()))?;
        }
        let text =
            serde_json::to_string_pretty(repos).map_err(|e| AppError::Spawn(e.to_string()))?;
        std::fs::write(&self.file, text).map_err(|e| AppError::Spawn(e.to_string()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_file(tag: &str) -> PathBuf {
        // Único por proceso y test para no pisar otros runs en paralelo.
        std::env::temp_dir().join(format!("ast-git-{}-{}.json", tag, std::process::id()))
    }

    fn repo(path: &str) -> RecentRepo {
        RecentRepo {
            path: path.into(),
            name: path.rsplit('/').next().unwrap_or(path).into(),
        }
    }

    #[test]
    fn save_then_load_round_trips() {
        let file = temp_file("roundtrip");
        let store = RecentReposJson::new(file.clone());
        let repos = vec![repo("/a/uno"), repo("/b/dos")];

        store.save(&repos).unwrap();
        let loaded = store.load().unwrap();

        std::fs::remove_file(&file).ok();
        assert_eq!(loaded, repos);
    }

    #[test]
    fn load_missing_file_yields_empty() {
        let store = RecentReposJson::new(temp_file("missing-never-written"));
        assert!(store.load().unwrap().is_empty());
    }

    #[test]
    fn save_creates_missing_parent_dirs() {
        let dir = std::env::temp_dir().join(format!("ast-git-nested-{}", std::process::id()));
        let file = dir.join("sub").join("recent.json");
        let store = RecentReposJson::new(file);

        let res = store.save(&[repo("/x/y")]);

        std::fs::remove_dir_all(&dir).ok();
        assert!(res.is_ok());
    }
}
