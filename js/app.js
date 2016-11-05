/* Initialize */
var graphmaker = new Graphmaker();

graphmaker.url =   'https://api.nasa.gov/neo/rest/v1/feed?' +
            'start_date=' + graphmaker.date +
            '&api_key=3NW9wqg2QvSWpj4WAFj3tTQYTK85Hj1UEqKsoRo4';

/* Retrieve Nasa JSON */
graphmaker.getRawDataAsync(graphmaker.url, {method: "GET"}, function(){

    var target  = JSON.parse(graphmaker.rawdata),
        pointer = graphmaker.date;

        graphmaker.ASTEROIDS = graphmaker.accessNestedData(target, pointer);

    var data = graphmaker.buildArrayFrom(graphmaker.ASTEROIDS, {
            name: "name",
            size: "estimated_diameter_min",
            speed: "kilometers_per_second",
            missedby: "kilometers"
        }, true);

    var toggleVals = {
            name: "name",
            size: "size",
            speed: "speed",
            missedby: "missedby"};

    var output = graphmaker.generateToggleGraph(data, toggleVals);
                 graphmaker.listToToggle(output.firstChild, ['<', '>'], true);

    document.getElementById("graph").appendChild(output);

});
