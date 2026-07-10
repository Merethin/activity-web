use serde::Deserialize;
use sqlx::{Postgres, QueryBuilder};

#[derive(Debug, Deserialize, Clone)]
pub struct Pagination {
    direction: Direction,
    anchor: Option<Anchor>,
}

#[derive(Debug, Deserialize, Clone)]
pub enum Direction {
    Ascending,
    Descending,
}

#[derive(Debug, Deserialize, Clone)]
pub enum Anchor {
    Time(i64),
    Cursor(i64),
}

impl Pagination {
    pub fn has_anchor(&self) -> bool {
        self.anchor.is_some()
    }

    pub fn write_filter(
        &self,
        qb: &mut QueryBuilder<Postgres>,
    ) {
        match self.direction {
            Direction::Ascending => {
                match self.anchor {
                    Some(Anchor::Cursor(id)) => {
                        qb.push("event > ");
                        qb.push_bind(id);
                    },
                    Some(Anchor::Time(time)) => {
                        qb.push("event >= (SELECT event FROM akari_events WHERE time >= ");
                        qb.push_bind(time);
                        qb.push(" ORDER BY time ASC, event ASC LIMIT 1)");
                    }
                    _ => {},
                }
            },
            Direction::Descending => {
                match self.anchor {
                    Some(Anchor::Cursor(id)) => {
                        qb.push("event < ");
                        qb.push_bind(id);
                    },
                    Some(Anchor::Time(time)) => {
                        qb.push("event <= (SELECT event FROM akari_events WHERE time <= ");
                        qb.push_bind(time);
                        qb.push(" ORDER BY time DESC, event DESC LIMIT 1)");
                    }
                    _ => {},
                }
            }
        };
    }

    pub fn write_ordering(
        &self,
        qb: &mut QueryBuilder<Postgres>,
    ) {
        match self.direction {
            Direction::Ascending => qb.push(" ORDER BY event ASC"),
            Direction::Descending => qb.push(" ORDER BY event DESC"),
        };
    }
}