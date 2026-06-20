/// Dónde abrir una ruta de worktree. Llega deserializado desde el frontend.
#[derive(serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Target {
    Editor,
    Terminal,
    Finder,
}
