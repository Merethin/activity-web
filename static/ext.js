function law_ext() {
    let line = document.getElementById("law-ext-line").value;
    if(line && line != "") {
        return {
            category: "law",
            operations: [
                {type: "HasSubstring", index: 0, value: line}
            ]
        }
    }

    return null;
}

function rsadopt_ext() {
    let name = document.getElementById("rsadopt-ext-name").value;
    if(name && name != "") {
        return {
            category: "rsadopt",
            operations: [
                {type: "HasSubstring", index: 1, value: name}
            ]
        }
    }

    return null;
}

function chclass_ext() {
    let old = document.getElementById("chclass-ext-orig").value;
    let _new = document.getElementById("chclass-ext-new").value;

    let operations = [];
    if(old && old != "") { operations.push({type: "HasSubstring", index: 0, value: old}); }
    if(_new && _new != "") { operations.push({type: "HasSubstring", index: 1, value: _new}); }

    if (operations.length > 0) {
        return {
            category: "chclass",
            operations: operations
        }
    }

    return null;
}

function chcensus_ext() {
    let value = document.getElementById("chcensus-ext-type").value;
    if(value && value != "") {
        return {
            category: "chcensus",
            operations: [
                {type: "Contains", value: value}
            ]
        }
    }

    return null;
}

function chfield_ext() {
    let value = document.getElementById("chfield-ext-type").value;
    if(value && value != "") {
        return {
            category: "chfield",
            operations: [
                {type: "Contains", value: value}
            ]
        }
    }

    return null;
}

function chinf_ext() {
    let direction = document.getElementById("chinf-ext-direction").value;
    let level = document.getElementById("chinf-ext-level").value;

    let operations = [];
    if(level && level != "") { operations.push({type: "Contains", start: 1, value: level}); }
    if(direction != "none") { operations.push({type: "In", index: 0, values: [direction]}); }
    
    if (operations.length > 0) {
        return {
            category: "chinf",
            operations: operations
        }
    }

    return null;
}

function dispatch_ext() {
    let name = document.getElementById("dispatch-ext-name").value;
    let category = document.getElementById("dispatch-ext-cat").value;
    let subcategory = document.getElementById("dispatch-ext-subcat").value;

    let operations = [];
    if(name && name != "") { operations.push({type: "HasSubstring", index: 1, value: name}); }
    if(category && category != "") { operations.push({type: "In", index: 2, values: [category]}); }
    if(subcategory && subcategory != "") { operations.push({type: "In", index: 3, values: [subcategory]}); }
    
    if (operations.length > 0) {
        return {
            category: "dispatch",
            operations: operations
        }
    }

    return null;
}

const extensions = {
    "law": law_ext,
    "rsadopt": rsadopt_ext,
    "chclass": chclass_ext,
    "chcensus": chcensus_ext,
    "chfield": chfield_ext,
    "chinf": chinf_ext,
    "dispatch": dispatch_ext
}