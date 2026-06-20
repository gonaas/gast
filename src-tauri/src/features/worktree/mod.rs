//! Slice worktree: listar, crear, eliminar y limpiar worktrees.
//! Anatomía hexagonal: model (dominio) → port (interfaz) → use_case
//! (aplicación) → git_cli (adaptador de salida) → ipc (adaptador de entrada).

pub mod git_cli;
pub mod ipc;
pub mod model;
pub mod port;
pub mod use_case;
