use serde::{Serialize, Deserialize};
use sqlx::FromRow;

use caramel::types::akari::Event as AkariEvent;
use crate::filter::search::DatabaseEvent;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Event {
    pub event: i64,
    pub time: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actor: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub receptor: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub origin: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub destination: Option<String>,
    pub category: String,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub data: Vec<String>,
}

impl Event {
    pub fn from_db_event(other: DatabaseEvent) -> Self {
        Self {
            event: other.event,
            time: other.time as u64,
            actor: other.actor,
            receptor: other.receptor,
            origin: other.origin,
            destination: other.destination,
            category: other.category,
            data: other.data,
        }
    }

    pub fn from_akari_event(other: AkariEvent) -> Self {
        Self {
            event: other.event,
            time: other.time,
            actor: other.actor,
            receptor: other.receptor,
            origin: other.origin,
            destination: other.destination,
            category: other.category,
            data: other.data,
        }
    }
}