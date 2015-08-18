/**
 * Created by Fangzhou on 2015/1/16.
 */
(function() {
    var app = angular.module('funcModule', ['calFuncModule', 'pipModule']);
    app.factory('funcs', ["$http", "calFuncs", "pipService", function($http, calFunc, pipService) {
        // return d3Service.d3().then(function(d3) {
        var flowWidth = [];
        var funcs = {};
        var outFlow = function(coor0, coor1, flow, year0, year1, outY) {
            var res = [flow[0]];
            res.push({
                x:coor0[year0 + 1].left.x,
                y0:outY,
                y1:outY + flow[0].y1 - flow[0].y0
            });
            res.push({
                x:coor0[year1 - 1].right.x,
                y0:outY,
                y1:outY + flow[0].y1 - flow[0].y0
            });
            res.push(flow[1]);
            return res;
        };
        var flowGenerator = function(d) {
            var path = ["M " + (d.sx) + "," + d.sy0];
            var cpx = 50;
            path.push("C " + (d.sx + cpx) + "," + d.sy0 +
                " " + (d.ex - cpx) + "," + d.ey0 +
                " " + (d.ex) + "," + d.ey0);
            path.push("L " + (d.ex) + "," + d.ey0 +
                " " + (d.ex) + "," + d.ey1);
            //path.push("M " + xScale(d[d.length - 1].x) + "," + d[d.length - 1].y1);
            path.push("C " + (d.ex- cpx) + "," + d.ey1 +
                " " + (d.sx + cpx) + "," + d.sy1 +
                " " + (d.sx) + "," + d.sy1);
            //path.push("M " + xScale(d[i].x) + "," + d[i].y1);

            path.push("L " + d.sx + "," + d.sy1+
                " " + d.sx + "," + d.sy0);
            return path.join(" ");
        };
        var paraGenerator = function(d) {
            var path = ["M " + d[0].x + "," + d[0].y];
            for(var i = 1; i < d.length; i++) {
                path.push("L " + d[i].x + "," + d[i].y);
            }
            path.push("L " + d[0].x + "," + d[0].y);
            return path.join(" ");
        };
        var setRelGenerator = function(d) {
            var path = ["M " + d[0].x0 + "," + d[0].y];
            path.push("L " + d[0].x1 + "," + d[0].y);
            path.push("L " + d[1].x1 + "," + d[1].y);
            path.push("L " + d[1].x0 + "," + d[1].y);
            path.push("L " + d[0].x0 + "," + d[0].y);
            return path.join();
        };
        //var flowId = 0;
        //var outY = 0;
        var calMultiEdgeFlow = function(coor, nodes, prtId, global) {
            var startYear = 2005;
            //[bar:[], flow:[]]
            var res = {bar:[], flow:[]};
            var keys = Object.keys(nodes).sort();
            for(var i = 0; i < keys.length; i++) {
                var split = keys[i].split("_");
                var year = Number(split[0]) - startYear;
                var level = Number(split[1]);
                var child = nodes[keys[i]].child;
                var childKeys = Object.keys(child).sort();
                var childBar = [];
                var startData = coor[level][year];
                var startX = startData.right.x;
                var id = global["flowId"]++;
                var barHeight = (nodes[keys[i]].count / startData.data) * (startData.y1 - startData.y0);
                res.bar.push({
                    data:[
                        {
                            x:startData.left.x,
                            y:startData.byBar
                        },
                        {
                            x:startData.right.x,
                            y:startData.byBar + barHeight
                        }
                    ],
                    id:id,
                    prtId:prtId
                });
                startData.byBar += barHeight;
                for(var j = 0; j < childKeys.length; j++) {
                    var flow = {
                        id : global["flowId"]++,
                        prtId : id,
                        data:[]
                    };
                    var childSplit = childKeys[j].split("_");
                    var childYear = Number(childSplit[0]) - startYear;
                    var childLevel = Number(childSplit[1]);
                    var endData = coor[childLevel][childYear];
                    var startIncre = (child[childKeys[j]].count / startData.data) * (startData.y1 - startData.y0);
                    var endIncre = (child[childKeys[j]].count / endData.data) * (endData.y1 - endData.y0);
                    flow.data.push(
                        {
                            x:startData.right.x,
                            y0:startData.right.byOut,
                            y1:startData.right.byOut + startIncre
                        },
                        {
                            x:endData.left.x,
                            y0:endData.left.byIn,
                            y1:endData.left.byIn + endIncre
                        }
                    );
                    startData.right.byOut += startIncre;
                    endData.left.byIn += endIncre;
                    if(childYear - year > 1) {
                        flow.data = outFlow(coor[level], coor[childLevel], flow.data, year, childYear, global.outY);
                        global.outY += startIncre;
                    }
                    res.flow.push(flow);
                    if(Object.keys(child[childKeys[j]].child).length != 0) {
                        var childFlow = calMultiEdgeFlow(coor, child[childKeys[j]].child, id, global);
                        for(var k = 0; k < childFlow.bar.length; k++) {
                            childBar.push(childFlow.bar[k]);
                        }
                        for(var k = 0; k < childFlow.flow.length; k++) {
                            res.flow.push(childFlow.flow[k]);
                        }
                    } else {
                        res.bar.push({
                            id:global["flowId"]++,
                            prtId:flow.id,
                            data:[
                                {
                                    x:endData.left.x,
                                    y:endData.right.byOut
                                },
                                {
                                    x:endData.right.x,
                                    y:endData.left.byIn
                                }
                            ]
                        });

                        endData.right.byOut += endIncre;
                        endData.byBar += endIncre;
                    }
                }
                for(var j = 0; j < childBar.length; j++) {
                    res.bar.push(childBar[j]);
                }
                startData.left.byIn = startData.right.byOut = startData.byBar;
            }
            return res;
        };
        funcs.drawFlow = function(g, flowPara, color, yIncre) {
            g.each(function(d) {
                var g = d3.select(this);
                var flowData = calFunc.calFlow(d, flowPara);
                var bars = flowData.bars;
                var color = d3.scale.ordinal().domain([0,1,2,3]).range(colorbrewer.PuBu[4]);
                var barGroups = g.append("g").selectAll("#flowBarGroup")
                    .data(bars)
                    .enter()
                    .append("g")
                    .attr("id", "flowBarGroup");
                var compGroups = barGroups.selectAll("#compBarGroup")
                    .data(function(d) {
                        return d.data;
                    })
                    .enter()
                    .append("g")
                    .attr("id", "compBarGroup");
                var rects = compGroups.selectAll("#flowBars")
                    .data(function(d) {
                        return d
                    })
                    .enter()
                    .append("rect")
                    .attr("x", function(d) {
                        return d.x;
                    })
                    .attr("y", function(d) {
                        return d.y;
                    })
                    .attr("width", function(d) {
                        return d.width;
                    })
                    .attr("height", function(d) {
                        return d.height;
                    })
                    .attr("fill", function(d) {
                        return color(d.level);
                    })
                    .attr("id", "flowBars")
                    .on("click", function(d) {
                        //queryEdges(d.nodes, d.time, d.compID, funcs.spread);
                        funcs.highlightNodes(d.nodes, d.time, d.compID);
                    });
                var streams = flowData.stream;
                var streamGroups = g.append("g").selectAll("#flowStreamGroup")
                    .data(streams)
                    .enter()
                    .append("g")
                    .attr("id", "flowStreamGroup");
                var intervalGroups = streamGroups.selectAll("#intervalGroup")
                    .data(function(d) {
                        return d.data;
                    })
                    .enter()
                    .append("g")
                    .attr("id", "intervalGroup");
                var compStreamGroups = intervalGroups.selectAll("#compStreamGroup")
                    .data(function(d) {
                        return d;
                    })
                    .enter()
                    .append("g")
                    .attr("id", "compStreamGroup");
                var streamPaths = compStreamGroups.selectAll("#streamPath")
                    .data(function(d) {
                        return d;
                    })
                    .enter()
                    .append("path")
                    .attr("d", flowGenerator)
                    .attr("fill", function(d) {
                        return "#999";
                    })
                    .attr("opacity", 1)
                    .on("click", function(d) {
                        console.log(d);
                    });
            })
        };
        var drawDegreeLine = function(g, color) {
            g.each(function(d) {
                var g = d3.select(this);
                var distr = d.distr;
                var data = [];
                var keys = Object.keys(distr);
                //initialize
                var impactLevelNum = keys[0].split("_").length;

                var totalHeight = 0;
                for(var i = 0, keyLen = keys.length; i < keyLen; i++) {
                    totalHeight += distr[keys[i]];
                }
                var logHeight = Math.log(totalHeight)  < 2 ? 2 : Math.log(totalHeight);
                var pos = []
                for(var i = 0; i < impactLevelNum; i++) {
                    //data.push([]);
                    pos.push(-logHeight / 2);
                }

                var scaleX = d3.scale.linear().domain([0, impactLevelNum]).range([0, d.length]);
                for(var i = 0, keyLen = keys.length; i < keyLen; i++) {
                    if(keys[i] === "0_0_0") {
                        continue;
                    }
                    var impacts = keys[i].split("_");
                    for(var j = 0, impLen = impacts.length; j < impLen; j++) {
                        var h = distr[keys[i]] / totalHeight * logHeight;
                        data.push({
                            level:impacts[j],
                            count: h,
                            y:pos[j],
                            x:scaleX(j),
                            index:j,
                            edges: d.edges[keys[i]]
                        });
                        pos[j] += h;
                    }
                }
                var segWidth = d.length / 3;
//                var groupRect = g.append("g");
//                var groups = groupRects.selectAll("g")
//                    .data(data)
//                    .enter()
//                    .append("g");
                g.selectAll("rect")
                    .data(data)
                    .enter()
                    .append("rect")
                    .attr("x", function(d) {
                        return d.x;
                    })
                    .attr("y", function(d, i) {
                        return d.y;
                    })
                    .attr("width", segWidth)
                    .attr("height", function(d) {
                        return d.count;
                    })
                    .attr("fill", function(d) {
                        return color[d.level];
                    })
                    .attr("opacity", function(d) {
                        return 0.5;
                    });
            });
        };
        funcs.drawScatterPlot = function(g, max, para, color) {
            g.each(function(d, i) {
                var g = d3.select(this);
                var scaleX = d3.scale.linear().domain([0,max]).range([-para[2] / 2, para[2] / 2]);
                var scaleY = d3.scale.linear().domain([0,max]).range([para[3], 0]);
                var degrees = Object.keys(d.data);
                var data = [];
                var time = d.time;
                degrees.forEach(function(degree) {
                    var deg = degree.split("_").map(function(d) {
                        return Number(d);
                    });
                    data.push({
                        x:scaleX(deg[0]),
                        y:scaleY(deg[1]),
                        edges: d.data[degree].edges
                    })
                });
                var xAxis = d3.svg.axis()
                    .scale(scaleX)
                    .tickSize(0)
                    .tickPadding(6)
                    .orient("bottom");
                var yAxis = d3.svg.axis()
                    .scale(scaleY)
                    .tickSize(0)
                    .tickPadding(6)
                    .ticks(4)
                    .orient("left");
                g.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + para[3] + ")")
                    .call(xAxis);
                if(i === 0) {
                    g.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(" + (-para[2] / 2)+",0)")
                        .call(yAxis);
                }

                g.append("g").attr("id", "scatterGroup").selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d) {
                        return d.x;
                    })
                    .attr("cy", function(d) {
                        return d.y;
                    })
                    .attr("r", function(d) {
                        return 2;
                    })
                    .attr("fill", "#aaa")
                    .attr("opacity", 0.8)
                var brush = d3.svg.brush()
                    .x(scaleX)
                    .y(scaleY)
                    .on("brushstart", brushstart)
                    .on("brush", brushmove)
                    .on("brushend", brushend);
                var brushCell;

                // Clear the previously-active brush, if any.
                function brushstart(p) {
                    if (brushCell !== this) {
                        d3.select(brushCell).call(brush.clear());
//                        x.domain(domainByTrait[p.x]);
//                        y.domain(domainByTrait[p.y]);
                        brushCell = this;
                    }
                }

                // Highlight the selected circles.
                function brushmove(p) {


                }

                // If the brush is empty, select all circles.
                function brushend() {
//                    if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
                    var e = brush.extent();
//                    svg.selectAll("circle").classed("hidden", function(d) {
//                        return e[0][0] > d[p.x] || d[p.x] > e[1][0]
//                            || e[0][1] > d[p.y] || d[p.y] > e[1][1];
//                    });
                    var edges = [];
                    var year;

                    data.forEach(function(d) {
                        if(d.x > scaleX(e[0][0]) && d.x < scaleX(e[1][0]) && d.y < scaleY(e[0][1]) && d.y > scaleY(e[1][1])) {
                            var keys = Object.keys(d.edges);
                            for(var i = 0; i < keys.length; i++) {
                                edges = edges.concat(d.edges[keys[i]]);
                            }

                        }
                    });
                    if(edges.length !== 0) {
                        funcs.highlightEdges(edges, time, pipService.emitShowEdge);
                    }
                }
                g.call(brush);
            });
        };
        funcs.drawDegree = function(g, max, para, color) {
            this.maxDegree = max;
            this.para = para;
            this.color = color;
            var that = this;
            g.each(function(d, i) {
                var g = d3.select(this);
                var maxDegree = that.maxDegree;
                var para = that.para;
                var color = that.color;
                var data = [];
                var scaleX = d3.scale.linear().domain([0, 1]).range([-para[2] / 2, para[2] / 2]);
                var scaleY = d3.scale.linear().domain([0, max]).range([para[3], 0]);
                for(var key in d.data) {
                    var split = key.split("_");
                    var x0 = scaleX(0),
                        x1 = scaleX(1),
                        y0 = scaleY(Number(split[0])),
                        y1 = scaleY(Number(split[1]));
                    var angle = Math.atan((y1 - y0) / (x1 - x0)) * 180 / Math.PI;
                    data.push({
                        angle : angle,
                        length : Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)),
                        trans : y0,
                        distr : d.data[key].distr,
                        edges: d.data[key].edges,
                        time: d.time
                    });
                    //data.push({d0:Number(split[0]), d1:Number(split[1]), count:d["data"][key]["count"], edge:d["data"][key]["edge"]});
                }
                var degreeGroup = g.append("g").attr("id", "degree" + i);
                var lineGroups = degreeGroup.selectAll("g")
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("transform", function(d) {
                        return "translate(" + (-(x1 - x0) / 2) + "," + d.trans + "), rotate(" + d.angle + ",0 , 0)";
                    })
                    .attr("id", "lineGroups")
                    .call(drawDegreeLine, color)
                    .on("click", function(d) {
                        var edges = [];
                        var keys = Object.keys(d.edges);
                        keys.forEach(function(distr) {
                            d.edges[distr].forEach(function(e) {
                                edges.push(e);
                            })
                        });
//                        funcs.highlight(edges, d.time);
                        funcs.spread(edges, d.time);
                    });

            })
        };
        //     nBet
        //  pair  eBet
        var drawBiBar = function(g, color) {
            var color = d3.scale.ordinal().domain([0,1,2,3]).range(colorbrewer.PuBu[4]);
            g.each(function(d, index) {
                var g = d3.select(this);
                g.append("g").selectAll("path")
                    .data(d.data)
                    .enter()
                    .append("path")
                    .attr("id", "relBar")
                    .attr("d", setRelGenerator)
                    .attr("fill", function(d) {
                        return "#aaa";
                    })
                    .attr("opacity", 1)
                    .on("click", function(d) {
//                        funcs.highlight(d[0].edges, d[0].time);
                        funcs.highlightEdges(d[0].edges, d[0].time, pipService.emitShowEdge);
                    });
                g.append("g").selectAll("g")
                    .data(d.axis)
                    .enter()
                    .append("g")
                    .selectAll("rect")
                    .data(function(d) {
                        return d.data;
                    })
                    .enter()
                    .append("rect")
                    .attr("id", "relAxis")
                    .attr("x", function(d) {
                        return d.x0 < d.x1 ? d.x0: d.x1;
                    })
                    .attr("y", function(d) {
                        return d.y;
                    })
                    .attr("width", function(d) {
                        return Math.abs(d.x1 - d.x0);
                    })
                    .attr("height", function(d) {
                        return 10;
                    })
                    .attr("fill", function(d, i) {
                        return color(i);
                    })
                    .on("click", function(d) {
                        funcs.highlightEdges(d.edges, d.time, pipService.emitShowEdge);
                    })

            });
        };
        var drawTriBar = function(g, axisOrder) {
            g.each(function(d, i) {
                var g = d3.select(this);
                var area = d3.svg.area()
                    .x0(function(d) {return d.x0})
                    .x1(function(d) {return d.x1})
                    .y0(function(d) {return d.y0})
                    .y1(function(d) {return d.y1})
                    .interpolate("cardinal");
                g.selectAll("path")
                    .data(function(d) {

                        var triBars = [];
                        for(var i = 0; i < d.length; i++) {
                            triBars.push({
                                x0:d[i][0].x0,
                                x1:d[i][0].x1,
                                y0:d[i][0].y0,
                                y1:d[i][0].y1,
                                m:d[i][0].m0,
                                edges:d[i][0].edges,
                                time:d[i][0].time
                            });
                            triBars.push({
                                x0:d[i][1].x0,
                                x1:d[i][1].x1,
                                y0:d[i][1].y0,
                                y1:d[i][1].y1,
                                m:d[i][1].m1,
                                edges:d[i][1].edges,
                                time:d[i][1].time
                            });
                        }
                        var arcPaths = [];
                        if(triBars.length === 6) {

                            for(var i = 0; i < axisOrder.length; i++) {
                                var temp = [];
                                var metrixAxis = triBars.filter(function(axis) {
                                    var res = false;
                                    if(axis.m === axisOrder[i]) {
                                        res = true;
                                    }
                                    return res;
                                });
                                var bar0 = metrixAxis[0];
                                var bar1 = metrixAxis[1];
                                if(bar0.edges.length === 0) {
                                    continue;
                                }
                                var barLen = Math.sqrt((bar0.x0 - bar0.x1) * (bar0.x0 - bar0.x1) +
                                    (bar0.y0 - bar0.y1) * (bar0.y0 - bar0.y1));

                                var xs = [bar0.x0, bar0.x1, bar1.x0, bar1.x1].sort(function(a,b) {return a > b? 1:a<b?-1:0});
                                var ys = [bar0.y0, bar0.y1, bar1.y0, bar1.y1].sort(function(a,b) {return a > b? 1:a<b?-1:0});

                                var x0, x1, y0, y1;
                                if(bar0.x0 > 0 && bar1.x0 > 0) {
                                    x0 = (ys[2] - ys[1]) / 2 + (xs[2] + xs[1]) / 2;
                                    y0 = (ys[2] + ys[1]) / 2 - (xs[1] - xs[2]) / 2;
                                    x1 = (ys[3] - ys[0]) / 2 + (xs[3] + xs[0]) / 2;
                                    y1 = (ys[3] + ys[0]) / 2 - (xs[0] - xs[3]) / 2;
                                } else if (bar0.x0 < 0 && bar1.x0 < 0) {
                                    x0 = (ys[1] - ys[2]) / 2 + (xs[2] + xs[1]) / 2;
                                    y0 = (ys[1] + ys[2]) / 2 - (xs[1] - xs[2]) / 2;
                                    x1 = (ys[0] - ys[3]) / 2 + (xs[3] + xs[0]) / 2;
                                    y1 = (ys[0] + ys[3]) / 2 - (xs[0] - xs[3]) / 2;
                                } else {
                                    x0 = (bar0.x0 + bar1.x0) / 2;
                                    y0 = (bar0.y0 + bar1.y0) / 2 - Math.abs(bar0.x1 - bar1.x0) / 2;
                                    x1 = (bar0.x1 + bar1.x1) / 2;
                                    y1 = (bar0.y1 + bar1.y1) / 2 - Math.abs(bar0.x1 - bar1.x0) / 2;
                                }

                                temp.push(metrixAxis[0]);
                                temp.push({
                                    x0:x0,
                                    x1:x1,
                                    y0:y0,
                                    y1:y1,
                                    m:metrixAxis[0].m,
                                    edges:metrixAxis[0].edges
                                });
                                temp.push(metrixAxis[1]);
                                arcPaths.push(temp);
                            }
                        }
                        return arcPaths;
                    })
                    .enter()
                    .append("path")
                    .attr("id", "relPath")
                    .attr("d", area)
                    .on("click", function(d) {
                        funcs.highlightEdges(d[0].edges, d[0].time, pipService.emitShowEdge);
//                        funcs.highlight(d[0].edges, d[0].time);
                    })
                    .attr("fill", "#aaa")
                    .attr("opacity", 1);
            });
        };

        funcs.drawCircular = function(g, color, axisOrder, R) {
            var that = this;
            this.color = color;
            this.axisOrder = axisOrder;
            this.R = R;
            g.each(function(d, index) {
                var color = that.color;
                var axisOrder = that.axisOrder;
                var R = that.R;
                var g = d3.select(this);
                var h = 1.732 * R, w = 1.07 * R;
                var tranLen = 0.5 * (R + w) + 10;
                var cirCoor = calFunc.calCircular(d, w, h, tranLen);
                var paraGroups = g.append("g").selectAll("g")
                    .data(cirCoor.biCoor)
                    .enter()
                    .append("g")
                    .attr("transform", function(d) {
                        var metric0 = d.m0;
                        var metric1 = d.m1;
                        var cirPara = calFunc.cirLayoutPara(metric0, metric1, tranLen);
                        return " translate(" + cirPara.tranx + "," + cirPara.trany + ") rotate(" + cirPara.angle + " " + 0 + " " + 0 + ")";
                    })
                    .call(drawBiBar, color);
                var triGroup = g.append("g").selectAll("g")
                    .data(cirCoor.triCoor)
                    .enter()
                    .append("g")
                    .call(drawTriBar, axisOrder);

            });
        };
        /**
         *
         *
         * @param g
         * @param para
         * [width, height, barWidth]
         *
         */
        funcs.drawHistogram = function(g, para) {
            g.each(function(d, i) {
                var g = d3.select(this);
                var layer = byYear(d);
                var layerData = layer.data;
                var types = layer.types;
                var maxValue = d3.max(layerData, function(d) {
                    return d3.sum(d, function(d) {
                        return d.data.length;
                    });
                });
                //var color = d3.scale.ordinal().domain(layer.keys).range(colorbrewer.OrRd[layer.keys.length]);
                var color = d3.scale.ordinal().domain(d3.range(2, layer.keys.length)).range(colorbrewer.OrRd[layer.keys.length > 9 ? 9 : layer.keys.length]);
                var yScale = d3.scale.linear().domain([0, maxValue]).range([0, para[1]]);
                var xScale = d3.scale.ordinal().domain(layer.keys).rangeRoundBands([0, para[0]], 0.1);
                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .tickSize(0)
                    .tickPadding(6)
                    .orient("top");
                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .tickSize(0)
                    .tickPadding(6)
                    .ticks(4)
                    .orient("left");
                g.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + 0 + ")")
                    .call(xAxis);
                g.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(0,0)")
                    .call(yAxis);
                g.append("g")
                    .selectAll("line")
                    .data(yScale.ticks(4))
                    .enter()
                    .append("line")
                    .attr("x1", 0)
                    .attr("x2", para[0])
                    .attr("y1", yScale)
                    .attr("y2", yScale)
                    .style("stroke", "#ccc");
                layerData.forEach(function(d) {
                    var barHeight = d3.sum(d, function(d) {
                        return d.data.length;
                    });
                    barHeight = yScale(barHeight);
                    var pos = 0;
                    d.forEach(function(y) {
                        y.y = pos;
                        y.y0 = pos + yScale(y.data.length);
                        pos = y.y0;
                    })
                });
                var layers = g.append("g")
                    .attr("id", "histoRects")
                    .selectAll("g")
                    .data(layerData)
                    .enter()
                    .append("g");
                var rects = layers.selectAll("rect")
                    .data(function(d) {
                        return d;
                    })
                    .enter()
                    .append("rect")
                    .attr("x", function(d) {
                        return xScale(d.key);
                    })
                    .attr("y", function(d) {
                        return d.y;
                    })
                    .attr("height", function(d) {
                        return d.y0 - d.y;
                    })
                    .attr("width", xScale.rangeBand())
                    .attr("fill", function(d) {
                        return color(d.type);
                    })
                    .on("click", function(d) {
                        funcs.highlightEdges(d.data, d.time, pipService.emitShowEdge);
                    });
                var legends = g.append("g")
                    .selectAll("rect")
                    .data(types)
                    .enter()
                    .append("rect")
                    .attr("x", function(d) {
                        return para[0];
                    })
                    .attr("y", function(d, i) {
                        return i * 15;
                    })
                    .attr("width", 20)
                    .attr("height", 10)
                    .attr("fill", function(d) {
                        return color(d);
                    });
                var legText = g.append("g")
                    .selectAll("text")
                    .data(types)
                    .enter()
                    .append("text")
                    .text(function(d) {
                        return d;
                    })
                    .attr("x", function(d) {
                        return para[0] + 25;
                    })
                    .attr("y", function(d, i) {
                        return i * 15 + 10;
                    })
                    .attr("text-anchor", "start,bottom");

            })
        };
        var byCount = function(histoData, maxValue, yScale) {
            var res = [];
            var types = [];
            for(var i = 0; i < histoData.length; i++) {
                var tmp = {};
                var edges = histoData[i].edges;
                edges.forEach(function(e) {
                    e.time.forEach(function(t) {
                        if(tmp[t] === undefined) {
                            tmp[t] = [e.name];
                        } else {
                            tmp[t].push(e.name);
                        }
                        if(types.indexOf(t) === -1) {
                            types.push(t);
                        }
                    });
                });
                var keys = Object.keys(tmp);
                var distr = keys.map(function(d) {
                    return {
                        type:d,
                        data:tmp[d],
                        key:edges[0].time.length
                    };
                });
                distr.sort(function(a, b) {
                    var cmp = -1;
                    if(a.tLen > b.tLen) {
                        cmp = 1;
                    } else if(a.tLen == b.tLen) {
                        cmp = 0;
                    }
                    return cmp;
                });
                res.push(distr);
            }
            return {
                data:res,
                keys:keys,
                types:types.sort()
            };
        };

        var byYear = function(histoData) {
            var tmp ={};
            var types = [];
            for(var i = 0; i < histoData.length; i++) {
                var edges = histoData[i].edges;
                edges.forEach(function(e) {
                    e.time.forEach(function(t) {
                        if (tmp[t] === undefined) {
                            tmp[t] = {};
                        }
                        if (tmp[t][e.tLen] === undefined) {
                            tmp[t][e.tLen] = [e.name];
                        } else {
                            tmp[t][e.tLen].push(e.name);
                        }
                        if(types.indexOf(e.tLen) === -1) {
                            types.push(e.tLen);
                        }
                    });
                });
            }

            var keys = Object.keys(tmp).sort();
            var res = keys.map(function(d) {
                var lenKeys = Object.keys(tmp[d]);
                var data = lenKeys.map(function(k) {
                    return {
                        type:k,
                        data:tmp[d][k],
                        key:d,
                        time:d
                    }
                });
                data.sort(function(a, b) {
                    var cmp = -1;
                    if(a.tLen > b.tLen) {
                        cmp = 1;
                    } else if(a.tLen == b.tLen) {
                        cmp = 0;
                    }
                    return cmp;
                });
                return data;
            });
            res.sort(function(a, b) {
                var cmp = -1;
                if(a[0].time > b[0].time) {
                    cmp = 1;
                } else if(a[0].time == b[0].time) {
                    cmp = 0;
                }
                return cmp;
            });
            return {
                data:res,
                keys:keys,
                types:types.sort()
            };
        };
