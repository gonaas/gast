use serde::{Serialize, Serializer};

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("no se pudo ejecutar git: {0}")]
    Spawn(String),
    #[error("git falló: {0}")]
    Git(String),
    #[error("ruta inválida: {0}")]
    InvalidPath(String),
    #[error("IA: {0}")]
    Ai(String),
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
