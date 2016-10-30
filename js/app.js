/* Test against QUnit failures */

var graphmaker = new Graphmaker();

var data = [{name: "nick", age: 26, career: "software", birthday: 1989},
            {name: "jen", age: 29, career: "teacher", birthday: 1986},
            {name: "alex", age: 60, career: "unemployed", birthday: 1920},
            {name: "tom", age: 45, career: "sales", birthday: 1974},
            {name: "matt", age: 18, career: "drugdealer", birthday: 1994}];

var output = this.graphmaker.generateToggleGraph(data, {name: "name", age: "age", career: "career", birthday: "birthday"});

document.getElementById("graph").appendChild(output);
