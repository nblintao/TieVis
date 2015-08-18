/**
 * Created by Fangzhou on 2015/3/7.
 */
(function() {
    var matrixView = angular.module("matrixView", ['d3Module', 'matViewModule', 'pipModule', 'calFuncModule']);
    matrixView.directive("d3MatrixView",  ['$window', '$timeout', 'd3', '$http','matFuncs', 'pipService', 'calFuncs',
        function($window, $timeout, d3Service, $http, matFuncs, pipService, calFunc) {
            return {
                restrict: 'A',
                link: function(scope, ele, attrs) {
                    var svgWidth = 800,
                        svgHeight = 800;
                    var hlghtEdges, hlghtNodes;
                    var svg = d3.select(ele[0]).append("svg")
                        .attr("id", "matrix")
                        .attr("width", svgWidth)
                        .attr("height", svgHeight);



                    matFuncs.init();
                    pipService.onYearChange(scope, function(d) {
//                        matFuncs.loadData(d, scope.detailMode);
                        matFuncs.spread(d[1], d[0], d[2]);
                    });
                    pipService.onShowEdge(scope, function(d) {
                        var time = d[0];
                        var edges = d[1];
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
                        matFuncs.spread(edges, time);
                    });
                    pipService.onShowNode(scope, function(d) {
                        var time = d[0];
                        var nodes = d[1];
                        var edges = d[2];
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
                        matFuncs.spread(edges, time);
                    });

                }
            }
        }]);
})();