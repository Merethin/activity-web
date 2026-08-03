const LOWERCASE_WORDS = new Set([
  "a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "in", "of"
]);

function prettifyName(name) {
    return name.replace(/_/g, " ").split(" ")
        .map(word => {
            if (LOWERCASE_WORDS.has(word)) { return word; }
            if (word.length === 0) { return word; }
            return word[0].toUpperCase() + word.slice(1);
        }).join(" ");
}

function canonicalizeName(name) {
    return name.trim().replace(/ /g, "_").toLowerCase();
}

function nation(name) {
    return `<a href="https://www.nationstates.net/nation=${name}" class="link-primary">${prettifyName(name)}</a>`;
}

function region(name) {
    return `<a href="https://www.nationstates.net/region=${name}" class="link-secondary">${prettifyName(name)}</a>`;
}

function rmbpost(id) {
    return `<a href="https://www.nationstates.net/page=rmb/postid=${id}" class="link-accent">a post</a>`;
}

function dispatch(id, name) {
    return `<a href="https://www.nationstates.net/page=dispatch/id=${id}" class="link-accent">${name}</a>`;
}

function map(id) {
    return `<a href="https://www.nationstates.net/page=map/mid=${id}" class="link-accent">a map</a>`;
}

function map_version(id) {
    return `<a href="https://www.nationstates.net/page=map_version/mvid=${id}" class="link-accent">a map version</a>`;
}

const GA2026_CUTOFF = 1782975600;

function resolution(id, name, chamber, time) {
    let council = 3;
    if (time < GA2026_CUTOFF) council = 1;
    if(chamber === "Security Council") { council = 2; }
    return `<a href="https://www.nationstates.net/page=WA_past_resolution/id=${id}/council=${council}" class="link-accent">${name}</a>`;
}

function coauthors(event, start) {
    if(event.data.length == start) { return nation(event.receptor); }

    let i = start;
    let result = `${nation(event.receptor)}`
    while(i < (event.data.length - 1)) {
        result += `, ${nation(event.data[i])}`;
        i++;
    }
    result += ` and ${nation(event.data[i])}`;

    return result;
}

function authority(line) {
    let prefix = "";
    let authorities = new Array();

    for(let char of line) {
        switch(char) {
            case '+': prefix = "granted "; break;
            case '-': prefix = "removed "; break;
            case 'S': authorities.push(`<span class="font-bold text-[#50d71e]">Successor</span>`); break;
            case 'A': authorities.push(`<span class="font-bold text-[#50d71e]">Appearance</span>`); break;
            case 'B': authorities.push(`<span class="font-bold text-[#50d71e]">Border Control</span>`); break;
            case 'C': authorities.push(`<span class="font-bold text-[#50d71e]">Communications</span>`); break;
            case 'E': authorities.push(`<span class="font-bold text-[#50d71e]">Embassies</span>`); break;
            case 'P': authorities.push(`<span class="font-bold text-[#50d71e]">Polls</span>`); break;
            case 'X': authorities.push(`<span class="font-bold text-[#50d71e]">Executive</span>`); break;
            default: break;
        }
    }

    if(authorities.length == 1) { return `${prefix}${authorities[0]}` }

    let i = 1;
    let result = `${prefix}${authorities[0]}`
    while(i < (authorities.length - 1)) {
        result += `, ${authorities[i]}`;
        i++;
    }
    result += ` and ${authorities[i]}`;

    return result;
}

function chfield(event) {
    if(event.data.length == 2) { return `${nation(event.actor)} changed its national ${event.data[0]} to "${event.data[1]}"`; }

    let i = 2;
    let result = `${nation(event.actor)} changed its national ${event.data[0]} to "${event.data[1]}"`;
    while(i < (event.data.length - 2)) {
        result += `, its ${event.data[i]} to "${event.data[i + 1]}"`;
        i += 2;
    }
    result += ` and its ${event.data[i]} to "${event.data[i + 1]}"`;

    return result;
}

