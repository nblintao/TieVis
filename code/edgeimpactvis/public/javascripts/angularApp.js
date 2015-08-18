/**
 * Created by Fangzhou on 2014/12/15.
 */
(function() {
    var app = angular.module('dyGraphVis', ['edgeFlow', "matrixView", "ui.bootstrap"]);
    app.controller("QueryCtrl", function($scope, $http) {
        $scope.getNames = function(val) {
            return $http.get("/query", {
                params : {
                    name:val
                }
            }).then(function(response) {
                return response.data.map(function (item) {
                    return item.name.replace("_", ",");
                })
            });
        };
        $scope.options = {
            dataset: ["DBLP", "Enron Mail Dataset"]
        };
        $scope.dataset = "DBLP";
        $scope.detailMode = "Node-Link";
    });
})();