/**
 * Created by Fangzhou on 2014/12/23.
 */
(function() {
    var edgeFlow = angular.module("edgeFlow", ['d3Module', 'funcModule', 'calFuncModule', 'segModule', 'matrixModule', 'configModule']);
    edgeFlow.directive("d3EdgeFlow",  ['$window', '$timeout', 'd3', '$http', "funcs", "calFuncs", "segmenter", "config",
        function($window, $timeout, d3Service, $http, funcs, calFuncs, segmenter, config) {
            return {
                restrict: 'A',
                scope: {
                  'queryName': '='
                },
                link: function(scope, ele, attrs) {
                    scope.$watch('queryName', function(newValue, oldValue){
                        if(newValue === undefined || newValue.length < 3) {
                            return;
                        }
                        $http.get("/findEdges", {
                            params : {
                                name:newValue
                            }
                        }).success(function(d) {
                            if(d !== null && d.length !== 0) {
                                var idxs = d.map(function(e) {
                                    return e.idx;
                                });
                                var names = d.map(function(e) {
                                    return e.name.replace("_", ",");
                                })
                                funcs.highlight(idxs, undefined, names);
                            }
                        });
                    });
                    var params = {
                        params:{
                            sTime: "2002",
                            eTime: "2007",
                            direct:config.direct
                        }
                    };
                    $http.get("/flow", params).success(function(rawData) {

                        $http.get("/component", params).success(function(component) {
                            $http.get("/degree").success(function(degreeData) {
                                var flowData = calFuncs.segData(rawData, segmenter.segment);
                                //initial
                                var degreeData = calFuncs.calDegree(flowData, degreeData, calFuncs.timescale());
                                var svgWidth = config.edgeImpactConfig.geometry.w;
                                var svgHeight = config.edgeImpactConfig.geometry.h;
                                var svg = d3.select(ele[0])
                                    .append('svg')
                                    .attr("width", svgWidth)
                                    .attr("height", svgHeight);
                                //[x, y, width, height]
                                //flow
                                var flowPara = [0, 0, config.edgeFlowConfig.geometry.w, config.edgeFlowConfig.geometry.h];
                                var color = ["#deebf7", "#9ecae1", "#3182bd"];
//                                var coor = calFuncs.calFlowCoor(flowData, flowPara, color, 160);
                                var groups = [];
                                var flowId = ["node", "edge", "pair", "global"];
                                var compData = calFuncs.calCompData(component, segmenter.segment_node);
                                var flowGroup = svg.append("g");
                                flowGroup.data([compData])
                                    .attr("transform", function(d, i) {
                                        return "translate(" + config.edgeFlowConfig.geometry.x + "," + config.edgeFlowConfig.geometry.y + ")";
                                    })
                                    .attr("id", function(d) {
                                        return "group_" + flowId[3];
                                    })
                                    .call(funcs.drawFlow, flowPara, color, 160);
                                var degreeGroup = svg.append("g")
                                    .attr("transform", "translate(" + config.degreeConfig.geometry.x + "," + config.degreeConfig.geometry.y + ")")
                                    .attr("id", "group_degree");
                                //degree chart
                                //find max
                                var maxDegree = d3.max(degreeData, function(d) {
                                    return d3.max(Object.keys(d["data"]), function(key) {
                                        return Number(key.split("_")[0]);
                                    })
                                });
                                var degreeWidth = 200;
                                var avgWidth = config.edgeFlowConfig.geometry.w / (degreeData.length * 1.1 + 0.1);
                                var scaleX = d3.scale.linear().domain([0, degreeData.length - 1]).range([avgWidth * 0.6, config.edgeFlowConfig.geometry.w - avgWidth * 0.6]);
                                //[x, y, height, width]
                                var degreePara = [0, 0, avgWidth, config.degreeConfig.geometry.h];

                                degreeGroup.selectAll("g")
                                    .data(degreeData)
                                    .enter()
                                    .append("g")
                                    .attr("transform", function(d, i) {
                                        return "translate(" + scaleX(i) + "," + 0 + ")";
                                    })
                                    .attr("id", "scatterPlot")
                                    .call(funcs.drawScatterPlot, maxDegree, degreePara, color);
                                //parallel set
                                var parGroup = svg.append("g").attr("id", "parSet")
                                    .attr("transform",  "translate(" + config.circularConfig.geometry.x + "," + config.circularConfig.geometry.y + ")");
                                //set data
                                var axisOrder = ["kendall", "ebet", "pair"];
                                var highlight = config.circularConfig.triRelation;
                                var setData = calFuncs.calSetRelation(flowData, axisOrder, calFuncs.timescale(), highlight);


                                parGroup.selectAll("g")
                                    .data(setData)
                                    .enter()
                                    .append("g")
                                    .attr("transform", function(d) {
                                        return "translate(" + scaleX(d.index) + "," + config.circularConfig.geometry.y + ")";
                                    })
                                    .call(funcs.drawCircular, color, axisOrder, config.circularConfig.geometry.R);
                                var graphGroup = svg.append("g").attr("id", "graph")
                                    .attr("transform","translate(" + (2300 + svgHeight / 2) + "," + svgHeight / 2 + ")"
                                );
//                                funcs.drawNodeLink(graphGroup, graph, 500, 500);

                                var histoData = calFuncs.calHistogram(flowData[0].multiEdges, calFuncs.timescale(), 0.1);
                                var histoGroup = svg.append("g").attr("id", "histo")
                                    .attr("transform", "translate(" + config.histogramConfig.geometry.x + "," + config.histogramConfig.geometry.y + ")");
                                histoGroup.data([histoData])
                                    .call(funcs.drawHistogram, [config.histogramConfig.geometry.w, config.histogramConfig.geometry.h, 20]);
                            });
                        });
                    });
                }
            }
        }]);
    edgeFlow.controller("ImpactCtrl", function($scope) {

    })
})();