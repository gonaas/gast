use serde::Serialize;

#[derive(Serialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Stash {
    /// Referencia, p.ej. "stash@{0}".
    pub reference: String,
    /// Índice numérico (0 = el más reciente).
    pub index: usize,
    /// Descripción, p.ej. "WIP on main: 1a2b3c subject".
    pub message: String,
}
