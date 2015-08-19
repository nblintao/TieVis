var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

router.get('egoComp', function(req,res) {
    res.render('egoComp', {title : 'Egonetwork Comparison'});
});

router.get('/graph', function(req, res) {
    mongoose.connection.db.collection("edgeSet", function (err, collection) {
        collection.find({}).toArray(function(error, document) {
            res.json(document);
        });
    });
});
router.get('/nodelist', function(req, res) {
    mongoose.connection.db.collection("vis.graph.allNodes", function(err, collection) {
        collection.find({}).toArray(function(error, document) {
            res.json(document["data"]);
        });
    });
});
var fs = require("fs");
router.get('/matrix', function(req, res) {
    var year = req.query.year;
    try {
        fs.readFile("./etc/graph_json/" + year + "_0.json",{encoding:"utf8"},function(err, data) {
            eval("d = " + data);
            res.json(d);
        });
    } catch(err) {
        console.log(err);
    }
});
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/test';
// Use connect method to connect to the Server

router.get('/names', function(req, res) {
    var idx = req.query.idx.map(function(d) {
        return Number(d);
    });
    MongoClient.connect(url, function(err, db) {
        var nodes = db.collection('vis.graph.nodeList');
        nodes.find({idx:{"$in":idx}}).toArray(function(err, nodeDoc) {
            console.log(nodeDoc);
            db.close();
            res.json(nodeDoc);
        });

    });
    //console.log(idx);
//    mongoose.connection.db.collection("vis.graph.nodeList", function (err, nodes) {
//        nodes.find({idx:{"$in":idx}}).toArray(function(err, nodeDoc) {
//            console.log(nodeDoc);
//            res.json(nodeDoc);
//        })
//    })

});


router.get('/queryByIdxs', function(req, res) {
    var input = [];
    if(typeof (req.query.idxs) === "string") {
        input.push(Number(req.query.idxs));
    } else if(typeof (req.query.idxs) === "object") {
        input = req.query.idxs.map(function(i){
            return Number(i);
        });
    }
    var time = req.query.time;
    var compID = Number(req.query.compID);
    if(time.indexOf(",") === -1) {
        time = Number(time);
    }
    var direct = req.query.direct;
    //console.log(input);
    //console.log(time);
    //console.log(isNaN(compID));
    if(!isNaN(compID) && compID !== undefined) {
        mongoose.connection.db.collection("vis.digraph.component", function(err, comp) {
            comp.find({time:time, compID:compID}, {edges:1, _id:0}).toArray(function(err, edgeDoc) {
                var edges = edgeDoc[0].edges.filter(function(e) {
                    var isIn = false;
                    if(input.indexOf(e[0]) >= 0 || input.indexOf(e[1]) >= 0) {
                        isIn = true;
                    }
                    return isIn;
                }).map(function(e) {
                    return e.sort(function(a, b) {
                        var res = 0;
                        if(Number(a) < Number(b)) {
                            res = -1
                        } else if(Number(a) > Number(b)) {
                            res = 1;
                        }
                        return res;
                    }).join("_");
                });
                res.json(edges);
            });
        });
    } else {
        mongoose.connection.db.collection("vis.digraph.component", function(err, edges) {
            edges.find({time:time}).toArray(function(err, edgeDoc) {
                var edgeSet = [];

                edgeDoc.forEach(function(comp) {
                    var tmp = comp.edges.filter(function(e) {
                        //console.log(e);
                        var isIn = false;
                        if(input.indexOf(e[0]) >= 0 || input.indexOf(e[1]) >= 0) {
                            isIn = true;
                        }
                        return isIn;
                    }).map(function(e) {
                        if(!direct){
                            e = e.sort(function(a, b) {
                                var res = 0;
                                if (Number(a) < Number(b)) {
                                    res = -1
                                } else if (Number(a) > Number(b)) {
                                    res = 1;
                                }
                                return res;
                            });
                        }
                        return e.join("_");
                    });
                    edgeSet = edgeSet.concat(tmp);
                });
                var dic = {};
                var tmp = [];
                for(var i = 0; i < edgeSet.length; i++) {
                    if(dic[edgeSet[i]] === undefined) {
                        tmp.push(edgeSet[i]);
                        dic[edgeSet[i]] = 1;
                    }
                }
                res.json(edgeSet);
            })
        })
    }


});

router.get('/query', function(req, res) {
    var input = req.query.name;
    if(input.indexOf(",") === -1) {
        mongoose.connection.db.collection("vis.graph.nodeList", function (err, nodes) {
            nodes.find({name: {"$regex": ("^" + input), "$options": "i"}}, {_id: 0, name: 1, idx: 1}).toArray(function (err, nodeDoc) {
                res.json(nodeDoc);
            });
        });
    } else {
        //console.log(input);
        var edges = input.split(",");

        if(edges[1].length === 0) {
            input = edges[0];
        }else if(edges[0] > edges[1]) {
            input = "^" + edges[1] + ".*_" + edges[0];
        } else {
            input = "^" + edges[0] + "_" + edges[1];
        }
        mongoose.connection.db.collection("vis.digraph.edgeList", function(err, edges) {
            edges.find({name:{"$regex":(input), "$options":"i"}}, { _id:0}).toArray(function(err, edgeDoc) {
                res.json(edgeDoc);
            })
        })
    }
});

