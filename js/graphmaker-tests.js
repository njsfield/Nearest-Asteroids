//// 1. Setup & JSON Retrieval ////


// Initial Load
QUnit.module( "Setup & JSON Retrieval", {
    beforeEach: function(){
        // Prepare Graphmaker
        this.graphmaker = new Graphmaker();

        // Set up JSON URL
        var url =   'https://api.nasa.gov/neo/rest/v1/feed?' +
                    'start_date=' + this.graphmaker.date +
                    '&api_key=3NW9wqg2QvSWpj4WAFj3tTQYTK85Hj1UEqKsoRo4';
        this.graphmaker.url = url;
    }
});


/* QUnit */
QUnit.test("QUNit init test", function(assert){

    assert.ok(1 === 1, 'Testing on 1 === 1');
});


/* Graphmaker Setup*/
QUnit.test("getFormattedDate should return correctly formatted date", function(assert){

    assert.equal(
        this.graphmaker.getFormattedDate("July 21, 1983", "yyyy-mm-dd"),
                                            "1983-07-21",
                                            "Should return correctly formatted date");
});

QUnit.test("Graphmaker has prepared url", function(assert){

    assert.ok(this.graphmaker.url,"has url: " + this.graphmaker.url);
});


/* GOOD JSON request */
QUnit.test("retrieveJSON can take GOOD url and retrieve JSON data asynchronously", function(assert){

    var done = assert.async();
    /* Uses callback to check for errors */
    this.graphmaker.rawData =
        this.graphmaker.getRawDataAsync(this.graphmaker.url, {method: "GET"},
        function(error, success){
            if (error) assert.ok(false, error);
            else assert.ok(true, "Loads JSON data");
            done();
        });
});

// Uncomment to check for JSON errors
// /* Bad JSON request */
// QUnit.test("retrieveJSON can take BAD url and return correct error", function(assert){
//
//     var done = assert.async();
//
//     /* Uses callback to check for errors */
//     this.graphmaker.rawData =
//         this.graphmaker.getRawDataAsync("lol.html", {method: "GET"},
//         function(error, success){
//             if (error) assert.ok(true, "Handles error: " + error);
//             else assert.ok(false);
//             done();
//         });
//
// });





//// 2. Handling Data ////

// Initial Load
QUnit.module( "Data Handling", {

    beforeEach : function( assert ){

        var done = assert.async();
        // Prepare Graphmaker
        this.graphmaker = new Graphmaker();

        // Set up JSON URL
        var url =   'https://api.nasa.gov/neo/rest/v1/feed?' +
                    'start_date=' + this.graphmaker.date +
                    '&api_key=3NW9wqg2QvSWpj4WAFj3tTQYTK85Hj1UEqKsoRo4';
        this.graphmaker.url = url;

        // Retrieve JSON
        this.graphmaker.rawdata =
            this.graphmaker.getRawDataAsync(this.graphmaker.url, {method: "GET"},
            function(error, success){
                if (error) assert.ok(false, error);
                else assert.ok(true, "Loads JSON data");
                done();
            });
    }});

// Assures raw data exists
QUnit.test("Has JSON Data", function(assert){

    assert.ok(this.graphmaker.rawdata, "Loads Raw Data")

});



// accessNestedData testing
QUnit.test("accessNestedData function should access nested data correctly", function(assert){

    var target  = [{hello: {mr: [{field: {howyoudoing: "good!"  }}]}}],
        pointer = "howyoudoing";

    assert.equal(this.graphmaker.accessNestedData(target, pointer), "good!", "found target")

});

// accessNestedData failure testing
QUnit.test("accessNestedData function should return the failing pointer if unsuccessful", function(assert){

    var target  = [{hello: {mr: [{field: {howareyou:  "good!"  }}]}}],
        pointer = "howyoudoing";

    assert.equal(this.graphmaker.accessNestedData(target, pointer), undefined, "captured failing pointer")

});

