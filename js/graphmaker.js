/* Graphmker*/
function Graphmaker(url, date) {
    this.date = this.getFormattedDate(date);
    this.url = url;
    this.rawdata;
};

/* Helper date conerter */
Graphmaker.prototype.getFormattedDate = function(date, structure) {
    structure = structure || "yyyy-mm-dd";
    date = date ? new Date(date) : new Date();
    var today = date,
        dd = today.getDate(),
        mm = today.getMonth() + 1,
        yyyy = today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    // return yyyy + "-" + mm + "-" + dd;
    return structure.replace(/yyyy/, yyyy).replace(/dd/, dd).replace(/mm/, mm);
};

/* Url retriever (async) */
Graphmaker.prototype.getRawDataAsync = function(url, settings, callback) {
        var that = this;
        if (!url) return undefined;
        var xhr = new XMLHttpRequest();
        xhr.onload = function(data) {
            that.rawdata = data.target.responseText;
            callback(null, that.rawdata);
        };
        xhr.onerror = function(e) {
            callback('Error retrieving data:' + e, undefined);
        };
        xhr.open(settings.method, url, true);
        xhr.send();
    }

/* Function to access nested JSON data */
Graphmaker.prototype.accessNestedData = function(rawdata, key, deep) {
        var that = this,
            result = null;
        if (rawdata.constructor === Array) {
            for (var i = 0; i < rawdata.length; i++) {
                result = that.accessNestedData(rawdata[i], key, deep);
                if (result) break;
            }
        } else {
            for (var prop in rawdata) {
                if (prop == key) {
                    if (deep) {
                        if (typeof rawdata[key] != "object") {
                            return rawdata[key];
                        } else {
                            result = that.accessNestedData(rawdata[prop], key, deep);
                            if (result) break;
                        }
                    } else return rawdata[key];
                } else if (rawdata[prop] instanceof Object || rawdata[prop] instanceof Array) {
                    result = that.accessNestedData(rawdata[prop], key, deep);
                    if (result) break;
                }
            }
        }
        return result;
    }

/* Function to build array from dataset with object argument containing key/value pairs */
Graphmaker.prototype.buildArrayFrom = function(dataset, labelAndTargets, deep) {
        var that = this;
        var resultsArray = [];
        for (var item of dataset) {
            var result = {};
            for (var label in labelAndTargets) {
                result[label] = that.accessNestedData(item, labelAndTargets[label], deep);
                if (!result[label]) return "Cannot find property " + labelAndTargets[label] + " in " + item;
            }
            resultsArray.push(result);
        };
        return resultsArray;
    }

/* Function to sort data sets, and build new array of objects */
Graphmaker.prototype.sortBy = function(dataset, property, direction) {
        if (dataset[0][property] == undefined) return "Cannot find property " + property;
        var resultsArray = dataset.sort(function(a, b) {
            var x = (typeof a[property]) == "number" ? a[property] : a[property].toLowerCase(),
                y = (typeof b[property]) == "number" ? b[property] : a[property].toLowerCase();
            return x < y;
        });
        return direction == "high-to-low" ? resultsArray : resultsArray.reverse();
    }

/* Function to sort data array based on property, then scale between given array values */
Graphmaker.prototype.scale = function(data, prop, minToMaxArray) {
        var that = this;
        data = this.sortBy(data, prop);
        /* Default */
        if (!minToMaxArray) minToMaxArray = [0, 100];
        var min = minToMaxArray[0],
            max = minToMaxArray[1];
        if (typeof min != "number" || typeof max != "number") {
            return "Cannot understand scale parameters: " + minToMaxArray;
        };
        var scalefunc = function(val) {
            val = (val - data[0][prop]) / (data[data.length - 1][prop] - data[0][prop]);
            val *= max - min;
            val += min;
            return val;
        }
        return that.nestedReplaceWith(data, prop, scalefunc);
    }

/* Function to find object property values and replace/format their values */
Graphmaker.prototype.nestedReplaceWith = function(dataset, property, _new) {
        dataset = dataset instanceof Array ? dataset : [dataset];
        var newArray = [];
        for (var item of dataset) {
            var newItem = item;
            item[property] = _new instanceof Function ? _new(item[property]) : _new;
            newArray.push(newItem);
        }
        return newArray;
    }