router.get('/findEdges', function(req, res) {
    var input = req.query.name;
    if(input === undefined) {
        return;
    }
    if(input.indexOf(",") !== -1) {
        //console.log(input);
        var edges = input.split(",");
        if(edges[1].length === 0) {
            input = edges[0];
        }else if(edges[0] > edges[1]) {
            input = "^" + edges[1] + ".*_" + edges[0];
        } else {
            input = "^" + edges[0] + "_" + edges[1];
        }
    } else {
        input = "^" + input + "|_" + input;
    }
    mongoose.connection.db.collection("vis.digraph.edgeList", function(err, edges) {
        edges.find({name:{"$regex":input, "$options":"i"}}, {_id:0}).toArray(function(err, edgeDoc) {
            res.json(edgeDoc);
        });
    })

});

router.get('/flow', function(req, res) {
    var sTime = req.query.sTime;
    var eTime = req.query.eTime;
    if(sTime.indexOf(",") === -1) {
        sTime = Number(sTime);
        eTime = Number(eTime);
    }
    var direct = req.query.direct;
    mongoose.connection.db.collection("vis.digraph.impact", function (err, impact) {
        impact.find({time:{"$gte":sTime, "$lte":eTime}}, {"nbet":0}).toArray(function(error, impactDoc) {
            var data = [];
            var getKey = function(k1, k2) {
                if(direct) {
                    return k1 + "_" + k2;
                } else {
                    return k1 < k2 ? k1 + "_" + k2 : k2 + "_" + k1;
                }

            };
            var metricType = ["ebet", "kendall", "pair"];
//                    for(var i = 0; i < 4; i++) {
//                        var temp = {"stream" : [], "multiEdges" :[], "type":metricType[i]};
//                        data.push(temp);
//                    }
            //data.push({});
//                    var edgeData = {};
            for(var metric = 0; metric < metricType.length; metric++) {
                var metricData = {};
                for(var i = 0; i < impactDoc.length; i++) {
                    var time = impactDoc[i].time;
                    var value = impactDoc[i][metricType[metric]];

                    if(metricData[time] === undefined) {
                        metricData[time] = {};
                    }
                    if(metricData[time][value] === undefined) {
                        metricData[time][value] = [];
                    }
                    var key = getKey(impactDoc[i]["edge"][0], impactDoc[i]["edge"][1]);
                    metricData[time][value].push({
                        edge:key,
                        pairNum:impactDoc[i]["pairNum"]
                    });
                }
                data.push({
                    "stream":metricData,
                    "type":metricType[metric]
                });
//                        console.log(metricData);
            }
            res.json(data);

        });
    });
});

router.get('/component', function(req, res) {
    var sTime = req.query.sTime;
    var eTime = req.query.eTime;
    if(sTime.indexOf(",") === -1) {
        sTime = Number(sTime);
        eTime = Number(eTime);
    }
    mongoose.connection.db.collection("vis.digraph.component", function (err, comp) {
        comp.find({time:{"$gte": sTime, "$lte": eTime}}).sort({"time":1}).toArray(function(error, compDoc) {
            var data = {};
            compDoc.forEach(function(d) {
                var time = d.time;
                if(d.nodes.length > 0) {

                    if (data[time] === undefined) {
                        data[time] = [];
                    }

                    data[time].push(d);
                }
            });
            var ts = Object.keys(data).sort();
            for(var i = 0; i < ts.length; i++) {
                data[ts[i]].sort(function(a,b) {
                    var res = 0;
                    if(a.nodes.length < b.nodes.length) {
                        res = 1;
                    } else if(a.nodes.length > b.nodes.length){
                        res = -1;
                    }
                    return res;
                })
            }
            res.json({
                comp:data
            });
        });
    })
});

router.get('/degree', function(req, res) {
    var direct = req.query.direct;
    mongoose.connection.db.collection("vis.graph.degree", function (err, degree) {
        degree.find({}).sort({"time":1}).toArray(function (error, degreeDoc) {
            var d = {};
            for(var i = 0; i < degreeDoc.length; i++) {
                var time = degreeDoc[i]["time"];
                var data = degreeDoc[i]["data"];
                var tmp = {};
                for(var j = 0; j < data.length; j++) {
                    var edge = data[j]["edge"];
                    var d1 = data[j]["d1"];
                    var d2 = data[j]["d2"];
                    var key;
                    if(direct) {
                        key = d1 + "_" + d2;
                    } else {
                        key = d1 < d2 ? d2 + "_" + d1 : d1 + "_" + d2;
                    }
                    if(key in tmp) {
                        tmp[key]["count"] += 1;
                        tmp[key]["edge"].push(edge);
                    } else {
                        tmp[key] = {"count" : 1, "edge":[edge]};
                    }

                }
                d[time] = tmp;
            }
            res.json(d);
        });
    });
});

module.exports = router;