// accessNestedData stores data into array in graphmaker
QUnit.test("accessNestedData stores data into array in graphmaker", function(assert){

    var target  = JSON.parse(this.graphmaker.rawdata),
        pointer = this.graphmaker.date;

    this.graphmaker.ASTEROIDS = this.graphmaker.accessNestedData(target, pointer);

    assert.ok(typeof this.graphmaker.ASTEROIDS == "object", "array of useful data stored");

});

// accessNestedData takes previously parsed data, then access it further
QUnit.test("accessNestedData takes previously parsed data, then access it further", function(assert){

    var target  = JSON.parse(this.graphmaker.rawdata),
        pointer = this.graphmaker.date;

    this.graphmaker.ASTEROIDS = this.graphmaker.accessNestedData(target, pointer);

        target  = this.graphmaker.ASTEROIDS[0],
        pointer = "name";

    this.graphmaker.asteroidzero = this.graphmaker.accessNestedData(target, pointer);

    assert.ok(typeof this.graphmaker.asteroidzero == "string", " retrieves name of asteroid: " + this.graphmaker.asteroidzero);

});

// Use buildArrayFrom to generate array from data set and label/target data

QUnit.test("Use buildArrayFrom to generate array from data set and label/target data", function(assert){

    var data  = [{hello: {mr: [{field: {name: "nick", age: 26}}]}}, {hello: {mr: [{field: {name: "john", age: 46}}]}}]

    var newArray = this.graphmaker.buildArrayFrom(data, {name: "name", age: "age"});

    for (var item of newArray){

        assert.ok(Object.keys(item).toString() === 'name,age', "name: " + item['name'] + " age: " + item['age']);

    }
});






//// 3. Comparing Data ////

// Initial Load
QUnit.module( "Comparing Data", {

    beforeEach : function( assert ){

        var done = assert.async();
        var that = this;
        // Prepare Graphmaker
        this.graphmaker = new Graphmaker();

        // Set up JSON URL
        var url =   'https://api.nasa.gov/neo/rest/v1/feed?' +
                    'start_date=' + this.graphmaker.date +
                    '&api_key=3NW9wqg2QvSWpj4WAFj3tTQYTK85Hj1UEqKsoRo4';
        this.graphmaker.url = url;

        // Retrieve JSON

        this.graphmaker.getRawDataAsync(this.graphmaker.url, {method: "GET"},
        function(error, success){
            if (error) assert.ok(false, error);
            else assert.ok(true, "Loads JSON data");

            // Store Asteroids in array

            var target  = JSON.parse(that.graphmaker.rawdata),
                pointer = that.graphmaker.date;

            that.graphmaker.ASTEROIDS = that.graphmaker.accessNestedData(target, pointer);
            done();
        });



}});

// compareAndBuild with real JSON

QUnit.test("Use buildArrayFrom to generate array from real JSON data set and label/target data", function(assert){

    var newArray = this.graphmaker.buildArrayFrom(this.graphmaker.ASTEROIDS, {name: "name", size: "estimated_diameter_min"});

    for (var item of newArray){

        assert.ok(Object.keys(item).toString() === 'name,size', "name: " + item['name'] + " size: " + item['size']);

    }
});

// use sortBy to sortBy to take dataset and sort based on property

QUnit.test("Use sortBy to sort array of objects based on proeprty value", function(assert){

    var array = [{age: 45},{age: 25},{age: 13},{age: 34},{age: 90}]
    var newArray = this.graphmaker.sortBy(array, 'age');

    var baseNum = 0;

    for (var item of newArray){

        assert.ok(item['age'] >= baseNum, item['age'] + " is less or equal to...");
        baseNum = item['age'];

    }
});

// use sortBy with 'high-to-low' as third argument to reverse array after operation

QUnit.test("Use sortBy with 'high-to-low' as third argument to reverse array after operation", function(assert){

    var array = [{age: 45},{age: 25},{age: 13},{age: 34},{age: 90}]
    var newArray = this.graphmaker.sortBy(array, 'age', 'high-to-low');

    var baseNum = Infinity;

    for (var item of newArray){

        assert.ok(item['age'] <= baseNum, item['age'] + " is greater or equal to...");
        baseNum = item['age'];

    }
});

// use sortBy to sortBy to take real JSON dataset and sort based on property

