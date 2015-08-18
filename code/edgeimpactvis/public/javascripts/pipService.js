/**
 * Created by Fangzhou on 2015/3/11.
 */
(function() {
    var pip = angular.module("pipModule", []);
    pip.factory("pipService", ["$rootScope", function($rootScope) {
        var YEAR_CHANGE = 'yearChange';
        var SHOW_EDGE = "showEdge";
        var SHOW_NODE = "showNode";
        var pipService = {}
        pipService.emitYearChange = function(msg) {
            $rootScope.$broadcast(YEAR_CHANGE, msg);
        };
        pipService.onYearChange = function(scope, callback) {
            scope.$on(YEAR_CHANGE, function(event, msg) {
                callback(msg);
            });
        };
        pipService.emitShowEdge = function(msg) {
            $rootScope.$broadcast(SHOW_EDGE, msg);
        };
        pipService.onShowEdge = function(scope, callback) {
            scope.$on(SHOW_EDGE, function(event, msg) {
                callback(msg);
            });
        };
        pipService.emitShowNode = function(msg) {
            $rootScope.$broadcast(SHOW_NODE, msg);
        };
        pipService.onShowNode = function(scope, callback) {
            scope.$on(SHOW_NODE, function(event, msg) {
                callback(msg);
            });
        };
        return pipService;
    }])
})();