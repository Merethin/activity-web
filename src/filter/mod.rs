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

const MAX_NATIONS: usize = 20;
const MAX_REGIONS: usize = 20;
const MAX_NORMAL_CATEGORIES: usize = 50;
const MAX_FILTERED_CATEGORIES: usize = 10;
const MAX_CONSTRAINTS_PER_CATEGORY: usize = 5;
const MAX_CONSTRAINTS_TOTAL: usize = 20;

impl EventFilter {
    pub fn validate(&self) -> bool {
        if let Some(nations) = &self.nations {
            let length = match nations {
                NationFilter::Generic(v) => v.len(),
                NationFilter::Actor(v) => v.len(),
                NationFilter::Receptor(v) => v.len()
            };

            if length > MAX_NATIONS { return false; }
        }

        if let Some(regions) = &self.regions {
            let length = match regions {
                RegionFilter::Generic(v) => v.len(),
                RegionFilter::Origin(v) => v.len(),
                RegionFilter::Destination(v) => v.len()
            };

            if length > MAX_REGIONS { return false; }
        }

        if let Some(categories) = &self.categories {
            if categories.include.len() > MAX_NORMAL_CATEGORIES { return false; }
            if categories.constraints.len() > MAX_FILTERED_CATEGORIES { return false; }

            let mut total_constraints = 0;
            for constraint in &categories.constraints {
                if constraint.operations.len() > MAX_CONSTRAINTS_PER_CATEGORY { return false; }
                total_constraints += constraint.operations.len();
            }

            if total_constraints > MAX_CONSTRAINTS_TOTAL { return false; }
        }

        true
    }

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