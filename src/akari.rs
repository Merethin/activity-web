use std::error::Error;
use caramel::{akari, types::akari::Event};
use lapin::{Connection, ConnectionProperties};
use tokio::{task::JoinHandle, sync::broadcast};

pub async fn start_akari_stream(
    url: String,
    broadcast: broadcast::Sender<Event>,
) -> JoinHandle<Result<(), Box<dyn Error + Send + Sync>>> {
    tokio::spawn(async move {
        let conn = Connection::connect(&url, ConnectionProperties::default()).await?;
        let channel = conn.create_channel().await?;

        let mut consumer = akari::create_consumer(&channel, "akari_events", None).await.unwrap();

        while let Some(event) = akari::consume(&mut consumer).await {
            broadcast.send(event).ok();
        }

        Ok(())
    })
}