use axum::{extract::State, Json};
use serde::Deserialize;

use crate::{filter::{EventFilter, pagination::Pagination, search::search}, models::Event, state::AppState};

#[derive(Deserialize)]
pub struct EventQuery {
    pub limit: Option<i32>,
    pub pagination: Pagination,
    pub filter: EventFilter,
}

pub async fn list_events(
    State(state): State<AppState>,
    Json(params): Json<EventQuery>,
) -> Json<Vec<Event>> {
    Json(search(&state.inner.pool, params.pagination, params.filter, params.limit).await.into_iter().map(|v| {
        Event::from_db_event(v)
    }).collect::<Vec<_>>())
}
