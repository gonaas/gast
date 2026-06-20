//! Slice repo: abrir y validar un repositorio, y persistir los repos recientes.
//! Tiene dos puertos de salida de tipos distintos: `RepoPort` (git, en
//! `git_cli`) y `RecentReposStore` (persistencia JSON, en `persistence`).

pub mod git_cli;
pub mod ipc;
pub mod model;
pub mod persistence;
pub mod port;
pub mod use_case;
