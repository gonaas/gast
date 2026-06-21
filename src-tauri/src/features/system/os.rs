use super::model::Target;
use super::port::SystemPort;
#[cfg(target_os = "macos")]
use crate::shared::error::AppError;
use crate::shared::error::Result;
#[cfg(target_os = "macos")]
use std::process::Command;

/// Adaptador de salida del SO. Implementado para macOS vía `open`.
pub struct SystemShell;

impl SystemPort for SystemShell {
    #[cfg(target_os = "macos")]
    fn open(&self, path: &str, target: Target) -> Result<()> {
        let status = match target {
            Target::Editor => Command::new("open")
                .args(["-a", "Visual Studio Code", path])
                .status(),
            Target::Terminal => Command::new("open").args(["-a", "Terminal", path]).status(),
            Target::Finder => Command::new("open").arg(path).status(),
        }
        .map_err(|e| AppError::Spawn(e.to_string()))?;

        if !status.success() {
            return Err(AppError::Git(format!(
                "no se pudo abrir la ruta ({:?})",
                status.code()
            )));
        }
        Ok(())
    }

    #[cfg(not(target_os = "macos"))]
    fn open(&self, _path: &str, _target: Target) -> Result<()> {
        Err(crate::shared::error::AppError::Git(
            "abrir rutas solo está implementado en macOS por ahora".into(),
        ))
    }
}
