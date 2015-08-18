/**
 * Created by Fangzhou on 2015/3/4.
 */
(function() {
    var app = angular.module("configModule", []);
    app.factory("config", function() {
        return window.config;
    })
})();