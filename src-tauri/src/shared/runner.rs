use std::ffi::OsStr;
use std::path::Path;
use std::process::Command;

use crate::shared::error::{AppError, Result};

/// Ejecuta trabajo bloqueante (subprocesos git) en el pool de blocking de
/// Tauri/tokio, fuera de los workers del runtime async y del hilo de la UI.
/// Aplana el `JoinError` (cancelación/panic de la tarea) a `AppError::Spawn`
/// y deja pasar el `AppError` del propio comando git.
pub async fn blocking<T, F>(f: F) -> Result<T>
where
    F: FnOnce() -> Result<T> + Send + 'static,
    T: Send + 'static,
{
    tauri::async_runtime::spawn_blocking(f)
        .await
        .map_err(|e| AppError::Spawn(e.to_string()))?
}

pub fn git<I, S>(repo: &Path, args: I) -> Result<String>
where
    I: IntoIterator<Item = S>,
    S: AsRef<OsStr>,
{
    let output = run(repo, args)?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(AppError::Git(if stderr.is_empty() {
            format!("código de salida {:?}", output.status.code())
        } else {
            stderr
        }));
    }
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

pub fn git_lenient<I, S>(repo: &Path, args: I) -> Result<String>
where
    I: IntoIterator<Item = S>,
    S: AsRef<OsStr>,
{
    let output = run(repo, args)?;
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

fn run<I, S>(repo: &Path, args: I) -> Result<std::process::Output>
where
    I: IntoIterator<Item = S>,
    S: AsRef<OsStr>,
{
    Command::new("git")
        .arg("-C")
        .arg(repo)
        .args(args)
        .env("GIT_EDITOR", "true")
        .env("GIT_SEQUENCE_EDITOR", "true")
        .env("GIT_TERMINAL_PROMPT", "0")
        // Evita que comandos de lectura (status/diff/log) reescriban `.git/index`
        // para refrescar el stat-cache: ese write disparaba el file watcher, que
        // recargaba el estado, que volvía a correr status… un bucle infinito.
        .env("GIT_OPTIONAL_LOCKS", "0")
        .output()
        .map_err(|e| AppError::Spawn(e.to_string()))
}
