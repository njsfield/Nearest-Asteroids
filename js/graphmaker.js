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

            callback('Error retrieving JSON:' + e, undefined);
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

// /* Function to compare data sets, and build new array of objects */
//
// Graphmaker.prototype.compareAndBuild = function(dataset, id, property, proplabel){
//
//     var that = this;
//     var resultsArray = [];
//
//     for (var item of dataset) {
//
//         var result = {};
//
//         result[id] = item[id];
//
//         if (!result[id]) {
//             return "Cannot find property " + id + " in " + item;
//         }
//
//         result[proplabel] = that.accessNestedData(item, property);
//
//         if (typeof result[proplabel] != 'number') {
//
//             return "Cannot find property " + property + " in " + item;
//         }
//
//         resultsArray.push(result);
//
//     };
//
//     resultsArray = resultsArray.sort(function(a,b){
//
//         return a[proplabel] < b[proplabel];
//     });
//
//     return resultsArray;
//
// }