function subrank(list, index) {
    let world = "";
    if(index == 0) { world = "of the world "; }

    if(list.length == 2) { return `the Top ${list[0]}% ${world}for ${list[1]}`; }

    let i = 2;
    let result = `the Top ${list[0]}% ${world}for ${list[1]}`;
    while(i < (list.length - 2)) {
        result += `, ${list[i]}`;
        i++;
    }
    result += ` and ${list[i]}`;

    return result;
}

function chcensus(event) {
    let buffer = new Array();
    let ranks = new Array();
    let index = 0;

    for(let element of event.data) {
        if(!isNaN(element) && buffer.length != 0) {
            ranks.push(subrank(buffer, index));
            buffer = new Array();
            index++;
        }

        buffer.push(element);
    }

    ranks.push(subrank(buffer, index));

    if(ranks.length == 1) { return `${nation(event.receptor)} was ranked in ${ranks[0]}`; }

    let i = 1;
    let result = `${nation(event.receptor)} was ranked in ${ranks[0]}`;
    while(i < (ranks.length - 1)) {
        result += `, ${ranks[i]}`;
        i++;
    }
    result += ` and ${ranks[i]}`;

    return result;
}

function rochange(event) {
    if(event.data.length == 2) {
        let word = "from"
        if(event.data[1].startsWith("+")) { word = "to"; }

        return `${nation(event.actor)} ${authority(event.data[1])} authority ${word} ${nation(event.receptor)} as ${event.data[0]} in ${region(event.origin)}`;
    } else {
        return `${nation(event.actor)} ${authority(event.data[1])} and ${authority(event.data[2])} authority from ${nation(event.receptor)} as ${event.data[0]} in ${region(event.origin)}`;
    }
}

function rochname(event) {
    if(event.data.length == 3) {
        let word = "from"
        if(event.data[2].startsWith("+")) { word = "to"; }

        return `${nation(event.actor)} ${authority(event.data[2])} authority ${word} ${nation(event.receptor)} and renamed the office from "${event.data[0]}" to "${event.data[1]}" in ${region(event.origin)}`;
    } else {
        return `${nation(event.actor)} ${authority(event.data[2])} and ${authority(event.data[3])} authority from ${nation(event.receptor)} and renamed the office from "${event.data[0]}" to "${event.data[1]}" in ${region(event.origin)}`;
    }
}

function rdelauth(event) {
    let delname = "";
    if(event.receptor != null) {
        delname = `${nation(event.receptor)} `;
    }

    if(event.data.length == 1) {
        let word = "from"
        if(event.data[0].startsWith("+")) { word = "to"; }

        return `${nation(event.actor)} ${authority(event.data[0])} authority ${word} the WA Delegate ${delname}in ${region(event.origin)}`;
    } else {
        return `${nation(event.actor)} ${authority(event.data[0])} and ${authority(event.data[1])} authority from the WA Delegate ${delname}in ${region(event.origin)}`;
    }
}

function rssubmit(event) {
    if(event.data[1].length != 0) {
        return `${nation(event.actor)} submitted a proposal to the ${event.data[0]} ${event.data[1]} Board entitled "${event.data[2]}"`;
    } else {
        return `${nation(event.actor)} submitted a proposal to the ${event.data[0]} entitled "${event.data[2]}"`;
    }
}

