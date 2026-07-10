function getCategoryCheckboxes() {
    return Array.from(document.getElementById("category-content").querySelectorAll("input[type=checkbox]"));
}

function isEmpty(el) {
    return el == null || el == "";
}

function updateNationDisplay() {
    let nationText = document.getElementById("nation-select").value;
    let actorText = document.getElementById("actor-select").value;
    let receptorText = document.getElementById("receptor-select").value;
    if(isEmpty(nationText) && isEmpty(actorText) && isEmpty(receptorText)) {
        document.getElementById("nation-tab").ariaLabel = `Nations`;
    } else {
        document.getElementById("nation-tab").ariaLabel = `Nations (*)`;
    }
}

function updateRegionDisplay() {
    let regionText = document.getElementById("region-select").value;
    let originText = document.getElementById("origin-select").value;
    let destinationText = document.getElementById("destination-select").value;
    if(isEmpty(regionText) && isEmpty(originText) && isEmpty(destinationText)) {
        document.getElementById("region-tab").ariaLabel = `Regions`;
    } else {
        document.getElementById("region-tab").ariaLabel = `Regions (*)`;
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

function updateTimeDisplay() {
    if(document.getElementById("direction-select").value == "desc") {
        document.getElementById("anchor-mode").innerText = "before";
    } else {
        document.getElementById("anchor-mode").innerText = "after";
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
    document.getElementById("actor-select").value = "";
    document.getElementById("receptor-select").value = "";
    updateNationDisplay();
};

document.getElementById("reset-region").onclick = function(e) {
    document.getElementById("region-select").value = "";
    document.getElementById("origin-select").value = "";
    document.getElementById("destination-select").value = "";
    updateRegionDisplay();
};

document.getElementById("reset-category").onclick = function(e) {
    getCategoryCheckboxes().forEach((e) => e.checked = false);
    updateCategoryDisplay();
};

document.getElementById("direction-select").onchange = function(e) {
    updateTimeDisplay();
}

updateNationDisplay();
updateRegionDisplay();
updateCategoryDisplay();
updateTimeDisplay();