/* Function to format number to string with optional poststring */
Graphmaker.prototype.formatNumTo = function(num, decPlaces, postString) {
    postString = postString || "";
    num = parseFloat(num);
    num = decPlaces >= 0 ? num.toFixed(decPlaces + 1).slice(0, -1) : num.toString();
    var parts = num.split('.');
    parts[0] = parts[0].replace(/./g, function(c, i, a) {
        return i !== 0 && ((a.length - i) % 3 === 0) ? ',' + c : c;
    });
    parts = parts[1] ? parts.join(".") : parts[0];
    return parts + postString;
};

////* DOM TOOLS *////
/* buildDomElementFrom */
Graphmaker.prototype.buildDomElementFrom = function(name, attrs, content) {
        var elt = document.createElement(name);
        if (arguments.length == 1) {
            return elt || "Unable to build a " + name + "element";
        } else if (arguments.length == 2 && typeof arguments[1] == "string") {
            elt.textContent = attrs;
            return elt;
        };
        /* Append attrs */
        for (var attr in attrs) {
            elt.setAttribute(attr, attrs[attr]);
        }
        elt.innerHTML = content;
        return elt;
    }

/* generateToggleArray */
Graphmaker.prototype.generateToggleGraph = function(data, toggleVals) {
    var container       = this.buildDomElementFrom("div"),
        toggleContainer = this.buildDomElementFrom("ul");
        dataContainer   = this.buildDomElementFrom("ul");
    /*  E.G toggleVals = {name: "name", size: "size", miss-distance: "miss-distance"}
        styleLinks = {top: ["0%", "100%"]}
    */
    /* Generate dataitems */
    for (var item of data) {
        var dataElt = this.buildDomElementFrom("li", item, (item['name'] || ""));
        dataContainer.appendChild(dataElt);
    }
    /* Generate toggleitems */
    for (var label in toggleVals) {
        var toggleElt = this.buildDomElementFrom("li", label);
        /* Closure needed in loop */
        (function(setting) {
            toggleElt.addEventListener("click", function() {
                Array.prototype.forEach.call(dataContainer.children, function(child) {
                    child.textContent = child.getAttribute(setting);
                });
            });
        })(label);
        toggleContainer.appendChild(toggleElt);
    }
    container.appendChild(toggleContainer);
    container.appendChild(dataContainer);
    return container;
}

/* function to take container with elements, then conver them to toggle items */
Graphmaker.prototype.listToToggle = function(eltsContainer, toggleLabels, fireOnChange){
    var that = this;

    if (!toggleLabels) toggleLabels = ['<', '>'];

    // capture container elements in array, for each element, display = none
    var elts = eltsContainer.children;
        Array.prototype.forEach.call(elts, function(elt){
            elt.style.display ="none";
        });

    // create arrow elements (span)(span)
    var backBtn = this.buildDomElementFrom("span", toggleLabels[0]);
        backBtn.classList.add("prev");
    var fwdBtn  = this.buildDomElementFrom("span", toggleLabels[1]);
        fwdBtn.classList.add("next");

    // create display element (span)
    var display = this.buildDomElementFrom("span", elts[0].textContent);
        display.classList.add("display");

    //container appendchild(arrow l, display, arrow r)
    eltsContainer.appendChild(backBtn);
    eltsContainer.appendChild(display);
    eltsContainer.appendChild(fwdBtn);

    // hold index to keep track of length of elements array
    var listIndex = 0;

    fwdBtn.addEventListener("click", function(){
        listIndex++;
        // Checks to see if listIndex greater than elts length (minus three for added elts)
        if (listIndex == elts.length - 3) listIndex = 0;
        display.textContent = elts[listIndex].textContent;
        if (fireOnChange) elts[listIndex].click();
    });

    backBtn.addEventListener("click", function(){
        listIndex--;
        // Checks to see if listIndex greater than elts length (minus three for added elts)
        if (listIndex == -1) listIndex = elts.length - 3;
        display.textContent = elts[listIndex].textContent;
        if (fireOnChange) elts[listIndex].click();
    })

}
