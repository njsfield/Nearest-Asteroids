/* Graphmker*/
function Graphmaker(url, date){

    this.date = this.getFormattedDate(date);
    this.url = url;
    this.rawdata;


};


/* Helper date conerter */
Graphmaker.prototype.getFormattedDate = function(date, structure){

    structure = structure || "yyyy-mm-dd";
    date = date ? new Date(date) : new Date();

    var today = date,
        dd = today.getDate(),
        mm = today.getMonth()+1,
        yyyy = today.getFullYear();

    if (dd<10) dd='0'+dd;
    if (mm<10) mm='0' +mm;

    // return yyyy + "-" + mm + "-" + dd;
    return structure.replace(/yyyy/,yyyy).replace(/dd/,dd).replace(/mm/,mm);
};



/* Url retriever (async) */
Graphmaker.prototype.getRawDataAsync = function(url, settings, callback){

    var that = this;

    if (!url) return undefined;

    var xhr = new XMLHttpRequest();

        xhr.onload = function(data){

            that.rawdata = data.target.responseText;
            callback(null, that.rawdata);
        };

        xhr.onerror = function(e){

            callback('Error retrieving data:' + e, undefined);
        };

    xhr.open(settings.method, url, true);
    xhr.send();

}



/* Function to access nested JSON data */
Graphmaker.prototype.accessNestedData = function(rawdata, key) {

    var that = this;
    var result = null;

    if(rawdata.constructor === Array) {

        for(var i = 0; i < rawdata.length; i++) {

            result = that.accessNestedData(rawdata[i], key);

            if (result) {

                break;
            }

        }
    }
    else {

        for(var prop in rawdata) {

                if(prop == key) {

                    return rawdata[key];
                }

            else if(rawdata[prop] instanceof Object || rawdata[prop] instanceof Array) {

                result = that.accessNestedData(rawdata[prop], key);

                if (result) {

                    break;
                }
            }
        }
    }

  return result;

}




/* Function to build array from dataset with object argument containing key/value pairs */

Graphmaker.prototype.buildArrayFrom = function(dataset, labelAndTargets){

    var that = this;
    var resultsArray = [];

    for (var item of dataset) {

        var result = {};

        for (var label in labelAndTargets) {

            result[label] = that.accessNestedData(item, labelAndTargets[label]);

            if (!result[label]) return "Cannot find property " + labelAndTargets[label] + " in " + item;

        }

        resultsArray.push(result);
    };

    return resultsArray;

}

/* Function to sort data sets, and build new array of objects */

Graphmaker.prototype.sortBy = function(dataset, property, direction){

    if (dataset[0][property] == undefined) return "Cannot find property " + property;

    var resultsArray = dataset.sort(function(a,b){

        var x = (typeof a[property]) == "number" ? a[property] : a[property].toLowerCase(),
            y = (typeof b[property]) == "number" ? b[property] : a[property].toLowerCase();

        return x < y;
    });

    return direction == "high-to-low" ? resultsArray : resultsArray.reverse();

}

/* Function to sort data array based on property, then scale between given array values */

Graphmaker.prototype.scale = function(data, prop, minToMaxArray){

    var that = this;

    data = this.sortBy(data, prop);

    /* Default */
    if (!minToMaxArray) minToMaxArray = [0,100];

    var min = minToMaxArray[0],
        max = minToMaxArray[1];

    if (typeof min != "number" || typeof max != "number") {
        return "Cannot understand scale parameters: " + minToMaxArray;
    };

    var scalefunc = function(val){

        val = (val - data[0][prop]) / (data[data.length-1][prop] - data[0][prop]);
        val *= max - min;
        val += min;
        return val;

    }

    return that.nestedReplaceWith(data, prop, scalefunc);


}





/* Function to find object property values and replace/format their values */

Graphmaker.prototype.nestedReplaceWith = function(dataset, property, _new){

    dataset = dataset instanceof Array? dataset : [dataset];

    var newArray = [];

    for (var item of dataset){

        var newItem = item;
            item[property] = _new instanceof Function ? _new(item[property]) : _new;

        newArray.push(newItem);
    }

    return newArray;

}


/* Function to format number to string with optional poststring */

Graphmaker.prototype.formatNumTo = function(num, decPlaces, postString){

    postString = postString || "";
    num = parseFloat(num);
    num = decPlaces >= 0 ? num.toFixed(decPlaces + 1).slice(0,-1) : num.toString();

    var parts = num.split('.');

	parts[0] = parts[0].replace(/./g, function(c, i, a) {

	    return i !== 0 && ((a.length - i) % 3 === 0) ? ',' + c : c;

	});

	parts = parts[1]? parts.join(".") : parts[0];

	return parts + postString;

};
