/**
 * Created by Fangzhou on 2015/3/7.
 */
(function() {
    var app = angular.module('matViewModule', ["reactModule", "matrixModule",'d3Module', "configModule"]);
    app.factory("matFuncs", ["$http", "Matrix_", "d3", "config",function($http, Matrix_, d3, config) {
        var matViewFuncs = {};
        var canvas, matrix, graph;
        var direct = true;
        matViewFuncs.init = function() {
            canvas = d3.select("#matrix");
            matrix = new Matrix_(canvas, config.matrixConfig);

        };
        var lastYear;
        matViewFuncs.loadData = function(year, mode) {
            if(mode === "Matrix") {
                matViewFuncs.loadMatrix(year);
            } else if(mode === "Node-Link") {
                matViewFuncs.loadNodeLink(year);
            }
        };
        matViewFuncs.loadMatrix = function(year) {
            if(year[0] === undefined) {
                year[0] = lastYear;
            } else {
                lastYear = year[0];
            }
            $http.get("/matrix", {params:{year:year[0]}}).success(function(d) {

                matrix.remove();
                graph = new Graph();
                graph.loadJSON(d);

                if(year[1] !== undefined) {
                    var links = graph.getLinks();
                    links.forEach(function(d) {
                        var l = graph.link(d);
                        var ls = [l.target, l.source].sort().toString();
                        if(year[1].indexOf(ls) === -1) {
                            graph.removeLink(d);
                        }
                    });
                    var nodes = graph.getNodes();
                    nodes.forEach(function(d) {
                        if(graph.adjacents(d).length === 0) {
                            graph.removeNode(d);
                        }
                    })

                }

                matrix.render(graph);
            });
        };
        matViewFuncs.spread = function(value, year, nodes, spread) {
            if(value.length < 500 && (spread === undefined || spread.length < 500)) {
                var idxs = {};
                if(spread === undefined) {
                    value.forEach(function(e) {
                        var ns = e.split("_");
                        idxs[ns[0]] = 1;
                        idxs[ns[1]] = 1;
                    });
                } else {
                    spread.forEach(function(e) {
                        var ns = e.edge.split("_");
                        idxs[ns[0]] = 1;
                        idxs[ns[1]] = 1;
                    });
                }

                idxs = Object.keys(idxs);
                $http.get("/queryByIdxs", {
                    params:{
                        idxs:idxs,
                        time:year,
                        direct:config.direct
                    }
                }).success(function(d) {
                    d = d.map(function(e) {
                        var te = {edge:e};
                        if(value.indexOf(e) !== -1) {
                            te.select = true;
                        } else {
                            te.select = false;
                        }
                        return te;
                    });
                    if(spread !== undefined && spread.length === d.length) {
                        matViewFuncs.loadNodeLink(spread, nodes);
                    } else {
                        matViewFuncs.spread(value, year, nodes, d);
                    }
//                    funcs.highlight(value, d, year, undefined, nodes);

                });
            } else {
                if(spread === undefined) {
                    spread = value.map(function(e) {
                        return {
                            edge:e,
                            select:true
                        }
                    })
                }
                matViewFuncs.loadNodeLink(spread, nodes);
            }
        };
        matViewFuncs.loadNodeLink = function(spread, nodes) {
            var dic = {};
            var idx = [];
            spread.forEach(function(d) {
                var ns = d.edge.split("_");
                if(dic[ns[0]] === undefined) {
                    idx.push(ns[0]);
                    dic[ns[0]] = 1;
                }
                if(dic[ns[1]] === undefined) {
                    idx.push(ns[1]);
                    dic[ns[1]] = 1;
                }
            });
            $http.get("/names", {
                params:{
                    idx:idx
                }
            }).success(function(names) {
                var dic = {};
                names.forEach(function(n) {
                    dic[n.idx] = n.name;
                });
                spread = spread.map(function(e) {

                    var ns = e.edge.split("_");
                    var edge;
                    if(!config.direct) {
                        edge = [dic[ns[0]],dic[ns[1]]].sort().toString()
                    } else {
                        edge = [dic[ns[0]],dic[ns[1]]].toString()
                    }
                    return {
                        edge:edge,
                        select: e.select
                    };
                });
                canvas.selectAll("*").remove();
                var graph = {nodes:[], links:[]};
                for(var i = 0; i < spread.length; i++) {
                    var tn = spread[i].edge.split(",");
                    if(tn[0] === tn[1]) {
                        continue;
                    }
                    var node0 = graph.nodes.filter(function(d) {
                        if(d.name === tn[0]) {
                            return true;
                        }
                    });
                    var node1 = graph.nodes.filter(function(d) {
                        if(d.name === tn[1]) {
                            return true;
                        }
                    });
                    var nId0, nId1;
                    if(node0.length === 0) {
                        nId0 = graph.nodes.push({name:tn[0]}) - 1;
                    } else {
                        nId0 = graph.nodes.indexOf(node0[0]);
                    }
                    if(node1.length === 0) {
                        nId1 = graph.nodes.push({name:tn[1]}) - 1;
                    } else {
                        nId1 = graph.nodes.indexOf(node1[0]);

                    }
                    graph.links.push({
                        source:nId0,
                        target:nId1,
                        select:spread[i].select
                    });
                }
                var container = canvas.append("g");
                var zoomed = function() {
                    container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                };
                var zoom = d3.behavior.zoom()
                    .scaleExtent([0.1, 5])
                    .on("zoom", zoomed);
                canvas.call(zoom);

                container.append("g")
                    .call(drawNodeLink, graph, 800, 800);
            });


        };
        var drawNodeLink =  function(g, graph, width, height) {



            var nodeColor = d3.scale.category20();
            g.selectAll("line").remove();
            g.selectAll("circle").remove();
            var force = d3.layout.force()
                .charge(-120)
                .linkDistance(30)
                .size([width, height]);
            force
                .nodes(graph.nodes)
                .links(graph.links)
                .start();

            var link = g.selectAll(".link")
                .data(graph.links)
                .enter().append("line")
                .attr("stroke-width", function(d) {
                    var res;
                    if(d.select) {
                        res = 2;
                    } else {
                        res = 2;
                    }
                    return res;
                })
                .attr("stroke", function(d) {
                        var res;
                        if(d.select) {
                            res = nodeColor(d.level);
                        } else {
                            res = "#ccc";
                        }
                    return res;
                })
                .attr("opacity", function(d) {
                    var res;
                    if(d.select) {
                        res = 1;
                    } else {
                        res = 0.2;
                    }
                    return res;
                });
            var node = g.selectAll(".node")
                .data(graph.nodes)
                .enter().append("circle")
                .attr("r", 5)
                .style("fill", function(d) { return "#ccc"; });
            if(config.direct) {
                var defs = d3.select("#matrix").append("defs");
                var arrowMarker = defs.append("marker")
                    .attr("id","arrow")
                    .attr("markerUnits","strokeWidth")
                    .attr("markerWidth","6")
                    .attr("markerHeight","6")
                    .attr("viewBox","0 0 12 12")
                    .attr("refX","15")
                    .attr("refY","6")
                    .attr("orient","auto");

                var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";

                arrowMarker.append("path")
                    .attr("d",arrow_path)
                    .attr("fill","#000")
                    .attr("stroke-width", 0);
                link.attr("marker-end","url(#arrow)");
            }


            node.append("title")
                .text(function(d) { return d.name; });

            force.on("tick", function() {
                link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                node.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
            });
            for(var i = 0; i < 1000; i++) {
                force.tick();
            }
            force.stop();
            var nodes = force.nodes();
            var minX = d3.min(nodes, function(d) {
                return d.x;
            });
            var maxX = d3.max(nodes, function(d) {
                return d.x
            });
            var minY = d3.min(nodes, function(d) {
                return d.y;
            });
            var maxY = d3.max(nodes, function(d) {
                return d.y;
            });
            g.attr("transform", "translate(" + (width / 2 - (maxX + minX) / 2) + "," + (height / 2 - (maxY + minY) / 2) + ")");

        };
        return matViewFuncs;
    }]);
})();