//        funcs.spread = function(value, year, nodes, spread) {
//            if(hlghtEdges === undefined) {
//                hlghtEdges = value;
//            } else {
//                var intersect = calFunc.intersect(hlghtEdges, value);
//                if(intersect.length === 0) {
//                    hlghtEdges = value;
//                } else {
//                    value = hlghtEdges = intersect;
//                }
//            }
//
//            if(value.length < 500 && (spread === undefined || spread.length < 500)) {
//                var idxs = {};
//                if(spread === undefined) {
//                    value.forEach(function(e) {
//                        var ns = e.split("_");
//                        idxs[ns[0]] = 1;
//                        idxs[ns[1]] = 1;
//                    });
//                } else {
//                    spread.forEach(function(e) {
//                        var ns = e.edge.split("_");
//                        idxs[ns[0]] = 1;
//                        idxs[ns[1]] = 1;
//                    });
//                }
//
//                idxs = Object.keys(idxs);
//                $http.get("/queryByIdxs", {
//                    params:{
//                        idxs:idxs,
//                        time:year
//                    }
//                }).success(function(d) {
//                    d = d.map(function(e) {
//                        var te = {edge:e};
//                            if(value.indexOf(e) !== -1) {
//                                te.select = true;
//                            } else {
//                                te.select = false;
//                            }
//                        return te;
//                    });
//                    if(spread !== undefined && spread.length === d.length) {
//                        funcs.highlight(value, spread, year, undefined, nodes);
//                    } else {
//                        funcs.spread(value, year, nodes, d);
//                    }
////                    funcs.highlight(value, d, year, undefined, nodes);
//
//                });
//            } else {
//                if(spread === undefined) {
//                    spread = value.map(function(e) {
//                        return {
//                            edge:e,
//                            select:true
//                        }
//                    })
//                }
//                funcs.highlight(value, spread, year, undefined, nodes);
//            }
//
//
//        };


        var hlghtEdges = undefined;
        var hlghtNodes = undefined;
        funcs.highlightEdges = function(edges, time, callback) {
            if(hlghtEdges === undefined) {
                hlghtEdges = edges;
            } else {
                var intersect = calFunc.intersect(hlghtEdges, edges);
                if(intersect.length === 0) {
                    hlghtEdges = edges;
                } else {
                    edges = hlghtEdges = intersect;
                }
            }

            var nodes = [];
            var dic = {};
            edges.forEach(function(e) {
                var tns = e.split("_");
                tns.forEach(function(n) {
                    if(dic[n] === undefined) {
                        nodes.push(Number(n));
                        dic[n] = 0;
                    }
                })
            });
            hlghtNodes = nodes;
            hlghtFlow(nodes);
            hlghtCircular(edges);
            hlghtHisto(edges);
            hlghtScatter(edges);
            hlghtDegree(edges);
            if(callback !== undefined) {
                callback([time, edges]);
            }



        };
        funcs.highlightNodes = function(nodes, time, compID) {
            var intersect;
            if(hlghtNodes === undefined) {
                hlghtNodes = nodes;
            } else {
                intersect = calFunc.intersect(hlghtNodes, nodes);
                if(intersect.length === 0) {
                    hlghtNodes = nodes;
                } else {
                    nodes = hlghtNodes = intersect;
                }
            }
            $http.get("/queryByIdxs", {
                params:{
                    idxs:nodes,
                    time:time,
                    compID:compID
                }
            }).success(function(edges) {
                //callback(d, time, nodes);
                if(hlghtEdges === undefined) {
                    hlghtCircular(edges);
                    hlghtHisto(edges);
                    hlghtScatter(edges);
                    hlghtDegree(edges);
                    hlghtFlow(nodes);

                } else if (intersect.length === 0){
                    funcs.highlightEdges(edges, time);
                } else {
                    var edgeInter = calFunc.intersect(hlghtEdges, edges);
                    if(edgeInter.length !== 0) {
                        funcs.highlightEdges(edges, time);
                        pipService.emitShowNode([time, nodes, edges]);
                    } else {
                        //edges--->select one node--->draw two nodes ego network
                        var egoNodes = [];
                        var dic = {};
                        for(var i = 0; i < hlghtEdges.length; i++) {
                            var tmp = hlghtEdges[i].split("_").map(function(d) {return Number(d)});
                            var res = tmp.filter(function(n) {
                                var filtered = nodes.filter(function(d) {
                                    if(d === n) {
                                        return true;
                                    } else {
                                        return false;
                                    }

                                });
                                if(filtered.length !== 0) {
                                    return true;
                                } else {
                                    return false;
                                }

                            });
                            if(res.length !== 0) {
                                tmp.forEach(function(n) {
                                    if(dic[n] === undefined) {
                                        egoNodes.push(n);
                                        dic[n] = 0;
                                    }
                                })
                            }
                        }
                        nodes = egoNodes;
                        $http.get("/queryByIdxs", {
                            params:{
                                idxs:nodes,
                                time:time
                            }
                        }).success(function(edges) {
                            pipService.emitShowNode([time, nodes, edges]);
                        });
                    }
                }

            })

        };
        funcs.highlight = function(value, spread, year, edges, nodes) {
            if(hlghtEdges === undefined) {
                hlghtEdges = value;
            } else {
                var intersect = calFunc.intersect(hlghtEdges, value);
                if(intersect.length === 0) {
                    hlghtEdges = value;
                } else {
                    value = hlghtEdges = intersect;
                }
            }

            hlghtHisto(value);
            hlghtCircular(value);
            hlghtDegree(value);
            hlghtScatter(value);
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
            if(nodes === undefined) {
//                nodes = idx.map(function(d) {
//                    return Number(d);
//                });
                nodes = [];
                value.forEach(function(e) {
                    var ns = e.split("_");
                    nodes.push(Number(ns[0]));
                    nodes.push(Number(ns[1]));
                })
            }
            if(hlghtNodes === undefined) {
                hlghtNodes = nodes;
            } else {
                var intersect = calFunc.intersect(hlghtNodes, nodes);
                if(intersect.length === 0) {
                    hlghtNodes = nodes;
                } else {
                    nodes = hlghtNodes = intersect;
                }
            }
            hlghtFlow(nodes);
            if(year !== undefined && edges === undefined) {
                $http.get("/names", {
                    params:{
                        idx:idx
                    }
                }).success(function(d) {
                    var dic = {};
                    d.forEach(function(n) {
                        dic[n.idx] = n.name;
                    });
                    var edges = spread.map(function(e) {
                        var ns = e.edge.split("_");
                        return {
                            edge:[dic[ns[0]],dic[ns[1]]].sort().toString(),
                            select: e.select
                        };
                    });
                    pipService.emitYearChange([year, edges]);
                });
            } else if(year === undefined && edges !== undefined) {
                pipService.emitYearChange([year, edges]);
            }
        };
        var hlghtHisto = function(edges) {
            var rects = d3.select("#histoRects");
            rects.selectAll("g").selectAll("rect")
                .data(function(d) {
                    return d;
                })
                .attr("opacity", function(d) {
                    var res = 0.4;
                    if(calFunc.intersect(d.data, edges).length !== 0) {
                        res = 1;
                    }
                    return res;
                })
        };
        var hlghtCircular = function(edges) {
            var cir = d3.select("#parSet");
            //axis
            var bars = cir.selectAll("#relBar")
                .attr("opacity", function(d) {
                    var res = 0.4;
                    if(calFunc.intersect(d[0].edges, edges).length !== 0) {
                        res = 1;
                    }
                    return res;
                });
            var axis = cir.selectAll("#relAxis")
                .attr("opacity", function(d) {
                    var res = 0.4;
                    if(calFunc.intersect(d.edges, edges).length !== 0) {
                        res = 1;
                    }
                    return res;
                });
            var paths = cir.selectAll("#relPath")
                .attr("opacity", function(d) {
                    var res = 0.4;
                    if(calFunc.intersect(d[0].edges, edges).length !== 0) {
                        res = 1;
                    }
                    return res;
                });

        };
        var hlghtScatter = function(edges) {
            var g = d3.select("#group_degree");
            var plots = g.selectAll("#scatterPlot");
            var scatterGroups = plots.selectAll("#scatterGroup");
            var circles = scatterGroups.selectAll("circle")
                .attr("opacity", function(d) {
                    var edgesData = d.edges;
                    var keys = Object.keys(edgesData);
                    var edgeSet = [];
                    var res = 0.5;
                    for(var i = 0; i < keys.length; i++) {
                        edgeSet = edgeSet.concat(edgesData[keys[i]]);
                    }
                    if(calFunc.intersect(edgeSet, edges).length !== 0) {
                        res = 1.0;
                    }
                    return res;

                })
                .attr("r", function(d) {
                    var edgesData = d.edges;
                    var keys = Object.keys(edgesData);
                    var edgeSet = [];
                    var res = 2;
                    for(var i = 0; i < keys.length; i++) {
                        edgeSet = edgeSet.concat(edgesData[keys[i]]);
                    }
                    if(calFunc.intersect(edgeSet, edges).length !== 0) {
                        res = 4;
                    }
                    return res;
                });
        };
        var hlghtDegree = function(edges) {
            var degree = d3.select("#group_degree");
            var lineGroups = degree.selectAll("#lineGroups");
            var rects = lineGroups.selectAll("rect")
                .attr("opacity", function(d) {
                    var res = 0.5;
                    if(calFunc.intersect(d.edges, edges).length !== 0) {
                        res = 1.0;
                    }
                    return res;
                });

        };
        var hlghtFlow = function(nodes) {
            var flowGroup = d3.select("#group_global");
            var barGroups = flowGroup.selectAll("#flowBarGroup");
            var compBarGroups = barGroups.selectAll("#compBarGroup");
            var rects = compBarGroups.selectAll("rect")
                .attr("opacity", function(d) {
                    var res = 0.4;
                    if(calFunc.intersect(d.nodes, nodes).length !== 0) {
                        res = 1;
                    }
                    return res;
                });
            var flowStreamGroups = flowGroup.selectAll("#flowStreamGroup");
            var intervalGroups = flowStreamGroups.selectAll("#intervalGroup");
            var compStreamGroups = intervalGroups.selectAll("#compStreamGroup");
            compStreamGroups.selectAll("path")
                .attr("opacity", function(d) {
                    var res = 0;
                    if(calFunc.intersect(d.nodes, nodes).length !== 0) {
                        res = 1;
                    }
                    return res;
                })
                .attr("fill", function(d) {
                    var res = "#aaa";
                    if(calFunc.intersect(d.nodes, nodes).length !== 0) {
                        res = "#555";
                    }
                    return res;
                });

        };
        var queryEdges = function(nodes, time, compID, callback) {
            if(hlghtNodes === undefined) {
                hlghtNodes = nodes;
            } else {
                var intersect = calFunc.intersect(hlghtNodes, nodes);
                if(intersect.length === 0) {
                    hlghtNodes = nodes;
                } else {
                    nodes = hlghtNodes = intersect;
                }
            }
            $http.get("/queryByIdxs", {
                params:{
                    idxs:nodes,
                    time:time,
                    compID:compID
                }
            }).success(function(d) {
                callback(d, time, nodes);
            })

        };
        return funcs;
        //});
    }]);

})();