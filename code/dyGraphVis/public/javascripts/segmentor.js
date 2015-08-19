/**
 * Created by Fangzhou on 2015/3/3.
 */
(function() {
    var app = angular.module("segModule", []);
    app.factory("segmenter", function() {
        var settings;
        var segment = function(type, value) {
            var level = -1;
            if(value == -1) {
                level = 0;
            } else if(type === "kendall") {
                level = (1 - value) / 0.2;
            } else if(type === "ebet") {
                level = value / 0.2;
//                if(level >= 2) {
//                    console.log(value);
//                }
            } else if(type === "pair") {
                level = value / 0.01;
            } else if(type === "avg") {
                level = value / 2;
            }

//            if(value == -1) {
//                level = 0;
//            } else if(type === "kendall") {
//                level = (1 - value) / 0.3;
//            } else if(type === "ebet") {
//                level = value / 0.2;
//            } else if(type === "pair") {
//                level = value / 0.01;
//            } else if(type === "avg") {
//                level = value / 2;
//            }
            if(Number.isNaN(level)) {
                console.log(level);
            }
            if(level > 2) {
                level = 2;
            }
            if(isNaN(level)) {
                level = 0;
            }
            return Math.floor(level);

        };
        var segment_node = function(value) {
            var level;
            var keys = Object.keys(value);
            var count = 0;
            keys.forEach(function(k) {
                if(value[k] === 2) {
                    count++;
                }
            });
            if(count === 0) {
                level = 0;
            } else if(count < 2) {
                level = 1;
//            } else if(count < 6) {
//                level = 2
            } else {
                level = 2;
            }
//            var percent = count / keys.length;
//            if(percent < 0.2) {
//                level = 0;
//            } else if (percent < 0.4) {
//                level = 1;
//            } else if (percent < 0.6) {
//                level = 2;
//            } else if (percent < 0.8) {
//                level = 3;
//            } else if (percent < 1){
//                level = 4;
//            } else {
//                level = 5;
//            }
//            level = count;
            return level;
        }
        var loadSettings = function() {

        };
        return {
            segment:segment,
            loadSettings:loadSettings,
            segment_node:segment_node
        };
    });
})();