use serde::Serialize;

#[derive(Serialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Commit {
    pub hash: String,
    pub short_hash: String,
    pub parents: Vec<String>,
    pub author_name: String,
    pub author_email: String,
    pub timestamp: i64,
    pub subject: String,
    pub refs: Vec<CommitRef>,
}

/// Tipo de una ref que decora un commit. Sustituye al matcheo de
/// substrings crudos ("tag:", "HEAD", "/") en el frontend: la
/// clasificación se hace una sola vez aquí y el front renderiza por `kind`.
#[derive(Serialize, Debug, PartialEq, Clone, Copy)]
#[serde(rename_all = "camelCase")]
pub enum RefKind {
    /// Etiqueta (`tag: v1.0`).
    Tag,
    /// Rama con checkout actual (`HEAD -> main`).
    Current,
    /// Rama de remoto (`origin/main`).
    Remote,
    /// Rama local sin checkout.
    Local,
}

#[derive(Serialize, Debug, PartialEq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CommitRef {
    pub kind: RefKind,
    pub name: String,
}

#[derive(Serialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct GraphRow {
    pub hash: String,
    pub col: usize,
    pub links_down: Vec<[usize; 2]>,
    pub merges: Vec<usize>,
    pub width: usize,
}

pub fn layout(commits: &[Commit]) -> Vec<GraphRow> {
    let mut lanes: Vec<Option<String>> = Vec::new();
    let mut rows = Vec::with_capacity(commits.len());

    for c in commits {
        let mut col: Option<usize> = None;
        let mut merges = Vec::new();
        for (j, lane) in lanes.iter_mut().enumerate() {
            if lane.as_deref() == Some(c.hash.as_str()) {
                match col {
                    None => col = Some(j),
                    Some(_) => {
                        merges.push(j);
                        *lane = None;
                    }
                }
            }
        }
        let col = col.unwrap_or_else(|| alloc_lane(&mut lanes));

        let mut parent_lanes = Vec::new();
        if let Some(first) = c.parents.first() {
            lanes[col] = Some(first.clone());
            parent_lanes.push(col);
            for p in &c.parents[1..] {
                let idx = alloc_lane(&mut lanes);
                lanes[idx] = Some(p.clone());
                parent_lanes.push(idx);
            }
        } else {
            lanes[col] = None;
        }

        let mut links_down = Vec::new();
        for (j, lane) in lanes.iter().enumerate() {
            if lane.is_some() {
                let top = if parent_lanes.contains(&j) { col } else { j };
                links_down.push([top, j]);
            }
        }

        rows.push(GraphRow {
            hash: c.hash.clone(),
            col,
            links_down,
            merges,
            width: lanes.len(),
        });
    }

    rows
}

fn alloc_lane(lanes: &mut Vec<Option<String>>) -> usize {
    match lanes.iter().position(Option::is_none) {
        Some(free) => free,
        None => {
            lanes.push(None);
            lanes.len() - 1
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn commit(hash: &str, parents: &[&str]) -> Commit {
        Commit {
            hash: hash.into(),
            short_hash: hash.into(),
            parents: parents.iter().map(|s| s.to_string()).collect(),
            author_name: "t".into(),
            author_email: "t@t".into(),
            timestamp: 0,
            subject: hash.into(),
            refs: vec![],
        }
    }

    fn sample() -> Vec<Commit> {
        vec![
            commit("D", &["C"]),
            commit("C", &["B", "X"]),
            commit("B", &["A"]),
            commit("X", &["A"]),
            commit("A", &[]),
        ]
    }

    #[test]
    fn linear_history_stays_in_col_zero() {
        let rows = layout(&[commit("B", &["A"]), commit("A", &[])]);
        assert_eq!(rows[0].col, 0);
        assert_eq!(rows[1].col, 0);
    }

    #[test]
    fn assigns_expected_columns() {
        let rows = layout(&sample());
        let col = |h: &str| rows.iter().find(|r| r.hash == h).unwrap().col;
        assert_eq!(col("D"), 0);
        assert_eq!(col("C"), 0);
        assert_eq!(col("B"), 0);
        assert_eq!(col("X"), 1);
        assert_eq!(col("A"), 0);
    }

    #[test]
    fn merge_commit_opens_second_parent_lane() {
        let rows = layout(&sample());
        let c = rows.iter().find(|r| r.hash == "C").unwrap();
        assert!(c.links_down.contains(&[0, 0]));
        assert!(c.links_down.contains(&[0, 1]));
    }

    #[test]
    fn lanes_collapse_at_shared_ancestor() {
        let rows = layout(&sample());
        let a = rows.iter().find(|r| r.hash == "A").unwrap();
        assert_eq!(a.merges, vec![1]);
        assert_eq!(a.col, 0);
        assert!(a.links_down.is_empty());
    }

    #[test]
    fn root_commit_has_no_links_down() {
        let rows = layout(&[commit("A", &[])]);
        assert!(rows[0].links_down.is_empty());
    }
}
