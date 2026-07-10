use std::{error::Error, fs};
use minijinja::Environment;
use tokio::sync::broadcast;
use sqlx::PgPool;
use caramel::log::setup_log;
use futures::future;

use crate::server::spawn_server;

mod routes;
mod models;
mod state;
mod server;
mod akari;
mod filter;
mod ui;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    setup_log(vec![]);

    dotenv::dotenv().ok();

    let (tx, _) = broadcast::channel(100);
    let pool = PgPool::connect(&std::env::var("DATABASE_URL").unwrap()).await?;

    let mut env = Environment::new();
    env.add_template_owned("main", fs::read_to_string("templates/index.html")?)?;

    let akari_handle = akari::start_akari_stream(
        std::env::var("RABBITMQ_URL").unwrap(), tx.clone()
    ).await;

    let server_handle = spawn_server(pool, tx, env).await;

    future::try_join_all(vec![
        akari_handle,
        server_handle
    ]).await?;

    Ok(())
}