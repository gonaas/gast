use serde::Serialize;

#[derive(Serialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Branch {
    pub name: String,
    pub is_head: bool,
    pub is_remote: bool,
    pub upstream: Option<String>,
    pub target: String,
    /// Commits por delante del upstream (pendientes de push). `None` si no hay upstream.
    pub ahead: Option<u32>,
    /// Commits por detrás del upstream (pendientes de pull). `None` si no hay upstream.
    pub behind: Option<u32>,
    /// El upstream fue borrado (típico tras mergear y borrar la rama de la PR).
    pub gone: bool,
}
