function getCategoryCheckboxes() {
    return Array.from(document.getElementById("category-content").querySelectorAll("input[type=checkbox]"));
}

function isEmpty(el) {
    return el == null || el == "";
}

function countLines(text) {
    return text.split(/\r\n|\r|\n/).filter((e) => !e.isEmpty()).length;
}

function updateNationDisplay() {
    let nationText = document.getElementById("nation-select").value;
    if(isEmpty(nationText)) {
        document.getElementById("nation-tab").ariaLabel = `Nations`;
    } else {
        document.getElementById("nation-tab").ariaLabel = `Nations (${countLines(nationText)})`;
    }
}

function updateRegionDisplay() {
    let regionText = document.getElementById("region-select").value;
    if(isEmpty(regionText)) {
        document.getElementById("region-tab").ariaLabel = `Regions`;
    } else {
        document.getElementById("region-tab").ariaLabel = `Regions (${countLines(regionText)})`;
    }
}

function updateCategoryDisplay() {
    let categoriesSelected = getCategoryCheckboxes().filter((e) => e.checked).length;
    if(categoriesSelected == 0) {
        document.getElementById("category-count").innerText = `Categories Selected: All`;
        document.getElementById("category-tab").ariaLabel = `Categories`;
    } else {
        document.getElementById("category-count").innerText = `Categories Selected: ${categoriesSelected}`;
        document.getElementById("category-tab").ariaLabel = `Categories (${categoriesSelected})`;
    }
}

function updateFilterDisplay() {
    let filters = 0;

    let nationText = document.getElementById("nation-select").value;
    if(!isEmpty(nationText)) {
        filters += countLines(nationText);
    }

    let regionText = document.getElementById("region-select").value;
    if(!isEmpty(regionText)) {
        filters += countLines(regionText);
    }

    filters += getCategoryCheckboxes().filter((e) => e.checked).length;

    if(filters == 0) {
        document.getElementById("filters").innerText = `Edit Filters`;
    } else {
        document.getElementById("filters").innerText = `Edit Filters (${filters})`;
    }
}

function updateTimeDisplay() {
    if(document.getElementById("direction-select").value == "desc") {
        document.getElementById("anchor-mode").innerText = "Only match happenings before:";
    } else {
        document.getElementById("anchor-mode").innerText = "Only match happenings after:";
    }
}

function updateLiveStatus() {
    if(document.getElementById("live-toggle").checked) {
        document.getElementById("history-settings").classList.add("hidden");
        document.getElementById("search").innerText = "Start";
    } else {
        document.getElementById("history-settings").classList.remove("hidden");
        document.getElementById("search").innerText = "Search";
    }
}

Array.from(document.getElementById("nation-content").querySelectorAll("input")).forEach((c) => c.oninput = updateNationDisplay);
Array.from(document.getElementById("region-content").querySelectorAll("input")).forEach((c) => c.oninput = updateRegionDisplay);
getCategoryCheckboxes().forEach((c) => c.onclick = updateCategoryDisplay);

document.getElementById("reset-time").onclick = function(e) {
    document.getElementById("anchor-time").value = "";
    updateTimeDisplay();
};

document.getElementById("reset-nation").onclick = function(e) {
    document.getElementById("nation-select").value = "";
    updateNationDisplay();
    updateFilterDisplay();
};

document.getElementById("reset-region").onclick = function(e) {
    document.getElementById("region-select").value = "";
    updateRegionDisplay();
    updateFilterDisplay();
};

document.getElementById("reset-category").onclick = function(e) {
    getCategoryCheckboxes().forEach((e) => e.checked = false);
    updateCategoryDisplay();
    updateFilterDisplay();
};

document.getElementById("reset-all").onclick = function(e) {
    document.getElementById("nation-select").value = "";
    document.getElementById("region-select").value = "";
    getCategoryCheckboxes().forEach((e) => e.checked = false);
    updateNationDisplay();
    updateRegionDisplay();
    updateCategoryDisplay();
    updateFilterDisplay();
};

document.getElementById("direction-select").onchange = function(e) {
    updateTimeDisplay();
}

document.getElementById("live-toggle").onchange = function(e) {
    updateLiveStatus();
}

updateNationDisplay();
updateRegionDisplay();
updateCategoryDisplay();
updateFilterDisplay();
updateTimeDisplay();
updateLiveStatus();