function formatEventLine(event) {
    switch(event.category) {
        case "law": return `Following new legislation in ${nation(event.actor)}, ${event.data[0]}`;
        case "chclass": return `${nation(event.receptor)} was reclassified from "${event.data[0]}" to "${event.data[1]}"`;
        case "chcensus": return chcensus(event);
        case "chfield": return chfield(event);
        case "chflag": return `${nation(event.actor)} altered its national flag`;
        case "nbanner": return `${nation(event.actor)} created a custom banner`;
        case "chbanner": return `${nation(event.actor)} changed a custom banner`;
        case "chinf": return `${nation(event.receptor)}'s influence in ${region(event.origin)} ${event.data[0]} from "${event.data[1]}" to "${event.data[2]}"`;
        case "rvfield": return `${nation(event.actor)} revoked its national ${event.data[0]}`;
        case "dispatch": return `${nation(event.actor)} published ${dispatch(event.data[0], event.data[1])} (${event.data[2]}: ${event.data[3]})`;
        case "rmbpost": return `${nation(event.actor)} lodged ${rmbpost(event.data[0])} on the ${region(event.origin)} RMB`;
        case "rmbnsupp": return `${nation(event.actor)} suppressed a post on the ${region(event.origin)} RMB`;
        case "rmbrsupp": return `${nation(event.actor)} unsuppressed a post on the ${region(event.origin)} RMB`;
        case "ereq": return `${nation(event.actor)} proposed constructing embassies between ${region(event.origin)} and ${region(event.destination)}`;
        case "eaccept": return `${nation(event.actor)} agreed to construct embassies between ${region(event.origin)} and ${region(event.destination)}`;
        case "ecancel": return `${nation(event.actor)} cancelled the closure of embassies between ${region(event.origin)} and ${region(event.destination)}`;
        case "ewish": return `${nation(event.actor)} indicated that ${region(event.origin)} did not wish to close its embassy with ${region(event.destination)}`;
        case "ereject": return `${nation(event.actor)} rejected a request from ${region(event.destination)} for an embassy with ${region(event.origin)}`;
        case "eclose": return `${nation(event.actor)} ordered the closure of embassies between ${region(event.origin)} and ${region(event.destination)}`;
        case "epull": return `${nation(event.actor)} withdrew a request for embassies between ${region(event.origin)} and ${region(event.destination)}`;
        case "eabort": return `${nation(event.actor)} aborted construction of embassies between ${region(event.origin)} and ${region(event.destination)}`;
        case "eufinish": return `Embassy established between ${region(event.origin)} and ${region(event.destination)}`;
        case "euclose": return `Embassy cancelled between ${region(event.origin)} and ${region(event.destination)}`;
        case "euabort": return `Construction of embassies aborted between ${region(event.origin)} and ${region(event.destination)}`;
        case "eject": return `${nation(event.receptor)} was ejected from ${region(event.origin)} by ${nation(event.actor)}`;
        case "banject": return `${nation(event.receptor)} was ejected and banned from ${region(event.origin)} by ${nation(event.actor)}`;
        case "ban": return `${nation(event.actor)} banned ${nation(event.receptor)} from ${region(event.origin)}`;
        case "unban": return `${nation(event.actor)} removed ${nation(event.receptor)} from the regional ban list in ${region(event.origin)}`;
        case "rcvban": return `${nation(event.receptor)} was banned from ${region(event.origin)} by ${nation(event.actor)}`;
        case "rcvunban": return `${nation(event.receptor)} was removed from the regional ban list of ${region(event.origin)} by ${nation(event.actor)}`;
        case "setpw": return `${nation(event.actor)} password-protected ${region(event.origin)}`;
        case "changepw": return `${nation(event.actor)} changed the regional password in ${region(event.origin)}`;
        case "rmpw": return `${nation(event.actor)} removed regional password protection from ${region(event.origin)}`;
        case "rupdate": return `${region(event.origin)} updated`;
        case "rfeature": return `${region(event.origin)} became the Featured Region of the day`;
        case "rmapfeat": return `${region(event.origin)} became the Featured Map of the day with ${map(event.data[0])}`;
        case "rfound": return `${nation(event.actor)} founded the region ${region(event.origin)}`;
        case "srbanner": return `${nation(event.actor)} set the regional banner of ${region(event.origin)}`;
        case "crbanner": return `${nation(event.actor)} changed the regional banner of ${region(event.origin)}`;
        case "crflag": return `${nation(event.actor)} altered the regional flag of ${region(event.origin)}`;
        case "rrflag": return `${nation(event.actor)} abolished the regional flag of ${region(event.origin)}`;
        case "rmpoll": return `${nation(event.actor)} deleted a regional poll in ${region(event.origin)}`;
        case "rmqpoll": return `${nation(event.actor)} deleted a queued regional poll in ${region(event.origin)}`;
        case "addtag": return `${nation(event.actor)} added the tag "${event.data[0]}" to ${region(event.origin)}`;
        case "rmtag": return `${nation(event.actor)} removed the tag "${event.data[0]}" from ${region(event.origin)}`;
        case "roadd": return `${nation(event.actor)} appointed ${nation(event.receptor)} as ${event.data[0]} with authority over ${authority(event.data[1])} in ${region(event.origin)}`;
        case "rorename": return `${nation(event.actor)} renamed the office held by ${nation(event.receptor)} from "${event.data[0]}" to "${event.data[1]}" in ${region(event.origin)}`;
        case "rochange": return rochange(event);
        case "rochname": return rochname(event);
        case "roremove": return `${nation(event.actor)} dismissed ${nation(event.receptor)} as ${event.data[0]} of ${region(event.origin)}`;
        case "roresign": return `${nation(event.actor)} resigned as ${event.data[0]} of ${region(event.origin)}`;
        case "rgovtset": return `${nation(event.actor)} named the Governor's office <span class="font-bold">${event.data[0]}</span> in ${region(event.origin)}`;
        case "rgovtupd": return `${nation(event.actor)} renamed the Governor's office from "${event.data[0]}" to <span class="font-bold">${event.data[1]}</span> in ${region(event.origin)}`;
        case "rdelauth": return rdelauth(event);
        case "rnewgov": return `${nation(event.receptor)} succeeded ${nation(event.actor)} as Governor of ${region(event.origin)}`;
        case "rsucprio": return `${nation(event.actor)} increased ${nation(event.receptor)}'s succession priority in ${region(event.origin)}`;
        case "nwelcome": return `${nation(event.actor)} composed a new Welcome Telegram for ${region(event.origin)}`;
        case "rwelcome": return `${nation(event.actor)} canceled the new Welcome Telegram of ${region(event.origin)}`;
        case "rwfe": return `${nation(event.actor)} updated the World Factbook Entry in ${region(event.origin)}`;
        case "amapwf": return `${nation(event.actor)} added the most supported regional map to the world factbook of ${region(event.origin)}`;
        case "rmapwf": return `${nation(event.actor)} removed the most supported regional map from the world factbook of ${region(event.origin)}`;
        case "ndel": return `${nation(event.receptor)} became WA Delegate of ${region(event.origin)}`;
        case "rdel": return `${nation(event.receptor)} seized the position of ${region(event.origin)} WA Delegate from ${nation(event.data[0])}`;
        case "ldel": return `${nation(event.receptor)} lost WA Delegate status in ${region(event.origin)}`;
        case "beginfn": return `${nation(event.actor)} began the process of converting ${region(event.origin)} to a Frontier`;
        case "stopfn": return `${nation(event.actor)} canceled the process of converting ${region(event.origin)} to a Frontier`;
        case "finishfn": return `${region(event.origin)} became a Frontier`;
        case "fngovrem": return `${nation(event.receptor)} stepped down as Governor of ${region(event.origin)} as it became a Frontier`;
        case "beginst": return `${nation(event.actor)} began the process of removing ${region(event.origin)}'s designation as a Frontier`;
        case "stopst": return `${nation(event.actor)} canceled the process of removing ${region(event.origin)}'s designation as a Frontier`;
        case "finishst": return `${region(event.origin)} ceased to operate as a Frontier`;
        case "stgovadd": return `${nation(event.receptor)} became Governor of ${region(event.origin)}`;
        case "annexreq": return `${nation(event.actor)} sent a demand to annex ${region(event.destination)}`;
        case "annexrcv": return `${region(event.destination)} received a demand from ${nation(event.actor)} to be annexed by ${region(event.origin)}`;
        case "annexrej": return `${nation(event.actor)} rejected a demand for ${region(event.origin)} to be annexed into ${region(event.destination)}`;
        case "annexacc": return `${nation(event.actor)} accepted a demand to be annexed by ${region(event.destination)}`;
        case "annexwth": return `${nation(event.actor)} withdrew a demand to annex ${region(event.destination)}`;
        case "annexfna": return `${region(event.origin)} was annexed by ${region(event.destination)}`;
        case "annexfnb": return `${region(event.origin)} annexed ${region(event.destination)}`;
        case "addxrmb": return `${nation(event.actor)} granted posting privileges on the ${region(event.origin)} Regional Message Board to ${event.data[0]} in embassy regions`;
        case "remxrmb": return `${nation(event.actor)} revoked posting privileges on the ${region(event.origin)} Regional Message Board from ${event.data[0]} in embassy regions`;
        case "wzbanexp": return `Regional bans expired in ${region(event.origin)}`;
        case "rgenkey": return `${nation(event.actor)} generated a Telegram API key for ${region(event.origin)}`;
        case "mcreate": return `${nation(event.actor)} created ${map(event.data[0])}`;
        case "mvcreate": return `${nation(event.actor)} created ${map_version(event.data[0])}`;
        case "mupdate": return `${nation(event.actor)} updated ${map(event.data[0])} to ${map_version(event.data[1])}`;
        case "mnendo": return `${nation(event.actor)} endorsed ${map(event.data[0])}`;
        case "mrendo": return `${nation(event.actor)} endorsed ${map(event.data[0])} instead of ${map(event.data[1])}`;
        case "mlendo": return `${map(event.data[0])} lost the endorsement of ${nation(event.actor)}`;
        case "munendo": return `${nation(event.actor)} removed its endorsement from ${map(event.data[0])}`;
        case "move": return `${nation(event.actor)} relocated from ${region(event.origin)} to ${region(event.destination)}`;
        case "nfound": return `${nation(event.actor)} was founded in ${region(event.origin)}`;
        case "nrefound": return `${nation(event.actor)} was refounded in ${region(event.origin)}`;
        case "ncte": return `${nation(event.receptor)} ceased to exist in ${region(event.origin)}`;
        case "rgcte": return `Governor ${nation(event.receptor)} of ${region(event.origin)} ceased to exist`;
        case "rfcte": return `Founder ${nation(event.receptor)} of ${region(event.origin)} ceased to exist`;
        case "wavote": return `${nation(event.actor)} voted ${event.data[0]} the World Assembly resolution "${event.data[1]}"`;
        case "wrvote": return `${nation(event.actor)} withdrew its vote on the World Assembly resolution "${event.data[0]}"`;
        case "rsfloor": return `The ${event.data[0]} proposal "${event.data[1]}" (by ${coauthors(event, 2)}) entered the resolution voting floor`;
        case "rspass": return `The ${event.data[0]} resolution ${resolution(event.data[1], event.data[2], event.data[0], event.time)} was passed ${event.data[3]} votes to ${event.data[4]}`;
        case "nrspass": return `${nation(event.receptor)}'s resolution ${resolution(event.data[1], event.data[2], event.data[0], event.time)} was passed by the ${event.data[0]}`;
        case "rsfail": return `The ${event.data[0]} resolution <span class="font-bold">${event.data[1]}</span> was defeated ${event.data[2]} votes to ${event.data[3]}`;
        case "rdiscard": return `The ${event.data[0]} resolution <span class="font-bold">${event.data[1]}</span> was discarded by the WA for rule violations after garnering ${event.data[2]} votes in favor and ${event.data[3]} votes against`;
        case "rsapp": return `${nation(event.actor)} approved the World Assembly proposal "${event.data[0]}"`;
        case "rsremapp": return `${nation(event.actor)} withdrew its approval for the World Assembly proposal "${event.data[0]}"`;
        case "rssubmit": return rssubmit(event);
        case "rsremsub": return `${nation(event.actor)} withdrew a proposal from the WA ${event.data[0]} titled "${event.data[1]}"`;
        case "rsquorum": return `The ${event.data[0]} proposal "${event.data[1]}" (by ${coauthors(event, 2)}) failed to achieve quorum`;
        case "rscensus": return `The General Assembly proposal "${event.data[0]}" (by ${coauthors(event, 1)}) reached quorum but could not enter the voting floor due to missing World Census analysis`;
        case "rsmodrem": return `The proposal "${event.data[0]}" was removed from the floor`;
        case "wapply": return `${nation(event.actor)} applied to join the WA in ${region(event.origin)}`;
        case "wadmit": return `${nation(event.actor)} was admitted to the WA in ${region(event.origin)}`;
        case "wresign": return `${nation(event.actor)} resigned from the WA in ${region(event.origin)}`;
        case "wkick": return `${nation(event.actor)} was ejected from the WA in ${region(event.origin)} for rule violations`;
        case "wendo": return `${nation(event.actor)} endorsed ${nation(event.receptor)}`;
        case "wunendo": return `${nation(event.actor)} withdrew its endorsement from ${nation(event.receptor)}`;
        case "secenter": return `${nation(event.actor)} entered the World Assembly Secretariat election`;
        case "secvote": return `${nation(event.actor)} voted for ${nation(event.receptor)} in round ${event.data[0]} of the WASec election`;
        case "secrvote": return `${nation(event.actor)} removed its vote in round ${event.data[0]} of the WASec election`;
        case "secelect": return `${nation(event.receptor)} was elected to the World Assembly Secretariat`;
        case "govabd": return `Governor ${nation(event.actor)} of ${region(event.origin)} abdicated`;
        case "npoll": return `${nation(event.actor)} created a new poll in ${region(event.origin)}: "${event.data[0]}"`;
        case "nqpoll": return `${nation(event.actor)} queued a new poll in ${region(event.origin)}: "${event.data[0]}"`;
        case "modkick": return `${nation(event.receptor)} was removed from ${region(event.origin)} by moderation`;
        case "nscnom": return `${nation(event.receptor)} was nominated for a World Assembly ${event.data[0]} by ${nation(event.actor)}`;
        case "rscnom": return `${region(event.origin)} was nominated for a World Assembly ${event.data[0]} by ${nation(event.actor)}`;
        case "rsctg": return `${region(event.origin)} was targeted for ${event.data[0]} in a World Assembly proposal by ${nation(event.actor)}`;
        case "nscpass": return `${nation(event.receptor)} was ${event.data[0]} by ${resolution(event.data[1], `Security Council Resolution #${event.data[1]}`, "Security Council", 0)}`;
        case "rscpass": return `${region(event.origin)} was ${event.data[0]} by ${resolution(event.data[1], `Security Council Resolution #${event.data[1]}`, "Security Council", 0)}`;
        case "rscrep": return `${event.data[0]} ${region(event.origin)} was repealed`;
        case "rsvtopic": return `${nation(event.actor)} updated a forum topic link for the at-vote WA resolution in council ${event.data[0]}`;
        case "rsptopic": return `${nation(event.actor)} updated a forum topic link for the WA proposal ${event.data[0]}`;
        case "rsadopt": return `${nation(event.actor)} adopted General Assembly Resolution #${event.data[0]} "${resolution(event.data[0], event.data[1], "General Assembly", event.time)}"`;
        case "rscomply": return `${nation(event.actor)} passed an omnibus bill to adopt all General Assembly resolutions`;
        case "addrxrmb": return `${nation(event.actor)} set embassy posting for ${region(event.destination)} to ${event.data[0]} on the ${region(event.origin)} Regional Message Board`;
        case "remrxrmb": return `${nation(event.actor)} blocked embassy posting from ${region(event.destination)} on the ${region(event.origin)} Regional Message Board`;
        case "unknown": return `Unknown happening: "${event.data[0]}"`;
        case "skipped": return `Skipped happening: "${event.data[0]}"`;
        default: return "Unknown event";
    };
}

function formatEvent(event) {
    let container = document.createElement("div");

    let id = document.createElement("div");
    id.innerText = `${event.event}`;
    id.classList.add("badge", "badge-outline", "badge-secondary");
    container.appendChild(id);

    let time = document.createElement("time");
    const date = new Date(event.time * 1000);
    time.dataset.epoch = Math.floor(date.getTime() / 1000).toString();
    time.innerText = date.toLocaleString("en-GB", {});
    time.classList.add("badge", "badge-outline", "badge-info", "mx-2");
    container.appendChild(time);

    let line = formatEventLine(event);
    let span = document.createElement("span");
    span.innerHTML = line;
    container.appendChild(span);

    return container;
}
