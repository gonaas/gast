use serde::Serialize;

#[derive(Serialize, Default, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Worktree {
    pub path: String,
    pub head: Option<String>,
    pub branch: Option<String>,
    pub is_bare: bool,
    pub is_detached: bool,
    pub locked: bool,
    pub prunable: bool,
}

/// Parámetros para crear un worktree (value object del dominio).
/// - `new_branch` true: crea la rama `branch` partiendo de `start` (o de HEAD
///   si está vacío). false: hace checkout de la rama/commit existente `branch`.
pub struct NewWorktree {
    pub path: String,
    pub branch: String,
    pub new_branch: bool,
    pub start: String,
}
