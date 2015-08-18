/**
 * Created by Fangzhou on 2015/3/7.
 */
(function() {
    var app = angular.module("reactModule",[]);
    app.factory("react", function() {
        return window.React;
    });
})();