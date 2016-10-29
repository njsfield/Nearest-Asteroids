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

// compareAndBuild

QUnit.test("Use compareAndBuild function to take data, compare one element set, then build new array of objects", function(assert){

    var sorted = this.graphmaker.compareAndBuild(this.graphmaker.ASTEROIDS, "name", "estimated_diameter_min", "diameter");

    var decrementingNum = Infinity;
    var results = sorted.forEach(function(asteroid){

        assert.ok(asteroid.diameter < decrementingNum, asteroid.diameter + " is greater than...");
        decrementingNum = asteroid.diameter;
    });

    assert.ok(true, "0")
});
