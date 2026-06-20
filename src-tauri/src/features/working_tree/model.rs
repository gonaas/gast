use serde::Serialize;

#[derive(Serialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct FileStatus {
    pub path: String,
    /// Estado en el índice (columna X de `git status --porcelain`).
    pub index_status: String,
    /// Estado en el working tree (columna Y).
    pub worktree_status: String,
}

#[derive(Serialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct RepoStatus {
    pub branch: String,
    pub files: Vec<FileStatus>,
}
