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
        let entries = nations.split(/\r\n|\r|\n/).filter((e) => !e.isEmpty()).map((v) => canonicalizeName(v));
        filter["nations"] = {"Generic": entries};
    }

    let regions = document.getElementById("region-select").value;
    if(regions !== null && regions !== "") {
        let entries = regions.split(/\r\n|\r|\n/).filter((e) => !e.isEmpty()).map((v) => canonicalizeName(v));
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

let after = null;
let results = new Array();
let evtSource = null;
let query = null;

async function search() {
    const params = buildQuery(false);
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
        alert(`Error: ${res.statusText}\nTry again in a few seconds.`);
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
        alert(`Error: ${res.statusText}\nTry again in a few seconds.`);
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