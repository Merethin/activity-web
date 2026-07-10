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

const extensions = {
    "law": law_ext,
    "rsadopt": rsadopt_ext
}