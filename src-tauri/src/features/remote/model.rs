use serde::{Deserialize, Serialize};

#[derive(Serialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Remote {
    pub name: String,
    pub url: String,
}

/// Cómo reconciliar la rama local con su upstream al hacer pull cuando han
/// divergido. Git 2.27+ exige elegir una explícitamente.
#[derive(Deserialize, Debug, Clone, Copy, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum PullStrategy {
    Merge,
    Rebase,
    FfOnly,
}

impl PullStrategy {
    pub fn flag(self) -> &'static str {
        match self {
            Self::Merge => "--no-rebase",
            Self::Rebase => "--rebase",
            Self::FfOnly => "--ff-only",
        }
    }
}
