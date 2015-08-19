/**
 * Created by Fangzhou on 2015/1/28.
 */
(function () {
    var app = angular.module('calFuncModule', ['d3Module','configModule']);
    app.factory('calFuncs', ['d3', "config", function (d3, config) {
        var genKey = function (a, b) {
            if(config.direct) {
                return a + "_" + b;
            } else {
                return a < b ? a + "_" + b : b + "_" + a;
            }

        };
        var years;
        var timescale = function (y) {
            var res;
            if (y != undefined) {
                years = y;
                res = this;
            } else {
                res = years;
            }
            return res;
        };
        var calFlow = function(compData, flowPara) {
            var data = {};
            var barPadding = 5;
            var flowMargin = 20;
            var flowBarWidth = 50;
            var counts = compData.map(function(d) {
                var count = 0;
                d.data.forEach(function(comp) {
                    var keys = Object.keys(comp.compData);
                    keys.forEach(function(level) {
                        count += comp.compData[level].length;
                    });
                });
                return {count:count, compNum: d.data.length, time: d.time};
            });
            counts.sort(function(a, b) {
                var res = 0;
                if(a.count > b.count) {
                    res = -1;
                } else if(a.count < b.count) {
                    res = 1;
                } else if(a.compNum > b.compNum) {
                    res = -1;
                } else if(a.compNum < b.compNum) {
                    res = 1;
                }
                return res;
            });
            var maxHeight = flowPara[3] - (counts[0].compNum - 1) * barPadding;
            var avgWidth = flowPara[2] / (compData.length * 1.1 + 0.1);
            var scaleX = d3.scale.linear().domain([0, compData.length - 1]).range([avgWidth * 0.6, flowPara[2] - avgWidth * 0.6]);
            var scaleY = d3.scale.linear().domain([0, counts[0].count]).range([0,maxHeight]);
            data.bars = compData.map(function(d, index) {
                var time = d.time;


                var bars = d.data.map(function(comp) {
                    var keys = Object.keys(comp.compData);
                    var subBars = keys.map(function(level) {
                        var nodes = comp.compData[level];
                        var height = scaleY(nodes.length);
                        return {
                            height : height,
                            width : flowBarWidth,
                            level:level,
                            x:scaleX(index) - flowBarWidth / 2,
                            compID:comp.compID,
                            time:time,
                            nodes : nodes
                        }
                    });
                    subBars = subBars.sort(function(a, b) {
                        var res = 0;
                        if(a.level < b.level) {
                            res = 1;
                        } else if (a.level > b.level) {
                            res = -1
                        }
                    })
                    return subBars;

                });
                var pos = flowMargin;
                for(var i = 0; i < bars.length; i++) {
                    for(var j = 0; j < bars[i].length; j++) {
                        bars[i][j].y = pos;
                        bars[i][j].flowStartPosRight = pos;
                        bars[i][j].flowStartPosLeft = pos;
                        pos += bars[i][j].height;
                    }
                    pos += barPadding;
                }

                return {data:bars, time:time};

            });
            data.bars.sort(function(a,b) {
                var res = 0;
                if(a.time < b.time) {
                    res = -1;
                } else if (a.time > b.time) {
                    res = 1;
                }
                return res;
            });
            data.stream = [];

            for(var i = 1; i < data.bars.length; i++) {
                var comp0 = data.bars[i - 1].data;
                var comp1 = data.bars[i].data;
                var interData = {
                    t0:compData[i - 1].time,
                    t1:compData[i].time,
                    data:[]
                };
                comp0.forEach(function(d0) {
                    var compInter = d0.map(function(bar0) {
                        var level0 = bar0.level;
                        var inter = [];
                        comp1.forEach(function(d1) {
                            d1.forEach(function(bar1) {
                                var tmp = intersect(bar0.nodes, bar1.nodes);
                                if(tmp.length !== 0) {
                                    var height = tmp.length / bar0.nodes.length * bar0.height;
                                    inter.push({
                                        sx: bar0.x + flowBarWidth,
                                        sy0: bar0.flowStartPosRight,
                                        sy1: bar0.flowStartPosRight + height,
                                        ex: bar1.x,
                                        ey0: bar1.flowStartPosLeft,
                                        ey1: bar1.flowStartPosLeft + height,
                                        nodes: tmp,
                                        level0: Number(level0),
                                        level1: Number(bar1.level),
                                        compID:bar0.compID,
                                        time:bar0.time
                                    });
                                    bar0.flowStartPosRight += height;
                                    bar1.flowStartPosLeft += height;
                                }
                            });
                        });
                        return inter;
                    });
                    if(compInter.length !== 0) {
                        interData.data.push(compInter);
                    }
                });
                data.stream.push(interData);
            }
            return data;
        };
        var calDegree = function (impact, degree, timescale) {
            var dic = {};
            for (var type = 0, len = impact.length; type < len; type++) {
                for (var level = 0, lCount = impact[type].stream.length; level < lCount; level++) {
                    for (var index = 0, indexCount = impact[type].stream[level].d.length; index < indexCount; index++) {
                        var data = impact[type].stream[level].d[index]["edges"];
                        for (var i = 0, edgeCount = data.length; i < edgeCount; i++) {
                            var edge = data[i];
                            if (edge in dic) {
                                if (dic[edge][index] === undefined) {
                                    dic[edge][index] = [];
                                }
                            } else {
                                dic[edge] = {};
                                dic[edge][index] = [];
                            }
                            dic[edge][index][type] = impact[type].stream[level].level;
                        }
                    }
                }
            }
            var res = [];
            for (var i = 0; i < timescale.length; i++) {
                var data = degree[timescale[i]];
                var keys = Object.keys(data);

                var sum = 0;
                for (var j = 0; j < keys.length; j++) {
                    var edges = data[keys[j]].edge;
                    data[keys[j]].distr = {};
                    data[keys[j]].inEdges = {};
                    for (var k = 0; k < edges.length; k++) {
                        var edgeKey = genKey(edges[k][0], edges[k][1]);
                        if (dic[edgeKey] === undefined) {
                            continue;
                        }
                        //impEdge, impNode, impPair;
                        var impacts = dic[edgeKey][i];
                        if (impacts === undefined) {
                            continue;
                        }
                        var impKey = impacts.slice(0, 3).join("_");
                        //console.log(impKey);
                        if (data[keys[j]].distr[impKey] === undefined) {
                            data[keys[j]].distr[impKey] = 1;
                            data[keys[j]].inEdges[impKey] = [edgeKey];
                            sum += 1;
                        } else {
                            data[keys[j]].distr[impKey] += 1;
                            data[keys[j]].inEdges[impKey].push(edgeKey);
                            sum += 1;
                        }
                    }

                }
                var temp = {};
                for (var j = 0; j < keys.length; j++) {
                    if (Object.keys(data[keys[j]].distr).length != 0) {
                        temp[keys[j]] = {};
                        temp[keys[j]].edges = data[keys[j]].inEdges;
                        temp[keys[j]].count = 0;
                        Object.keys(data[keys[j]].inEdges).forEach(function(d) {
                            temp[keys[j]].count += data[keys[j]].inEdges[d].length;
                        });
                        temp[keys[j]].distr = data[keys[j]].distr;
                    }
                }
                res.push({
                    data: temp,
                    time: timescale[i]
                });
            }

            return res;
        };
        var intersect = function (a, b) {
            var t;
            if (b.length > a.length) t = b, b = a, a = t;
            return unique(a.filter(function (e) {
                if (b.indexOf(e) !== -1) return true;
            }));
        };
        var unique = function(a) {
            var res = [];
            var json = {};
            for(var i = 0; i < a.length; i++){
                if(!json[a[i]]){
                    res.push(a[i]);
                    json[a[i]] = 1;
                }
            }
            return res;
        };
        var calSetRelation = function (flowData, axisOrder, timescale, highlight) {
            var setData = [];
            var setCount = timescale.length;
            var flowOrder = [];
            for (var i = 0, len = flowData.length; i < len; i++) {
                flowOrder.push(flowData[i].type);
            }
            for (var time = 0; time < setCount; time++) {
                var setTime = {
                    index : time,
                    biData : [],
                    triData : [],
                    time :timescale[time]
                };
                for (var i = 0; i < axisOrder.length; i++) {
                    for (var j = i + 1; j < axisOrder.length; j++) {
                        var fIndex0 = flowOrder.indexOf(axisOrder[i]);
                        var fIndex1 = flowOrder.indexOf(axisOrder[j]);
                        var set = {
                            m0: axisOrder[i],
                            m1: axisOrder[j],
                            data: []
                        };
                        for (var m0level = 0, len0 = flowData[fIndex0].stream.length; m0level < len0; m0level++) {
                            for (var m1level = 0, len1 = flowData[fIndex1].stream.length; m1level < len1; m1level++) {
                                var tmp = {
                                    l0: m0level,
                                    l1: m1level
                                };
                                tmp.intersect = intersect(flowData[fIndex0].stream[m0level].d[time].edges, flowData[fIndex1].stream[m1level].d[time].edges);
                                set.data.push(tmp);
                            }
                        }
                        setTime.biData.push(set);
                    }
                }
                for (var i = 0; i < highlight.length; i++) {
                    tmp = {};
                    tmp.nBetL = highlight[i].nBetL;
                    tmp.eBetL = highlight[i].eBetL;
                    tmp.pairL = highlight[i].pairL;
                    var index0 = flowOrder.indexOf(axisOrder[0]);
                    var index1 = flowOrder.indexOf(axisOrder[1]);
                    var index2 = flowOrder.indexOf(axisOrder[2]);
                    var inter0 = intersect(flowData[index0].stream[tmp.nBetL].d[time].edges, flowData[index1].stream[tmp.eBetL].d[time].edges);
                    var inter1 = intersect(flowData[index1].stream[tmp.eBetL].d[time].edges, flowData[index2].stream[tmp.pairL].d[time].edges);
                    tmp.intersect = intersect(inter0, inter1);
                    tmp.time = setTime.time;
                    setTime.triData.push(tmp);
                }
                setData.push(setTime);
            }
            return setData;
        };
        var calBiCoor = function(biData, w, h, year, axisHeight) {
            var lowestEdges = intersect(biData[0].data[0].intersect, biData[1].data[0].intersect);
            var biCoor = biData.map(function(d) {
                var levels = [];
                var sum = 0;
                var levelSum = [[],[]];
                for(var i = 0, len = d.data.length; i < len; i++) {
                    if(levels.indexOf(d.data[i].l0) === -1) {
                        levels.push(d.data[i].l0);
                    }
                    if(levels.indexOf(d.data[i].l1) === -1) {
                        levels.push(d.data[i].l1);
                    }
                    if(levelSum[0][d.data[i].l0] === undefined) {
                        levelSum[0][d.data[i].l0] = [];
                    }

                    levelSum[0][d.data[i].l0] = levelSum[0][d.data[i].l0].concat(d.data[i].intersect);

                    if(levelSum[1][d.data[i].l1] === undefined) {
                        levelSum[1][d.data[i].l1] = [];
                    }
                    levelSum[1][d.data[i].l1] = levelSum[1][d.data[i].l1].concat(d.data[i].intersect);
                    var incre = d.data[i].intersect.length;
                    if(d.data[i].l0 === 0 && d.data[i].l1 === 0 && lowestEdges.length > 10) {
                        incre = incre - lowestEdges.length + 10;
                    }
                    sum += incre;
                }
                var shapes = {
                    data:[],
                    m0: d.m0,
                    m1: d.m1
                };
                var xl, xr, yt = -h * 0.5, yb = h * 0.5;
                var metric0 = d.m0;
                var metric1 = d.m1;
                var flag;
                if(metric0 === "kendall" || metric1 === "kendall") {
                    if(metric0 === "pair" || metric1 === "pair") {
                        xl = -0.5 * w;
                        xr = 0.5 * w;
                    } else {
                        xl = 0.5 * w;
                        xr = -0.5 * w;
                    }
                } else {
                    xl = 0.5 * w;
                    xr = -0.5 * w;
                }
                var xScale = d3.scale.linear().domain([0, sum]).range([0, xr - xl]);
                var pos = [xl, xl];
                var segs = [[],[]];
                var axis = [{
                    metric:metric0,
                    data:[]
                },{
                    matric:metric1,
                    data:[]
                }];
                for(var i = 0; i < 2; i++) {
                    for(var j = 0; j < levelSum[i].length; j++) {
                        segs[i].push(pos[i]);
                        var incre = levelSum[i][j].length;
                        if(j === 0 && lowestEdges.length > 10) {
                            incre = incre - lowestEdges.length + 10;
                        }
                        axis[i].data.push({
                            x0:pos[i],
                            x1:pos[i] + xScale(incre),
                            y:i==0?yt:yb - axisHeight,
                            edges:levelSum[i][j],
                            time:year
                        });
                        pos[i] += xScale(incre);
                    }
                }
                for(var i = 0, len = d.data.length; i < len; i++) {
                    var count = d.data[i].intersect.length;
                    var l0 = d.data[i].l0;
                    var l1 = d.data[i].l1;
                    if(l0 === 0 && l1 === 0 && lowestEdges.length > 10) {
                        count = count - lowestEdges.length + 10;
                    }
                    var segLen = xScale(count);
                    var x10, x11;
                    shapes.data.push([{
                        x0:segs[0][l0],
                        x1:segs[0][l0] + segLen,
                        y:yt + axisHeight,
                        l:l0,
                        edges: d.data[i].intersect,
                        triPos:segs[0][l0] + segLen,
                        time:year
                    },{
                        x0:segs[1][l1],
                        x1:segs[1][l1] + segLen,
                        y:yb - axisHeight ,
                        l:l1,
                        edges: d.data[i].intersect,
                        triPos:segs[1][l1] + segLen,
                        time:year
                    }]);
                    segs[0][l0] += segLen;
                    segs[1][l1] += segLen;
                }
                shapes.axis = axis;
                return shapes;
            });
            return biCoor;
        };
        var cirLayoutPara = function(m0, m1, tranLen) {

            //      nBet
            //   pair  eBet
            var res = {};
            if(m0 === "kendall" || m1 === "kendall") {
                if(m0 === "pair" || m1 === "pair") {
                    //nBet, pair
                    res.angle = 30;
                    res.tranx = -0.866 * tranLen;
                    res.trany = -0.5 * tranLen
                } else {
                    //nBet, eBet
                    res.angle = -30;
                    res.tranx = 0.866 * tranLen;
                    res.trany = -0.5 * tranLen;
                }
            } else {
                //eBet, pair
                res.angle = 90;
                res.tranx = 0;
                res.trany = tranLen;
            }
            return res;
        };
        var calTriCoor = function(triData, biCoor, w, h, tranLen) {
            var triCoor = triData.map(function(d) {
                var levels = [d.nBetL, d.eBetL, d.pairL];
                var metrics = ["kendall", "ebet", "pair"];
                var triShape = [];
                for(var i = 0; i < levels.length; i++) {
                    for(var j = i + 1; j < levels.length; j++) {
                        var shapes = biCoor.filter(function(biData) {
                            var res = false;
                            if(biData.m0 === metrics[i] && biData.m1 === metrics[j]) {
                                res = true;
                            } else if(biData.m0 === metrics[j] && biData.m1 === metrics[i]) {
                                res = true;
                            }
                            return res;
                        });
                        var m0 = shapes[0].m0;
                        var m1 = shapes[0].m1;
                        var shape = shapes[0].data.filter(function(s) {
                            var res = false;
                            if(m0 === metrics[i] && m1 === metrics[j]) {
                                if(s[0].l === levels[i] && s[1].l === levels[j]) {
                                    res = true;
                                }
                            } else if(m0 === metrics[j] && m1 === metrics[i]) {
                                if(s[0].l === levels[j] && s[1].l === levels[i]) {
                                    res = true;
                                }
                            }
                            return res;
                        })[0];
                        if(shape[0].edges !== undefined && shape[0].edges.length !== 0) {
                            triShape.push(shape.map(function(p) {
                                var width = (d.intersect.length / p.edges.length) * (p.x1 - p.x0);
                                p.triPos -= width;
                                var x0 = p.triPos + width;
                                var x1 = p.triPos;
                                var y = p.y > 0 ? p.y + 10 : p.y - 10;
                                var para = cirLayoutPara(m0, m1, tranLen);

                                var angle = para.angle * Math.PI / 180;
                                var tx0 = Math.cos(angle) * x0 - Math.sin(angle) * y;
                                var tx1 = Math.cos(angle) * x1 - Math.sin(angle) * y;
                                var ty0 = Math.sin(angle) * x0 + Math.cos(angle) * y;
                                var ty1 = Math.sin(angle) * x1 + Math.cos(angle) * y;
                                tx0 += para.tranx;
                                tx1 += para.tranx;
                                ty0 += para.trany;
                                ty1 += para.trany;
                                return {
                                    x0 : tx0,
                                    x1 : tx1,
                                    m0 : m0,
                                    m1 : m1,
                                    y0 : ty0,
                                    y1 : ty1,
                                    edges: d.intersect,
                                    time: p.time,
                                    l: p.l
                                }
                            }));
                        }
                    }
                }
                return triShape;
            });
            return triCoor.filter(function(d) {
                if(d.length === 3) {
                    return true;
                } else {
                    return false;
                }
            });
        };
        var calCircular = function(data, w, h, tranLen) {
            var res = [];
            var biData = data.biData;
            var triData = data.triData;
            var biCoor = calBiCoor(biData, w, h, data.time, 10);
            var triCoor = calTriCoor(triData, biCoor, w, h, tranLen);
            return {
                biCoor:biCoor,
                triCoor:triCoor
            };
        };
        var calHistogram = function (multiEdges, timePoints, step) {
            var res = [];
            var dic = {};
            traverse(multiEdges, dic);
            var keys = Object.keys(dic);
            for (var i = 0; i < timePoints.length - 1; i++) {
                res.push({
                    count: 0,
                    edges: []
                });
            }
            for (var i = 0, len = keys.length; i < len; i++) {
                var level = dic[keys[i]].length - 2;
                res[level].count += 1;
                res[level].edges.push({
                    name: keys[i],
                    time: dic[keys[i]],
                    tLen:level + 2
                })
            }
            return res;

        };
        var traverse = function (obj, dic) {
            var keys = Object.keys(obj);
            for (var i = 0; i < keys.length; i++) {
                var edges = obj[keys[i]].names;
                for (var j = 0; j < edges.length; j++) {
                    if (dic[edges[j]] === undefined) {
                        dic[edges[j]] = [];
                    }
                    dic[edges[j]].push(keys[i].split("_")[0]);
                }
                traverse(obj[keys[i]].child, dic);
            }
        };
        var edgeDataAll;
        var nodeDataImp;
        var findEdgeLevel = function(edge) {
            return [edgeDataAll[0][edge], edgeDataAll[1][edge],edgeDataAll[2][edge]];
        };
        var segData = function (flowdata, seg) {
            var res = [];
            edgeDataAll = [];
            nodeDataImp = {};
            for (var i = 0; i < flowdata.length; i++) {
                var temp = {};
                temp["type"] = flowdata[i].type;
                var flow = flowdata[i];
                var years = Object.keys(flow.stream).sort();
                timescale(years);
                //seg stream
                var stream = {};
                var edgeData = {};
                for (var y = 0; y < years.length; y++) {
                    var data = flow.stream[years[y]];
                    var values = Object.keys(data);
                    for (var v = 0; v < values.length; v++) {
                        var value = values[v];
                        for (var j = 0; j < data[value].length; j++) {
                            var nodes = data[value][j].edge.split("_");
                            if(nodes[0] === nodes[1]) {
                                continue;
                            }
                            var impactLevel = value;
                            var level = seg(flow.type, impactLevel);
                            if (stream[level] === undefined) {
                                stream[level] = [];
                                for (var ty = 0; ty < years.length; ty++) {
                                    stream[level].push({
                                        time: years[ty],
                                        edges: []
                                    })
                                }
                            }
                            stream[level][y].edges.push(data[value][j].edge);
                            if (edgeData[data[value][j].edge] === undefined) {
                                edgeData[data[value][j].edge] = [];
                            }
                            edgeData[data[value][j].edge].push(years[y] + "_" + level);

                            if(nodeDataImp[nodes[0]] === undefined) {
                                nodeDataImp[nodes[0]] = {};
                            }
                            if(nodeDataImp[nodes[0]][years[y]] === undefined) {
                                nodeDataImp[nodes[0]][years[y]] = {};
                            }
                            if(nodeDataImp[nodes[0]][years[y]][nodes[1]] === undefined || nodeDataImp[nodes[0]][years[y]][nodes[1]] < level) {
                                nodeDataImp[nodes[0]][years[y]][nodes[1]] = level;
                            }
                            if(nodeDataImp[nodes[1]] === undefined) {
                                nodeDataImp[nodes[1]] = {};
                            }
                            if(nodeDataImp[nodes[1]][years[y]] === undefined) {
                                nodeDataImp[nodes[1]][years[y]] = {};
                            }
                            if(nodeDataImp[nodes[1]][years[y]][nodes[0]] === undefined || nodeDataImp[nodes[1]][years[y]][nodes[0]] < level) {
                                nodeDataImp[nodes[1]][years[y]][nodes[0]] = level;
                            }

                        }
                    }
                }
                var streamArray = [];
                var levels = Object.keys(stream);
                for (var j = 0; j < levels.length; j++) {
                    streamArray.push({
                        d: stream[levels[j]],
                        level: levels[j]
                    })
                }
                temp["stream"] = streamArray;

                //filter edgeData
                var filtered = {};
                var edges = Object.keys(edgeData);
                for (var e = 0; e < edges.length; e++) {
                    if (edgeData[edges[e]].length > 1) {
                        filtered[edges[e]] = edgeData[edges[e]];
                    }
                }
                var forest = node();
                var keys = Object.keys(filtered);
                for (var j = 0; j < keys.length; j++) {
                    var root = forest;
                    var name = keys[j];
                    var value = filtered[keys[j]];
                    if (value.length < 2) {
                        continue;
                    }
                    for (var v = 0; v < value.length; v++) {
                        addChild(root, value[v], name);
                        root = root["child"][value[v]];
                    }
                }
                temp["multiEdges"] = forest["child"];
                edgeDataAll.push(edgeData);
                res.push(temp);
            }
            return res;
        };
        var node = function (nodeName) {
            return {"child": {}, "count": 1, "names": [nodeName]};
        };
        var addChild = function (prtNode, key, nodeName) {
            if (!(key in prtNode["child"])) {
                prtNode["child"][key] = node(nodeName);
            } else {
                prtNode["child"][key]["count"] += 1;
                prtNode["child"][key]["names"].push(nodeName);
            }
        };

        var calCompData = function(comp, segment) {
            var data = [];
            var component = comp.comp;
            var intersect = comp.inter;
            var times = Object.keys(component);

            for(var i = 0; i < times.length; i++) {
                var frame = [];
                for(var sub = 0; sub < component[times[i]].length; sub++) {
                    var nodes = component[times[i]][sub].nodes;
                    var subComp = {};
                    nodes.forEach(function(n) {
                        var occurrence = nodeDataImp[n];
                        if(occurrence === undefined) {
                            console.log(occurrence);
                        }
                        var level = segment(occurrence[times[i]]);
                        if(subComp[level] === undefined) {
                            subComp[level] = [];
                        }
                        subComp[level].push(n);
                    });
                    frame.push({
                        compID:component[times[i]][sub].compID,
                        compData:subComp
                    })
                }
                data.push({
                    data:frame,
                    time:times[i]
                })
            }
            return data;

        };
        return {
            calDegree: calDegree,
            calSetRelation: calSetRelation,
            calHistogram: calHistogram,
            segData: segData,
            timescale: timescale,
            calCircular:calCircular,
            cirLayoutPara:cirLayoutPara,
            findEdgeLevel : findEdgeLevel,
            intersect:intersect,
            calCompData : calCompData,
            calFlow : calFlow,
            findEdgeLevel:findEdgeLevel
        };
    }]);
})();
