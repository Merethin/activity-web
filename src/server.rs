use axum::routing::post;
use axum_template::engine::Engine;
use caramel::types::akari::Event;
use minijinja::Environment;
use sqlx::{Pool, Postgres};
use tokio::{sync::broadcast, task::JoinHandle};
use std::error::Error;
use std::net::SocketAddr;
use tower_http::services::ServeDir;
use tower_governor::{governor::GovernorConfigBuilder, GovernorLayer};
use axum::{Router, routing::get};

use crate::routes;
use crate::routes::root::main_page;
use crate::state::AppState;

pub async fn spawn_server(
    pool: Pool<Postgres>,
    broadcast: broadcast::Sender<Event>,
    environment: Environment<'static>,
) -> JoinHandle<Result<(), Box<dyn Error + Send + Sync>>> {
    tokio::spawn(async move {
        let governor_conf = GovernorConfigBuilder::default()
            .per_second(5)
            .burst_size(10)
            .use_headers()
            .finish()
            .unwrap();

        let api = Router::new()
            .route("/events", post(routes::events::list_events))
            .route("/stream", get(routes::stream::create_stream))
            .layer(GovernorLayer::new(governor_conf));

        let state = AppState::new(pool, broadcast, Engine::from(environment));

        let app = Router::new()
            .route("/", get(main_page))
            .nest("/api", api)
            .nest_service("/js", ServeDir::new("static"))
            .with_state(state);

        let listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await?;
        axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await?;

        Ok(())
    })
}