use axum::{Json, extract::State, http::StatusCode};
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
) -> Result<Json<Vec<Event>>, (StatusCode, String)> {
    if !params.filter.validate() {
        return Err((StatusCode::PAYLOAD_TOO_LARGE, "Search query too complex".into()));
    }

    Ok(Json(search(&state.inner.pool, params.pagination, params.filter, params.limit).await.into_iter().map(|v| {
        Event::from_db_event(v)
    }).collect::<Vec<_>>()))
}