QUnit.test("Use sortBy to sort array of real JSON data based on proeprty value", function(assert){

    var array = this.graphmaker.buildArrayFrom(this.graphmaker.ASTEROIDS, {name: "name", size: "estimated_diameter_min"});
        newArray = this.graphmaker.sortBy(array, 'size');

    var baseNum = 0;

    for (var item of newArray){

        assert.ok(item['size'] >= baseNum, item['size'] + " is less or equal to...");
        baseNum = item['size'];

    }
});

// // use scale to take set of data, sort it and then return original data with scaled values substituted
//
// QUnit.test("Use scale to sort data, then return original data with scaled values substituted", function(assert){
//
//     var array = this.graphmaker.buildArrayFrom(this.graphmaker.ASTEROIDS, {name: "name", size: "estimated_diameter_min"});
//         newArray = this.graphmaker.scale(array, 'size', [0, 100]);
//
//         assert.equal(newArray[0]['size'], 0, 'should scale lowest value to minscale value')
//         assert.equal(newArray[newArray.length-1]['size'], 100, 'should scale highest value to maxscale value')
//
//
// })




//// 3. Replacement & Formatting ////

// Initial Load
QUnit.module( "Replacement & Formatting", {

    beforeEach : function( assert ){

        var done = assert.async();
        var that = this;
        // Prepare Graphmaker
        this.graphmaker = new Graphmaker();

        // Set up JSON URL
        var url =   'https://api.nasa.gov/neo/rest/v1/feed?' +
                    'start_date=' + this.graphmaker.date +
                    '&api_key=3NW9wqg2QvSWpj4WAFj3tTQYTK85Hj1UEqKsoRo4';
        this.graphmaker.url = url;

        // Retrieve JSON

        this.graphmaker.getRawDataAsync(this.graphmaker.url, {method: "GET"},
        function(error, success){
            if (error) assert.ok(false, error);
            else assert.ok(true, "Loads JSON data");

            // Store Asteroids in array

            var target  = JSON.parse(that.graphmaker.rawdata),
                pointer = that.graphmaker.date;

            that.graphmaker.ASTEROIDS = that.graphmaker.accessNestedData(target, pointer);
            done();
        });



}});


// nestedReplaceWith searches objects in arrays with properties and replaces their value/formats with function

QUnit.test("nestedReplaceWith can replace object values(or format those values)", function(assert){

    var array = [{age: 45},{age: 25},{age: 13},{age: 34},{age: 90}],
        newArray = this.graphmaker.nestedReplaceWith(array[0], 'age', 90);

    /* Single */
    assert.equal(newArray[0]['age'], 90, 'Can replace single value. 45 became 90');


    /* Multiple */
    newArray = this.graphmaker.nestedReplaceWith(array, 'age', 20);

    assert.ok(newArray.every(c => c['age'] == 20), 'Can replace all items. All now 20');

    /* Function */
    var double = (c) => c * 2;

    newArray = this.graphmaker.nestedReplaceWith(array, 'age', double);

    assert.ok(newArray[1]['age'] == 40, 'Can use function to format values. 20 became 40');


});

// formatNumTo converts numbers with optional post string and decimal places

QUnit.test("formatNumTo converts numbers with optional post string and decimal places", function(assert){

    assert.equal(this.graphmaker.formatNumTo(2000), "2,000", "Can take four digit integer & format");
    console.log(this.graphmaker.formatNumTo(2000).length)

    assert.equal(this.graphmaker.formatNumTo(2000.354), "2,000.354", "Can take four digit float & and format (no effect on decimals)");

    assert.equal(this.graphmaker.formatNumTo(200000000), "200,000,000", "Can work with long numbers");

    assert.equal(this.graphmaker.formatNumTo(6000.666789, 3), "6,000.666", "Can be given argument to specify decimal places");

    assert.equal(this.graphmaker.formatNumTo(6000.666789, 0), "6,000", "Can use decimal place argument of 0 to return formatted integer");

    assert.equal(this.graphmaker.formatNumTo(6000.666789, 0, 'km'), "6,000km", "Can be given third argument to add to end of result string");

});
