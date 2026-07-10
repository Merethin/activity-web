use std::convert::Infallible;

use axum::{Form, extract::State, http::StatusCode, response::{Sse, sse::{Event as SseEvent, KeepAlive}}};
use futures_util::stream::{Stream};
use async_stream::try_stream;
use serde::Deserialize;

use crate::{filter::EventFilter, models::Event, state::AppState};

#[derive(Deserialize, Clone)]
pub struct StreamQuery {
    pub filter: String,
}

pub async fn create_stream(
    State(state): State<AppState>,
    Form(params): Form<StreamQuery>,
) -> Result<Sse<impl Stream<Item = Result<SseEvent, Infallible>>>, (StatusCode, String)> {
    let mut rx = state.inner.broadcast.subscribe();

    let Some(filter): Option<EventFilter> = serde_json::from_str(&params.filter).ok() else {
        return Err((StatusCode::BAD_REQUEST, "Invalid parameters".into()));
    };

    Ok(Sse::new(try_stream! {
        yield SseEvent::default().comment("connected");

        while let Ok(event) = rx.recv().await {
            if filter.matches(&event) {
                let Ok(data) = serde_json::to_string(&Event::from_akari_event(event)) else {
                    continue;
                };

                yield SseEvent::default().data(data);
            }
        }
    }).keep_alive(KeepAlive::new().text("keep-alive")))
}