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
QUnit.test("QUNit Init", function(assert){

    assert.ok(1 === 1, 'Testing on 1 === 1');
});


/* Graphmaker Setup*/
QUnit.test("getFormattedDate", function(assert){

    assert.equal(
        this.graphmaker.getFormattedDate("July 21, 1983", "yyyy-mm-dd"),
                                            "1983-07-21",
                                            "Should return correctly formatted date");
});

/* getRawDataAsync */
QUnit.test("getRawDataAsync", function(assert){

    assert.ok(true, "retrieveJSON can take GOOD url and retrieve JSON data asynchronously")

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
QUnit.test("NASA API JSON", function(assert){

    assert.ok(this.graphmaker.rawdata, "Loads Raw Data")

});



//Graphmaker.prototype.accessNestedData
QUnit.test("accessNestedData", function(assert){

    // accessNestedData success testing
    assert.ok(true, 'accessNestedData function should access nested data correctly');

        var target  = [{hello: {mr: [{field: {howyoudoing: "good!"  }}]}}],
            pointer = "howyoudoing";

            assert.equal(this.graphmaker.accessNestedData(target, pointer), "good!", "found target")


    // accessNestedData failure testing
    assert.ok(true, 'accessNestedData function should return the failing pointer if unsuccessful');

            target  = [{hello: {mr: [{field: {howareyou:  "good!"  }}]}}],

            assert.equal(this.graphmaker.accessNestedData(target, pointer), undefined, "captured failing pointer")

    // accessNestedData stores data into array in graphmaker
    assert.ok(true, 'accessNestedData stores data into array in graphmaker');

            target  = JSON.parse(this.graphmaker.rawdata),
            pointer = this.graphmaker.date;

            this.graphmaker.ASTEROIDS = this.graphmaker.accessNestedData(target, pointer);

            assert.ok(typeof this.graphmaker.ASTEROIDS == "object", "array of useful data stored");

    // accessNestedData takes previously parsed data, then access it further
    assert.ok(true, "accessNestedData takes previously parsed data, then access it further");

            target  = this.graphmaker.ASTEROIDS[0],
            pointer = "name";

            this.graphmaker.asteroidzero = this.graphmaker.accessNestedData(target, pointer);

            assert.ok(typeof this.graphmaker.asteroidzero == "string", " retrieves name of asteroid: " + this.graphmaker.asteroidzero);

});


//Graphmaker.prototype.buildArrayFrom
QUnit.test("buildArrayFrom", function(assert){

    // Use buildArrayFrom to generate array from data set and label/target data
    assert.ok(true, 'Use buildArrayFrom to generate array from data set and label/target data');

        var data  = [{hello: {mr: [{field: {name: "nick", age: 26}}]}}, {hello: {mr: [{field: {name: "john", age: 46}}]}}]

        var newArray = this.graphmaker.buildArrayFrom(data, {name: "name", age: "age"});

        for (var item of newArray){

        assert.ok(Object.keys(item).toString() === 'name,age', "name: " + item['name'] + " age: " + item['age']);

    };

    // Use buildArrayFroms deep argument to ensure deep string/number is accessed
    assert.ok(true, 'Use buildArrayFroms deep argument to ensure deep string/number is accessed');

        data  = [{hello: {age: [{field: {name: "nick", age: 26}}]}}, {hello: {age: [{field: {name: "john", age: 46}}]}}]

        newArray = this.graphmaker.buildArrayFrom(data, {age: "age"}, true);

        assert.equal(newArray[0]['age'], 26, 'deep setting ensures objects are not passed. Retrieved 26 instead of Object')


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


// use sortBy to sortBy to take dataset and sort based on property

QUnit.test("sortBy", function(assert){

    // use sortBy with 'high-to-low' as third argument to reverse array after operation
    assert.ok(true, 'Use sortBy to sort object data by property type');

        var array = [{age: 45},{age: 25},{age: 13},{age: 34},{age: 90}]
        var newArray = this.graphmaker.sortBy(array, 'age');

        var baseNum = 0;

        for (var item of newArray){

            assert.ok(item['age'] >= baseNum, item['age'] + " is less or equal to...");
            baseNum = item['age'];

        }

    // use sortBy with 'high-to-low' as third argument to reverse array after operation
    assert.ok(true, 'Use sortBy with high-to-low as third argument to reverse array after operation');

        newArray = this.graphmaker.sortBy(array, 'age', 'high-to-low');

        baseNum = Infinity;

        for (var item of newArray){

            assert.ok(item['age'] <= baseNum, item['age'] + " is greater or equal to...");
            baseNum = item['age'];

        }

    // Use sortBy to sort array of real JSON data based on proeprty value
    assert.ok(true, 'Use sortBy to sort array of real JSON data based on proeprty value');

        array = this.graphmaker.buildArrayFrom(this.graphmaker.ASTEROIDS, {name: "name", size: "estimated_diameter_min"});
        newArray = this.graphmaker.sortBy(array, 'size');

        baseNum = 0;

        for (var item of newArray){

            assert.ok(item['size'] >= baseNum, item['size'] + " is less or equal to...");
            baseNum = item['size'];

        }
});

// use scale to take set of data, sort it and then return original data with scaled values substituted

QUnit.test("scale", function(assert){

    var array = [{age:50},{age:40},{age:70},{age:60}];
        newArray = this.graphmaker.scale(array, 'age');

        assert.equal(newArray[0]['age'], 0, 'should scale lowest value to 0 by default');
        assert.equal(newArray[newArray.length-1]['age'], 100, 'should scale highest value to 100 by default');

        newArray = this.graphmaker.scale(array, 'age', [0,200]);

        assert.equal(newArray[0]['age'], 0, 'should scale lowest value to minscale value 0');
        assert.equal(newArray[newArray.length-1]['age'], 200, 'should scale lowest value to minscale value 200');

        array = this.graphmaker.buildArrayFrom(this.graphmaker.ASTEROIDS, {name: "name", size: "estimated_diameter_min"});
        newArray = this.graphmaker.scale(array, 'size', [30,60]);

        assert.equal(newArray[0]['size'], 30, 'can work with complex objects. Min value = 30');
        assert.equal(newArray[newArray.length-1]['size'], 60, 'can work with complex objects. Max value = 60');


})




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

QUnit.test("nestedReplaceWith", function(assert){

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

QUnit.test("formatNumTo", function(assert){

    assert.equal(this.graphmaker.formatNumTo(2000), "2,000", "Can take four digit integer & format");

    assert.equal(this.graphmaker.formatNumTo(2000.354), "2,000.354", "Can take four digit float & and format (no effect on decimals)");

    assert.equal(this.graphmaker.formatNumTo(200000000), "200,000,000", "Can work with long numbers");

    assert.equal(this.graphmaker.formatNumTo(6000.666789, 3), "6,000.666", "Can be given argument to specify decimal places");

    assert.equal(this.graphmaker.formatNumTo(6000.666789, 0), "6,000", "Can use decimal place argument of 0 to return formatted integer");

    assert.equal(this.graphmaker.formatNumTo(6000.666789, 0, 'km'), "6,000km", "Can be given third argument to add to end of result string");

});





//// 3. DOM Tools ////

// Initial Load
QUnit.module( "DOM Tools", {

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

/* buildDomElementFrom */
QUnit.test("buildDomElementFrom", function(assert){

    var done = assert.async();

    assert.ok(true, "Can build dom element named by first argument");

    var div = this.graphmaker.buildDomElementFrom("span");

    /* Basic Construction */
    assert.ok(typeof div == "object", "can construct dom element");

        div = this.graphmaker.buildDomElementFrom("span", "Hello World");

    /* Construction */
    assert.equal(div.innerHTML, "Hello World", "can construct dom element with text in");

    /* Attribute additions */
        div = this.graphmaker.buildDomElementFrom("span", {style: "color: red;"},"Hello World");

    assert.equal(div.style.color, "red", "can add attributes");

    done();

});

/* generateToggleGraph */
QUnit.test("generateToggleGraph", function(assert){

    var done = assert.async();

    assert.ok(true, "Can build container with toggle items and dataset");

        var data = [{name: "nick", age: 26, career: "software", birthday: 1989},
                    {name: "jen", age: 29, career: "teacher", birthday: 1986},
                    {name: "alex", age: 60, career: "unemployed", birthday: 1920},
                    {name: "tom", age: 45, career: "sales", birthday: 1974},
                    {name: "matt", age: 18, career: "drugdealer", birthday: 1994}],

            toggleVals = {name: "name", age: "age", career: "career", birthday: "birthday"};

        var output = this.graphmaker.generateToggleGraph(data, toggleVals);

        var graph = document.getElementById("graph").appendChild(output);

    /* Can generate a container with lists in the DOM */
    assert.ok(graph, "Can generate a container with lists in the DOM");

        graph.children[0].children[0].click();

        var displayResult = graph.children[1].children[1].textContent;

    /* Can set text content when toggle item clicked */
    assert.equal(displayResult, "jen", "Can set display attribute when toggle item clicked");

        graph.parentNode.removeChild(graph);

            data = this.graphmaker.buildArrayFrom(this.graphmaker.ASTEROIDS, {
                name: "name",
                size: "estimated_diameter_min",
                speed: "kilometers_per_second",
                missedby: "kilometers"
            }, true);

            toggleVals = {name: "name", size: "size", speed: "speed", missedby: "missedby"};

            output = this.graphmaker.generateToggleGraph(data, toggleVals);

            graph = document.getElementById("graph").appendChild(output);

    /* Can generate a container with JSON lists in the DOM */
    assert.ok(graph, "Can generate a container with real data lists in the DOM");

    done();

})

/* menuToToggle */

QUnit.test("listToToggle", function(assert){

    /* Can take existing set of DOM elements, then convert them to toggle UI */
    var menu = graph.firstChild.firstChild;

        this.graphmaker.listToToggle(menu, ['<', '>'], true);

    /* Can take existing set of DOM elements, then convert them to toggle UI */
    assert.ok(menu.lastChild.textContent == ">", "Can convert list items to toggle UI: " + menu.lastChild.textContent);

    var currentText = document.querySelector('.display').textContent;

        menu.lastChild.click();

    var newText = document.querySelector('.display').textContent;
    /* on toggle click, text content changes */
    assert.ok(currentText != newText, "Changes display text when back/forward items clicked: " + currentText + " became " + newText);
})
