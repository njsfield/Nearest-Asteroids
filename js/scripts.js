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
        xhr.addEventListener("load", function(data) {
            that.rawdata = data.target.responseText;
            callback(null, that.rawdata);
        });
        xhr.addEventListener("error", function(e) {
            callback('Error retrieving data:' + e, undefined);
        });
        xhr.open(settings.method, url, true);
        xhr.send();
    }

/* Function to access nested JSON data */
Graphmaker.prototype.accessNestedData = function(rawdata, key, deep) {
        var that = this,
            result = null;
        if (Array.isArray(rawdata)) {
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
                } else if (typeof rawdata[prop] === "object") {
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
        for (var item = 0; item < dataset.length; item++) {
            var result = {};
            for (var label in labelAndTargets) {
                result[label] = that.accessNestedData(dataset[item], labelAndTargets[label], deep);
                if (!result[label]) return "Cannot find property " + labelAndTargets[label] + " in " + dataset[item];
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
        var that     = this;
            smallest = this.sortBy(Object.create(data), prop)[0][prop];
            largest  = this.sortBy(Object.create(data), prop)[data.length - 1][prop];

        /* Default */
        if (!minToMaxArray) minToMaxArray = [0, 100];
        var min = minToMaxArray[0],
            max = minToMaxArray[1];
        if (typeof min != "number" || typeof max != "number") {
            return "Cannot understand scale parameters: " + minToMaxArray;
        };
        var scalefunc = function(val) {
            val = (val - smallest) / (largest - smallest);
            val *= max - min;
            val += min;
            return val;
        }
        return that.nestedReplaceWith(data, prop, scalefunc);
    }

/* Function to find object property values and replace/format their values */
Graphmaker.prototype.nestedReplaceWith = function(dataset, property, _new) {
        dataset = Array.isArray(dataset) ? dataset : [].concat(dataset);
        var newArray = [];
        for (var item = 0; item < dataset.length; item++) {
            var newItem = dataset[item];
            dataset[item][property] = _new instanceof Function ? _new(dataset[item][property]) : _new;
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
Graphmaker.prototype.generateToggleGraph = function(data, toggleVals, className, styles) {
    var that       = this,
        eltForEach = Array.prototype.forEach;

    var container       = this.buildDomElementFrom("div"),
        toggleContainer = this.buildDomElementFrom("ul"),
        dataContainer   = this.buildDomElementFrom("ul");

    /* Generate dataitems */
    for (var item = 0; item < data.length; item++) {
        var span    = that.buildDomElementFrom("span",(data[item]['name'] || ""));
        var dataElt = that.buildDomElementFrom("li", data[item], span);
            dataElt.classList.add(className);
            dataContainer.appendChild(dataElt);
    }
    /* Generate toggleitems */
    for (var label in toggleVals) {
        var toggleElt = this.buildDomElementFrom("li", toggleVals[label]);
        /* Closure needed in loop */
        (function(setting) {
            toggleElt.addEventListener("click", function() {

                var workingData = that.buildArrayFrom(data, (function(s){var x = {}; x[s] = s; return x}(setting)));
                    workingData = that.dataToStyles(workingData, styles[setting]);

                eltForEach.call(dataContainer.children, function(child, index) {
                    child.innerHTML  = '<span>'+child.getAttribute(setting)+'</span>';
                    if (workingData) {
                        child.style.cssText = workingData[index];
                    } else {
                        child.removeAttribute('style');
                    }

                });
            });

        })(label);
        toggleContainer.appendChild(toggleElt);
    }
    // Initialise
    toggleContainer.firstChild.click();
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
    var display = this.buildDomElementFrom("span", {display: elts[0].textContent}, elts[0].textContent);
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
        display.setAttribute('display', elts[listIndex].textContent);
        if (fireOnChange) elts[listIndex].click();
    });

    backBtn.addEventListener("click", function(){
        listIndex--;
        // Checks to see if listIndex greater than elts length (minus three for added elts)
        if (listIndex == -1) listIndex = elts.length - 3;
        display.textContent = elts[listIndex].textContent;
        display.setAttribute('display', elts[listIndex].textContent);
        if (fireOnChange) elts[listIndex].click();
    })

}

/* Accepts dataset (with one prop), and style rules. Returns style object with mapped data */
Graphmaker.prototype.dataToStyles = function(dataset, styles){
    var that = this,
        // key expects only one property
        key  = Object.keys(dataset[0]).toString();
    // prevent further action
    if (!styles) return null;
    // make empty array of dataset length
    var results = (function(l){var x=[]; for(var y = 0;y<l;y++){x.push(null)}return x}(dataset.length)),
        //current holds temporary map of data
        current;
    // will build in to...
    var styleObj = {};

        for (var style in styles){
            // simply ensures each item is not stringified
            current = that.nestedReplaceWith([].concat(dataset), key, function(num) {return parseFloat(num)});
                //1. if value is specified to map to style
                if (styles[style][0] == 'value') {
                    // if percent requested...
                    if (styles[style][1] == '%') {
                        // scale each between 0 - 100
                        current = that.scale(current, key);
                        // and add % to end, then append to object
                        current = that.nestedReplaceWith(current, key, function(num) {return num + "%"});
                    } else {
                        // otherwise, scale between 1 and 2
                        current = that.scale(current, key, [5,10]);
                        // and add other style to end, then append to object
                        current = that.nestedReplaceWith(current, key, function(num) {return num + styles[style][1]});
                    }

                } else if (styles[style][0] == 'order') {
                        // make fake array with key and 0,1,2,3,4 etc
                        current = [];
                        for (var i = 0; i < dataset.length; i++){
                            current.push((function(key,i){var x = {}; x[key]=i; return x}(key,i)));
                            // current.push({[key]: i})
                        }
                        // scale it between 0 - 100
                        current = that.scale(current, key);
                        // append to object - each array with % at the end
                        current = that.nestedReplaceWith(current, key, function(num) {return num + "%"});
                }
            // finally flatten array of objects to array of strings
            styleObj[style] = current.map(function (c) {return c[Object.keys(c).toString()]});

        }

        // to produce final string array...
        var final = results.map(function (c, index, a){
            var res = {},
                str = '';
            // access the indexed item in each object
            for (var s in styleObj){
                res[s] = styleObj[s][index];
            };
            // then build string from each obj prop, :, value, ;
            for (var x in res){
                str += x;
                str += ": ";
                str += res[x];
                str += "; ";
            }
            return str;

        });

        return final;

}

/* Initialize */
var g = new Graphmaker();

g.url = 'https://api.nasa.gov/neo/rest/v1/feed?' +
        'start_date=' +
        g.date +
        '&api_key=3NW9wqg2QvSWpj4WAFj3tTQYTK85Hj1UEqKsoRo4';

/* Retrieve Nasa JSON */
g.getRawDataAsync(g.url, {method: "GET"}, function(){

    var target  = JSON.parse(g.rawdata),
        pointer = g.date;

        g.ASTEROIDS = g.accessNestedData(target, pointer);

    var data = g.buildArrayFrom(g.ASTEROIDS, {
        name: "name",
        size: "estimated_diameter_min",
        speed: "kilometers_per_second",
        missedby: "kilometers"
    }, true);

    // Size formatting
    data = g.nestedReplaceWith(data, "size", function(num) {return g.formatNumTo(num, 2, "km")});
    // Speed formatting
    data = g.nestedReplaceWith(data, "speed", function(num) {return g.formatNumTo(num, 2, "km/s")});
    // Miss Distance formatting
    data = g.nestedReplaceWith(data, "missedby", function(num) {return g.formatNumTo(num, 2, "km")});

    var toggleVals = {
        name: "Name",
        size: "Size",
        speed: "Speed",
        missedby: "Miss Distance"};

    var styles = {
    size: {
        left:   ['value', '%'],
        top:    ['order', '%'],
        width:  ['value', 'em'],
        height: ['value', 'em']
    },
    speed: {
        left:   ['value', '%'],
        top:    ['order', '%'],
    },
    missedby: {
        left:   ['value', "%"],
        top:    ['order', '%']
    },
    name: {
        left:   ['order', '%']
    }
    }

    var output  =   g.generateToggleGraph(data, toggleVals, "graph__point", styles);
                    g.listToToggle(output.firstChild, ['<', '>'], true);

                    //Make output BEM friendly
                    output.classList.add("graph");
                    output.firstElementChild.classList.add("graph__nav");
                    output.lastElementChild.classList.add("graph__display");


    // Out with the old, in with the new

    var old = document.querySelector(".graph");
        old.parentElement.replaceChild(output, old);



// Toggle Info Box

var info             = document.querySelector(".info"),
    infoClose        = document.querySelector(".info__close"),
    infoIcon         = document.querySelector(".info-icon"),
    footerDate       = document.querySelector(".footer-box__date");


    // accepts DOM node and toggle class
    function toggleElt(elt, cls){
        if (!elt.classList.contains(cls)){
            elt.classList.add(cls);
        } else {
            elt.classList.remove(cls);
        }
    }

    // Binds toggleElt function to icons
    infoClose.addEventListener('click', toggleElt.bind(null, info, "info--hidden"));
    infoIcon.addEventListener('click', toggleElt.bind(null, info, "info--hidden"));


    //Footer Date
    footerDate.textContent = g.date;


});
