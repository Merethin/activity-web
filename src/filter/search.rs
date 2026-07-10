use log::info;
use sqlx::{FromRow, PgPool, Postgres, QueryBuilder};
use serde::{Serialize, Deserialize};

use crate::filter::{EventFilter, NationFilter, RegionFilter, pagination::Pagination};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct DatabaseEvent {
    pub event: i64,
    pub time: i64,
    pub actor: Option<String>,
    pub receptor: Option<String>,
    pub origin: Option<String>,
    pub destination: Option<String>,
    pub category: String,
    #[serde(default)]
    pub data: Vec<String>,
}

const DEFAULT_LIMIT: i32 = 50;

pub async fn search(
    pool: &PgPool,
    pagination: Pagination,
    filter: EventFilter,
    limit: Option<i32>,
) -> Vec<DatabaseEvent> {
    let mut qb = QueryBuilder::<Postgres>::new(
        "SELECT event, time, actor, receptor, origin, destination, category, data FROM akari_events WHERE 1=1"
    );

    if pagination.has_anchor() {
        qb.push(" AND ");
        pagination.write_filter(&mut qb);
    };

    match &filter.nations {
        Some(NationFilter::Generic(filter)) => {
            if !filter.is_empty() {
                qb.push(" AND (actor = ANY(");
                qb.push_bind(filter);
                qb.push(") OR receptor = ANY(");
                qb.push_bind(filter);
                qb.push("))");
            }
        },
        Some(NationFilter::Actor(filter)) => {
            if !filter.is_empty() {
                qb.push(" AND actor = ANY(");
                qb.push_bind(filter);
                qb.push(")");
            }
        },
        Some(NationFilter::Receptor(filter)) => {
            if !filter.is_empty() {
                qb.push(" AND receptor = ANY(");
                qb.push_bind(filter);
                qb.push(")");
            }
        },
        None => {},
    }

    match &filter.regions {
        Some(RegionFilter::Generic(filter)) => {
            if !filter.is_empty() {
                qb.push(" AND (origin = ANY(");
                qb.push_bind(filter);
                qb.push(") OR destination = ANY(");
                qb.push_bind(filter);
                qb.push("))");
            }
        },
        Some(RegionFilter::Origin(filter)) => {
            if !filter.is_empty() {
                qb.push(" AND origin = ANY(");
                qb.push_bind(filter);
                qb.push(")");
            }
        },
        Some(RegionFilter::Destination(filter)) => {
            if !filter.is_empty() {
                qb.push(" AND destination = ANY(");
                qb.push_bind(filter);
                qb.push(")");
            }
        },
        None => {},
    }

    if let Some(filter) = &filter.categories && !filter.is_empty() {
        qb.push(" AND (");
        filter.write_sql(&mut qb);
        qb.push(")");
    }

    pagination.write_ordering(&mut qb);

    qb.push(" LIMIT ");
    qb.push_bind(limit.unwrap_or(DEFAULT_LIMIT).clamp(1, 100));

    info!("Generated SQL: {:?}", qb.sql());

    qb.build_query_as::<DatabaseEvent>().fetch_all(pool).await.unwrap()
}