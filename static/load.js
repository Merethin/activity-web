function getCategoryCheckboxes() {
    return Array.from(document.getElementById("category-content").querySelectorAll("input[type=checkbox]"));
}

function buildQuery(stream) {
    let params = {};

    if(!stream) {
        let pagination = {};

        if(document.getElementById("direction-select").value == "asc") {
            pagination["direction"] = "Ascending";
        } else {
            pagination["direction"] = "Descending";
        }

        let time = document.getElementById("anchor-time").value;
        if(time !== null && time !== "") {
            pagination["anchor"] = {"Time": Math.floor((new Date(time)).getTime() / 1000)};
        }

        params["pagination"] = pagination;
    } else {
        params["pagination"] = {"direction":"Descending"};
    }

    let filter = {};

    let nations = document.getElementById("nation-select").value;
    if(nations !== null && nations !== "") {
        let entries = nations.split(/\r\n|\r|\n/).filter((e) => e != "").map((v) => canonicalizeName(v));
        filter["nations"] = {"Generic": entries};
    }

    let regions = document.getElementById("region-select").value;
    if(regions !== null && regions !== "") {
        let entries = regions.split(/\r\n|\r|\n/).filter((e) => e != "").map((v) => canonicalizeName(v));
        filter["regions"] = {"Generic": entries};
    }

    let categories = new Array();
    let constraints = new Array();
    getCategoryCheckboxes().forEach((c) => {
        if(c.checked) {
            let event = c.dataset.event;
            if(Object.keys(extensions).includes(event)) {
                let obj = extensions[event]();
                if (obj != null) {
                    constraints.push(obj);
                    return;
                }
            }

            categories.push(event);
        }
    })

    filter["categories"] = {"include": categories, "constraints": constraints};
    params["filter"] = filter;

    return params;
}

function saveQuery(stream, query) {
    let segments = new Array();

    if(!stream) {
        let pagination = query["pagination"];
        if (pagination["direction"] == "Ascending") segments.push("a");
        if (pagination["anchor"]) segments.push(`t:${pagination["anchor"]["Time"]}`);
    } else {
        segments.push("l");
    }

    let filter = query["filter"];

    if(filter["nations"] && Array.isArray(filter["nations"]["Generic"])) {
        segments.push(`n:${filter["nations"]["Generic"].join(",")}`);
    }

    if(filter["regions"] && Array.isArray(filter["regions"]["Generic"])) {
        segments.push(`r:${filter["regions"]["Generic"].join(",")}`);
    }

    if(filter["categories"] && Array.isArray(filter["categories"]["include"])) {
        segments.push(`c:${filter["categories"]["include"].join(",")}`);
    }

    if(filter["categories"] && Array.isArray(filter["categories"]["constraints"])) {
        for(var entry of filter["categories"]["constraints"]) {
            segments.push(`e:${entry.category}@${JSON.stringify(entry.constraints)}`);
        }
    }

    if(segments.length > 0) {
        document.location.hash = btoa(segments.join("/"));
    } else {
        document.location.hash = "";
    }
}

function loadQuery() {
    let hash = document.location.hash;
    if(hash == "") return;

    let decoded = atob(hash.substring(1));
    let segments = decoded.split("/");

    for(var segment of segments) {
        if(segment == "l") {
            document.getElementById("live-toggle").checked = true;
            continue;
        }

        if(segment == "a") {
            document.getElementById("direction-select").value == "asc";
            continue;
        }

        let split = segment.indexOf(":");
        if(split == -1) continue;

        let type = segment.slice(0, split);
        let content = segment.slice(split+1);

        const pad = (t, c) => {
            return t.toString().padStart(c, "0");
        };

        switch(type) {
            case "t":
                let date = new Date(parseInt(content) * 1000);
                let formatted = `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}T${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}`;
                document.getElementById("anchor-time").value = formatted;
                break;
            case "n":
                document.getElementById("nation-select").value = content.replace(/,/g, "\n");
                break;
            case "r":
                document.getElementById("region-select").value = content.replace(/,/g, "\n");
                break;
            case "c":
                let categories = content.split(",");
                getCategoryCheckboxes().forEach((c) => { if(categories.includes(c.dataset.event)) c.checked = true; });
                break;
            case "e":
                let split = content.indexOf("@");
                if(split == -1) break;

                let category = content.slice(0, split);
                // let extension = content.slice(split+1); fixme: restore extension values
                let element = document.querySelector(`[data-event="${category}"]`);
                if(element) element.checked = true;
                break;
        }
    }
}

let after = null;
let results = new Array();
let evtSource = null;
let query = null;

