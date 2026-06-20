//! Slice system: abrir una ruta en editor/terminal/finder. No usa git, así que
//! su adaptador de salida vive en `os.rs` (no `git_cli.rs`).

pub mod ipc;
pub mod model;
pub mod os;
pub mod port;
pub mod use_case;
