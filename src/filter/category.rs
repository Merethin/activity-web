use caramel::types::akari::Event;
use serde::Deserialize;
use sqlx::{Postgres, QueryBuilder};

#[derive(Debug, Deserialize, Clone)]
pub struct CategoryFilter {
    include: Vec<String>,
    constraints: Vec<CategoryConstraint>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct CategoryConstraint {
    category: String,
    operations: Vec<ConstraintOp>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type")]
pub enum ConstraintOp {
    In(InOp),
    StartsWith(StartsWithOp),
    HasSubstring(HasSubstringOp),
    Contains(ContainsOp),
}

#[derive(Debug, Clone, Deserialize)]
pub struct InOp {
    index: i64,
    values: Vec<String>
}

#[derive(Debug, Clone, Deserialize)]
pub struct StartsWithOp {
    index: i64,
    value: String
}

#[derive(Debug, Clone, Deserialize)]
pub struct HasSubstringOp {
    index: i64,
    value: String
}

#[derive(Debug, Clone, Deserialize)]
pub struct ContainsOp {
    start: Option<i64>,
    value: String
}

fn escape_like(s: &str) -> String {
    s.replace(
        '\\', "\\\\"
    ).replace(
        '%', "\\%"
    ).replace(
        '_', "\\_"
    )
}

impl CategoryFilter {
    pub fn is_empty(&self) -> bool {
        self.include.is_empty() && self.constraints.is_empty()
    }

    pub fn write_sql(
        &self,
        qb: &mut QueryBuilder<Postgres>,
    ) {
        if !self.include.is_empty() {
            qb.push("category = ANY(");
            qb.push_bind(self.include.clone());
            qb.push(")");
        }

        for (index, constraint) in self.constraints.iter().enumerate() {
            if index != 0 || !self.include.is_empty() { qb.push(" OR "); }
            qb.push("(");
            constraint.write_sql(qb);
            qb.push(")");
        }
    }

    pub fn matches(
        &self,
        event: &Event
    ) -> bool {
        if self.include.contains(&event.category) { return true; }
        for constraint in &self.constraints {
            if constraint.matches(event) { return true; }
        }

        false
    }
}

impl CategoryConstraint {
    pub fn write_sql(
        &self,
        qb: &mut QueryBuilder<Postgres>,
    ) {
        qb.push("category = ");
        qb.push_bind(self.category.clone());

        for op in &self.operations {
            match op {
                ConstraintOp::In(op) => {
                    qb.push(" AND data[");
                    qb.push_bind(op.index + 1);
                    qb.push("] = ANY(");
                    qb.push_bind(op.values.clone());
                    qb.push(")");
                },
                ConstraintOp::StartsWith(op) => {
                    qb.push(" AND data[");
                    qb.push_bind(op.index + 1);
                    qb.push("] LIKE ");
                    qb.push_bind(format!("{}%", escape_like(&op.value)));
                    qb.push(" ESCAPE '\\'");
                },
                ConstraintOp::HasSubstring(op) => {
                    qb.push(" AND data[");
                    qb.push_bind(op.index + 1);
                    qb.push("] LIKE ");
                    qb.push_bind(format!("%{}%", escape_like(&op.value)));
                    qb.push(" ESCAPE '\\'");
                },
                ConstraintOp::Contains(op) => {
                    qb.push(" AND ");
                    qb.push_bind(op.value.clone());
                    qb.push(" = ANY(data");
                    if let Some(start) = op.start {
                        qb.push("[");
                        qb.push_bind(start);
                        qb.push(":]");
                    }
                    qb.push(")");
                }
            }
        }
    }

    pub fn matches(
        &self,
        event: &Event
    ) -> bool {
        if self.category != event.category { return false; }

        for op in &self.operations {
            match op {
                ConstraintOp::In(op) => {
                    match event.data.get(op.index as usize) {
                        None => return false,
                        Some(value) => if !op.values.contains(value) {
                            return false
                        }
                    }
                },
                ConstraintOp::StartsWith(op) => {
                    match event.data.get(op.index as usize) {
                        None => return false,
                        Some(value) => if !value.starts_with(&op.value) {
                            return false
                        }
                    }
                },
                ConstraintOp::HasSubstring(op) => {
                    match event.data.get(op.index as usize) {
                        None => return false,
                        Some(value) => if !value.contains(&op.value) {
                            return false
                        }
                    }
                },
                ConstraintOp::Contains(op) => {
                    match op.start {
                        None => if !event.data.contains(&op.value) { return false; }
                        Some(start) => {
                            if start as usize >= event.data.len() { return false; }
                            if !event.data[(start as usize)..].contains(&op.value) { return false; }
                        }
                    }
                }
            }
        }

        true
    }
}