async function search() {
    const params = buildQuery(false);
    saveQuery(false, params);
    after = null;
    results = new Array();
    query = params;

    if (evtSource) evtSource.close();
    document.getElementById("live-status").style.display = "none";

    Array.from(document.querySelectorAll(".query-element")).forEach((e) => e.classList.add("btn-disabled"));
    document.getElementById("search").innerText = "Searching...";

    const res = await fetch(`/api/events`, {
        method: "POST",
        body: JSON.stringify(params),
        headers: {"Content-Type": "application/json"}
    });

    if(res.status != 200) {
        if(res.status == 413) { alert(`Error: Search query too complex!\nEdit your filters and try again.`); }
        else if(res.status == 429) { alert(`Error: Too many requests!\nTry again in a few seconds.`); }
        else { alert(`Error: ${res.statusText} (status code: ${res.status})`); }
        document.getElementById("search").innerText = "Search";
        Array.from(document.querySelectorAll(".query-element")).forEach((e) => e.classList.remove("btn-disabled"));
        return;
    }

    const data = await res.json();

    const container = document.getElementById("results");
    container.innerHTML = "";
    data.forEach(row => {
        container.appendChild(formatEvent(row));
    });
    results.push(...data);

    if (data.length) {
        after = data[data.length - 1].event;
        document.getElementById("load-more").style.display = "block";
        document.getElementById("export").style.display = "block";
    } else {
        container.innerText = "No results.";
        document.getElementById("load-more").style.display = "none";
        document.getElementById("export").style.display = "none";
    }

    document.getElementById("search").innerText = "Search";
    Array.from(document.querySelectorAll(".query-element")).forEach((e) => e.classList.remove("btn-disabled"));
}

async function live() {
    const params = buildQuery(true);
    saveQuery(true, params);
    after = null;
    results = new Array();
    query = params;

    Array.from(document.querySelectorAll(".query-element")).forEach((e) => e.classList.add("btn-disabled"));
    document.getElementById("search").innerText = "Loading...";

    if (evtSource) evtSource.close();
    document.getElementById("live-status").style.display = "none";
    evtSource = new EventSource(`/api/stream?filter=${JSON.stringify(params["filter"])}`);

    const container = document.getElementById("results");
    container.innerHTML = "";

    evtSource.onopen = (event) => {
        document.getElementById("search").innerText = "Start";
        Array.from(document.querySelectorAll(".query-element")).forEach((e) => e.classList.remove("btn-disabled"));

        document.getElementById("load-more").style.display = "block";
        document.getElementById("export").style.display = "block";
        document.getElementById("live-status").style.display = "block";
    };

    evtSource.onmessage = (event) => {
        let evt = JSON.parse(event.data);
        container.prepend(formatEvent(evt));
        results.unshift(evt);

        if (results.length == 1 && after == null) {
            after = evt.event;
        }
    };
}

async function load() {
    let params = query;
    if(params === null) return;
    if(after != null) params["pagination"]["anchor"] = {"Cursor": after};

    Array.from(document.querySelectorAll(".query-element")).forEach((e) => e.classList.add("btn-disabled"));
    document.getElementById("load-more").innerText = "Loading...";

    const res = await fetch(`/api/events`, {
        method: "POST",
        body: JSON.stringify(params),
        headers: {"Content-Type": "application/json"}
    });

    if(res.status != 200) {
        if(res.status == 413) { alert(`Error: Search query too complex!\nEdit your filters and try again.`); }
        else if(res.status == 429) { alert(`Error: Too many requests!\nTry again in a few seconds.`); }
        else { alert(`Error: ${res.statusText} (status code: ${res.status})`); }
        document.getElementById("load-more").innerText = "Load more...";
        Array.from(document.querySelectorAll(".query-element")).forEach((e) => e.classList.remove("btn-disabled"));
        return;
    }
    
    const data = await res.json();

    const container = document.getElementById("results");
    data.forEach(row => {
        container.appendChild(formatEvent(row));
    });
    results.push(...data);

    if (data.length) {
        after = data[data.length - 1].event;
    } else {
        after = null;
        query = null;
        document.getElementById("load-more").style.display = "none";
    }

    document.getElementById("load-more").innerText = "Load more...";
    Array.from(document.querySelectorAll(".query-element")).forEach((e) => e.classList.remove("btn-disabled"));
}

function export_data() {
    if(results.length == 0) return;

    const file = new File(
        [JSON.stringify(results, null)], 'happenings.json', { type: 'application/octet-stream' }
    );

    const objectUrl = window.URL.createObjectURL(file);
    window.open(objectUrl);
}

document.getElementById("search").onclick = () => {
    if(document.getElementById("live-toggle").checked) {
        live();
    } else {
        search();
    }
}

document.getElementById("load-more").onclick = load;
document.getElementById("export").onclick = export_data;

try {
    loadQuery();
} catch (e) {
    console.log(`error while loading query from hash string: ${e}`);
}