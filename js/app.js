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
    data = g.nestedReplaceWith(data, "size", (num) => g.formatNumTo(num, 2, "km"));
    // Speed formatting
    data = g.nestedReplaceWith(data, "speed", (num) => g.formatNumTo(num, 2, "km/s"));
    // Miss Distance formatting
    data = g.nestedReplaceWith(data, "missedby", (num) => g.formatNumTo(num, 2, "km"));

    var toggleVals = {
        name: "Name",
        size: "Size",
        speed: "Speed",
        missedby: "Miss Distance"};

    var styles = {
    size: {
        left: ['value', '%'],
        top: ['order', '%'],
        width: ['value', 'em'],
        height: ['value', 'em']
    },
    speed: {
        left: ['value', '%'],
        top: ['order', '%'],
    },
    missedby: {
        left: ['value', "%"],
        top: ['order', '%']
    }
    }

    var output  =   g.generateToggleGraph(data, toggleVals, styles);
                    g.listToToggle(output.firstChild, ['<', '>'], true);

    document.getElementById("graph").appendChild(output);

});
