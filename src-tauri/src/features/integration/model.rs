use serde::Serialize;

#[derive(Serialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ConflictState {
    pub operation: String,
    pub files: Vec<String>,
}
