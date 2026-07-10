use std::sync::Arc;

use caramel::types::akari::Event;
use sqlx::PgPool;
use tokio::sync::broadcast::Sender;
use axum_template::engine::Engine;
use minijinja::Environment;

pub type AppEngine = Engine<Environment<'static>>;

#[derive(Clone)]
pub struct AppState {
    pub inner: Arc<InnerState>,
    pub engine: AppEngine,
}

pub struct InnerState {
    pub pool: PgPool,
    pub broadcast: Sender<Event>,
}

impl AppState {
    pub fn new(
        pool: PgPool,
        broadcast: Sender<Event>,
        engine: AppEngine,
    ) -> Self {
        Self {
            inner: Arc::new(InnerState { pool, broadcast }),
            engine
        }
    }
}