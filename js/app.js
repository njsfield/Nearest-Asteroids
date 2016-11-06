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
