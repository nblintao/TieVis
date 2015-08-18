/**
 * Created by Fangzhou on 2014/12/15.
 */
(function() {
    var app = angular.module('d3Module', []);
    app.factory("d3", function() {
        return window.d3;
    });
})();