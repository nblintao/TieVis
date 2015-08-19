/**
 * Created by Fangzhou on 2014/12/15.
 */
(function() {
    var pixelmap = angular.module("pixelmap", ['d3']);

    pixelmap.directive("d3Pixelmap",  ['$window', '$timeout', 'd3Service', '$http',
        function($window, $timeout, d3Service, $http) {
            return {
                restrict: 'A',
                link: function(scope, ele, attrs) {
                    d3Service.d3().then(function(d3) {
                        $http.get("/graph").success(function(data) {
                            //make data
                            var maxYear = Number.MIN_VALUE;
                            var minYear = Number.MAX_VALUE;
                            var maxAsp = Number.MIN_VALUE;
                            var minAsp = Number.MAX_VALUE;
                            var maxPr = Number.MIN_VALUE;
                            var minPr = Number.MAX_VALUE;
                            var tmp = [];
                            for(var i = 0; i < data.length; i++) {
                                var value = data[i].value;
                                if(Object.keys(value).length > 1) {
                                    for (var year in value) {
                                        maxYear = d3.max([maxYear, Number(year)]);
                                        minYear = d3.min([minYear, Number(year)]);
                                        maxAsp = d3.max([maxAsp, value[year].asp]);
                                        minAsp = d3.min([minAsp, value[year].asp])
                                        maxPr = d3.max([maxPr, value[year].pagerank[0], value[year].pagerank[1]]);
                                        minPr = d3.min([minPr, value[year].pagerank[0], value[year].pagerank[1]]);
                                    }
                                    tmp.push(data[i]);
                                }
                            }
                            data = tmp;
                            var aspColor = d3.scale.linear().domain([minAsp, maxAsp])
                                .range(["#ff0000", "#ffffff"]);
                            var prColor = d3.scale.linear().domain([minPr, maxPr])
                                .range(["#ffffff", "#ff0000"]);
                            var renderTimeout;
                            var margin = parseInt(attrs.margin) || 20,
                                barHeight = parseInt(attrs.barHeight) || 20,
                                barPadding = parseInt(attrs.barPadding) || 5;
                            var variableCount = 3;
                            var svgWidth = 500, svgHeight = 1000;
                            var pixelUnit = 3, rowHeight = variableCount * pixelUnit;
                            var rowWidth = (maxYear - minYear + 1) * pixelUnit;
                            var rowCount = Math.floor(svgWidth / rowWidth);
                            var svg = d3.select(ele[0])
                                .append('svg')
                                .attr("width", svgWidth)
                                .attr("height", svgHeight);
                            var g = svg.append("g");
                            var rows = g.selectAll("g")
                                .data(data)
                                .enter()
                                .append("g")
                                .attr("transform", function(d, i) {
                                    return "translate(" + ((rowWidth + 1) * (i % rowCount)) + "," + ((rowHeight + 1) * (Math.floor(i / rowCount))) + ")";
                                });
                            rows.append("rect")
                                .attr("x", 0)
                                .attr("y", 0)
                                .attr("width", rowWidth)
                                .attr("height", rowHeight)
                                .attr("fill", "#f0f0f0");
                            rows.selectAll("rect")
                                .data(function(d) {
                                    var data = [];
                                    for(var key in d.value) {
                                        if(d.value[key]["bridge"]) {
                                            data.push({year:key, type:"asp", value: 0});
                                        } else {
                                            data.push({year:key, type:"asp", value: d.value[key]["asp"]});
                                        }
                                        data.push({year:key, type:"pr1", value: d.value[key]["pagerank"][0]});
                                        data.push({year:key, type:"pr2", value: d.value[key]["pagerank"][1]});
                                    }
                                    return data;
                                })
                                .enter()
                                .append("rect")
                                .attr("x", function(d) {
                                    var year = Number(d.year);
                                    return (year - minYear) * pixelUnit;
                                })
                                .attr("y", function(d) {
                                    var y;
                                    if(d.type === "asp") {
                                        y = 0;
                                    } else if(d.type === "pr1") {
                                        y = pixelUnit;
                                    } else if(d.type === "pr2") {
                                        y = 2 * pixelUnit;
                                    }
                                    return y;
                                })
                                .attr("width", pixelUnit)
                                .attr("height", pixelUnit)
                                .attr("fill", function(d) {
                                    var color;
                                    if(d.type === "asp") {
                                        color = aspColor(d.value);
                                    } else if(d.type === "pr1" || d.type == "pr2") {
                                        color = prColor(d.value);
                                    }
                                    return color;
                                });

                        });

                    });
                }}
        }]);

})()