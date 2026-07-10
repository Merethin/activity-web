pub mod category;
pub mod search;
pub mod pagination;

use category::CategoryFilter;

use caramel::types::akari::Event;
use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct EventFilter {
    pub nations: Option<NationFilter>,
    pub regions: Option<RegionFilter>,
    pub categories: Option<CategoryFilter>,
}

#[derive(Debug, Deserialize, Clone)]
pub enum NationFilter {
    Generic(Vec<String>),
    Actor(Vec<String>),
    Receptor(Vec<String>),
}

#[derive(Debug, Deserialize, Clone)]
pub enum RegionFilter {
    Generic(Vec<String>),
    Origin(Vec<String>),
    Destination(Vec<String>),
}

impl EventFilter {
    pub fn matches(
        &self,
        event: &Event
    ) -> bool {
        if let Some(filter) = &self.categories && !filter.is_empty() && !filter.matches(event) {
            return false;
        }

        match &self.nations {
            Some(NationFilter::Generic(filter)) => {
                if !filter.is_empty() {
                    if !event.actor.as_ref().map(|v| filter.contains(v)).unwrap_or(false)
                    && !event.receptor.as_ref().map(|v| filter.contains(v)).unwrap_or(false) {
                        return false;
                    }
                }
            },
            Some(NationFilter::Actor(filter)) => {
                if !filter.is_empty() {
                    if !event.actor.as_ref().map(|v| filter.contains(v)).unwrap_or(false) {
                        return false;
                    }
                }
            },
            Some(NationFilter::Receptor(filter)) => {
                if !filter.is_empty() {
                    if !event.receptor.as_ref().map(|v| filter.contains(v)).unwrap_or(false) {
                        return false;
                    }
                }
            },
            None => {},
        }

        match &self.regions {
            Some(RegionFilter::Generic(filter)) => {
                if !filter.is_empty() {
                    if !event.origin.as_ref().map(|v| filter.contains(v)).unwrap_or(false)
                    && !event.destination.as_ref().map(|v| filter.contains(v)).unwrap_or(false) {
                        return false;
                    }
                }
            },
            Some(RegionFilter::Origin(filter)) => {
                if !filter.is_empty() {
                    if !event.origin.as_ref().map(|v| filter.contains(v)).unwrap_or(false) {
                        return false;
                    }
                }
            },
            Some(RegionFilter::Destination(filter)) => {
                if !filter.is_empty() {
                    if !event.destination.as_ref().map(|v| filter.contains(v)).unwrap_or(false) {
                        return false;
                    }
                }
            },
            None => {},
        }

        true
    }
}