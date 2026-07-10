use axum::{extract::State, response::IntoResponse};
use axum_template::RenderHtml;

use crate::{state::AppState, ui::UIParameters};

pub async fn main_page(
    State(state): State<AppState>,
) -> impl IntoResponse {
    RenderHtml("main", state.engine, UIParameters::generate())
}