//! Slice watcher: vigila el directorio del repo activo con `notify` (debounced)
//! y emite el evento Tauri `repo-changed` cuando detecta cambios en el working
//! tree o en `.git`. A diferencia del resto de slices no devuelve un `Result`
//! con datos: es infraestructura que empuja eventos al frontend, así que no
//! tiene puerto/adaptador intercambiable.

pub mod ipc;
pub mod service;

pub use service::WatcherState;
