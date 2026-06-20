//! Slice working_tree: estado del árbol de trabajo y operaciones de staging
//! (stage/unstage/discard/commit). Status y changes van juntos porque cada
//! mutación devuelve el `RepoStatus` actualizado.

pub mod git_cli;
pub mod ipc;
pub mod model;
pub mod port;
pub mod use_case;
