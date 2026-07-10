mod ext;

use serde::Serialize;
use ext::*;

#[derive(Serialize)]
pub struct UIParameters {
    activity_groups: Vec<UIGroup>,
}

impl UIParameters {
    pub fn generate() -> Self {
        Self {
            activity_groups: vec![
                UIGroup::new("Laws", vec![
                    UIItem::new("law", "Legislation Passed", Some(LAW_EXT)),
                    UIItem::new("rsadopt", "General Assembly Resolution Adopted", Some(RSADOPT_EXT)),
                ]),
                UIGroup::new("Changes", vec![
                    UIItem::new("chclass", "Classification Changed", None),
                    UIItem::new("chcensus", "Census Rank Updated", None),
                    UIItem::new("chfield", "Custom Field Updated", None),
                    UIItem::new("chflag", "Nation Flag Changed", None),
                    UIItem::new("nbanner", "Nation Banner Uploaded", None),
                    UIItem::new("chbanner", "Nation Banner Changed", None),
                    UIItem::new("chinf", "Nation Influence Changed", None),
                    UIItem::new("rvfield", "Custom Field Deleted", None),
                ]),
                UIGroup::new("Dispatches", vec![
                    UIItem::new("dispatch", "New Dispatch", None),
                ]),
                UIGroup::new("RMB", vec![
                    UIItem::new("rmbpost", "New RMB Post", None),
                    UIItem::new("rmbnsupp", "RMB Post Suppressed", None),
                    UIItem::new("rmbrsupp", "RMB Post Unsuppressed", None),
                ]),
                UIGroup::new("Embassies", vec![
                    UIItem::new("ereq", "Embassy Request Sent", None),
                    UIItem::new("epull", "Embassy Request Withdrawn", None),
                    UIItem::new("eaccept", "Embassy Request Accepted", None),
                    UIItem::new("ereject", "Embassy Request Rejected", None),
                    UIItem::new("eabort", "Embassy Construction Cancelled", None),
                    UIItem::new("eclose", "Embassy Closure Ordered", None),
                    UIItem::new("ecancel", "Embassy Closure Cancelled", None),
                    UIItem::new("ewish", "Wish to Cancel Embassy Closure Sent", None),
                    UIItem::new("eufinish", "Embassy Construction Finished", None),
                    UIItem::new("euabort", "Embassy Construction Aborted (Region CTEd)", None),
                    UIItem::new("euclose", "Embassy Closure Finished", None),
                ]),
                UIGroup::new("Ejections & Bans", vec![
                    UIItem::new("eject", "Officer Ejected Nation", None),
                    UIItem::new("banject", "Officer Ejected and Banned Nation", None),
                    UIItem::new("ban", "Officer Banned Nation", None),
                    UIItem::new("unban", "Officer Removed Nation from Banlist", None),
                ]),
                UIGroup::new("Region Admin", vec![
                    UIItem::new("rfound", "Region Founded", None),
                    UIItem::new("srbanner", "Region Banner Set", None),
                    UIItem::new("crbanner", "Region Banner Changed", None),
                    UIItem::new("crflag", "Region Flag Updated", None),
                    UIItem::new("rrflag", "Region Flag Removed", None),
                    UIItem::new("addtag", "Tag Added to Region", None),
                    UIItem::new("rmtag", "Tag Removed from Region", None),
                    UIItem::new("nwelcome", "Welcome Telegram Created", None),
                    UIItem::new("rwelcome", "Welcome Telegram Deleted", None),
                    UIItem::new("rwfe", "World Factbook Entry Updated", None),
                    UIItem::new("amapwf", "Most Supported Map added to Factbook", None),
                    UIItem::new("rmapwf", "Most Supported Map removed from Factbook", None),
                    UIItem::new("setpw", "Regional Password Set", None),
                    UIItem::new("changepw", "Regional Password Changed", None),
                    UIItem::new("rmpw", "Regional Password Removed", None),
                    UIItem::new("npoll", "Regional Poll Created", None),
                    UIItem::new("rmpoll", "Regional Poll Deleted", None),
                    UIItem::new("nqpoll", "Regional Poll Queued", None),
                    UIItem::new("rmqpoll", "Queued Regional Poll Deleted", None),
                    UIItem::new("addxrmb", "Embassy Posting Enabled", None),
                    UIItem::new("remxrmb", "Embassy Posting Disabled", None),
                    UIItem::new("rupdate", "Region Updated", None),
                    UIItem::new("rfeature", "Region Featured", None),
                    UIItem::new("rmapfeat", "Regional Map Featured", None),
                    UIItem::new("wzbanexp", "Warzone Bans Expired", None),
                ]),
                UIGroup::new("Officers", vec![
                    UIItem::new("roadd", "Regional Officer Appointed", None),
                    UIItem::new("rorename", "Regional Officer Renamed", None),
                    UIItem::new("rochange", "Regional Officer Authority Changed", None),
                    UIItem::new("rochname", "Regional Officer Renamed & Authority Changed", None),
                    UIItem::new("roremove", "Regional Officer Dismissed", None),
                    UIItem::new("roresign", "Regional Officer Resigned", None),
                    UIItem::new("rgovtset", "Governor Title Set", None),
                    UIItem::new("rgovtupd", "Governor Title Changed", None),
                    UIItem::new("govabd", "Governor Abdicated", None),
                    UIItem::new("rnewgov", "Nation Ascends to Governor", None),
                    UIItem::new("rsucprio", "Nation's Succession Priority Changed", None),
                ]),
                UIGroup::new("Delegates", vec![
                    UIItem::new("rdelauth", "Delegate Authority Changed", None),
                    UIItem::new("ndel", "Nation Became Delegate", None),
                    UIItem::new("rdel", "Nation Replaced Previous Delegate", None),
                    UIItem::new("ldel", "Nation Lost Delegacy", None),
                ]),
                UIGroup::new("F/S & Annex", vec![
                    UIItem::new("beginfn", "Frontier Conversion Started", None),
                    UIItem::new("stopfn", "Frontier Conversion Cancelled", None),
                    UIItem::new("finishfn", "Frontier Conversion Finished", None),
                    UIItem::new("fngovrem", "Governor Removed at Frontier Conversion", None),
                    UIItem::new("beginst", "Stronghold Conversion Started", None),
                    UIItem::new("stopst", "Stronghold Conversion Cancelled", None),
                    UIItem::new("finishst", "Stronghold Conversion Finished", None),
                    UIItem::new("stgovadd", "Governor Appointed at Stronghold Conversion", None),
                    UIItem::new("annexreq", "Annexation Request Sent", None),
                    UIItem::new("annexrcv", "Annexation Request Received", None),
                    UIItem::new("annexrej", "Annexation Request Rejected", None),
                    UIItem::new("annexacc", "Annexation Request Accepted", None),
                    UIItem::new("annexwth", "Annexation Request Withdrawn", None),
                    UIItem::new("annexfna", "Region is Annexed", None),
                    UIItem::new("annexfnb", "Region Annexed Other", None),
                ]),
                UIGroup::new("Maps", vec![
                    UIItem::new("mcreate", "Map Created", None),
                    UIItem::new("mvcreate", "Map Version Created", None),
                    UIItem::new("mupdate", "Map Updated to Map Version", None),
                    UIItem::new("mnendo", "Map Endorsed", None),
                    UIItem::new("mrendo", "Map Endorsement Moved", None),
                    UIItem::new("mlendo", "Map Endorsement Lost", None),
                    UIItem::new("munendo", "Map Endorsement Withdrawn", None),
                ]),
                UIGroup::new("Moves", vec![
                    UIItem::new("move", "Nation Moved", None),
                ]),
                UIGroup::new("Foundings", vec![
                    UIItem::new("nfound", "Nation Founded", None),
                    UIItem::new("nrefound", "Nation Refounded", None),
                ]),
                UIGroup::new("Endings", vec![
                    UIItem::new("ncte", "Nation Ceased to Exist", None),
                    UIItem::new("rgcte", "Regional Governor Ceased to Exist", None),
                    UIItem::new("rfcte", "Regional Founder Ceased to Exist", None),
                ]),
                UIGroup::new("Votes", vec![
                    UIItem::new("wavote", "WA Vote Cast", None),
                    UIItem::new("wrvote", "WA Vote Withdrawn", None),
                ]),
                UIGroup::new("Resolutions", vec![
                    UIItem::new("rsfloor", "WA Resolution Entered Voting Floor", None),
                    UIItem::new("rspass", "WA Resolution Passed", None),
                    UIItem::new("rsfail", "WA Resolution was Defeated", None),
                    UIItem::new("rdiscard", "WA Resolution was Discarded", None),
                    UIItem::new("rsapp", "Delegate Approved Proposal", None),
                    UIItem::new("rsremapp", "Delegate Withdrew Approval", None),
                    UIItem::new("rssubmit", "Proposal Submitted", None),
                    UIItem::new("rsremsub", "Proposal Withdrawn", None),
                    UIItem::new("rsquorum", "Proposal Failed Quorum", None),
                    UIItem::new("rscensus", "Quorate Proposal Missing Stats", None),
                ]),
                UIGroup::new("Members", vec![
                    UIItem::new("wapply", "Nation Applied to WA", None),
                    UIItem::new("wadmit", "Nation Admitted to WA", None),
                    UIItem::new("wresign", "Nation Resigned from WA", None),
                    UIItem::new("wkick", "Nation Ejected from WA", None),
                ]),
                UIGroup::new("Endorsements", vec![
                    UIItem::new("wendo", "Endorsement Given", None),
                    UIItem::new("wunendo", "Endorsement Withdrawn", None),
                ]),
                UIGroup::new("Secretariat", vec![
                    UIItem::new("secenter", "Nation Entered WASec Election", None),
                    UIItem::new("secvote", "Nation Voted in WASec Election", None),
                    UIItem::new("secrvote", "Nation Removed Vote in WASec Election", None),
                    UIItem::new("secelect", "Nation Elected to Secretariat", None),
                ]),
                UIGroup::new("Other", vec![
                    UIItem::new("modkick", "Nation Removed from Region by Moderation", None),
                    UIItem::new("nrspass", "Nation's WA Resolution Passed", None),
                    UIItem::new("rcvban", "Nation Banned from Region", None),
                    UIItem::new("rcvunban", "Nation Removed from Region Banlist", None),
                    UIItem::new("nscnom", "Nation Nominated in Security Council C/C", None),
                    UIItem::new("rscnom", "Region Nominated in Security Council C/C", None),
                    UIItem::new("rsctg", "Region Targeted by Security Council Proposal", None),
                    UIItem::new("nscpass", "Security Council Resolution Nominating Nation Passed", None),
                    UIItem::new("rscpass", "Security Council Resolution Nominating Region Passed", None),
                    UIItem::new("rscrep", "Security Council Resolution Nominating Region Repealed", None),
                    UIItem::new("rsvtopic", "Forum Topic Updated for At-Vote Resolution", None),
                    UIItem::new("rsptopic", "Forum Topic Updated for Proposal", None),
                    UIItem::new("unknown", "Unknown Happenings (not parsed)", None),
                    UIItem::new("skipped", "Skipped Happenings (superfluous)", None),
                ]),
            ]
        }
    }
}

#[derive(Serialize)]
pub struct UIGroup {
    pub label: &'static str,
    pub items: Vec<UIItem>,
}

impl UIGroup {
    pub fn new(label: &'static str, items: Vec<UIItem>) -> Self {
        Self {
            label, items
        }
    }
}

#[derive(Serialize)]
pub struct UIItem {
    event: &'static str,
    label: &'static str,
    ext: Option<&'static str>
}

impl UIItem {
    pub fn new(event: &'static str, label: &'static str, ext: Option<&'static str>) -> Self {
        Self {
            event, 
            label, 
            ext
        }
    }
}