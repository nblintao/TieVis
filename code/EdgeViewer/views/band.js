var BandView = Backbone.View.extend({
	defaults: {
		margin: {
			top: 20,
			right: 20,
			bottom: 20,
			left: 20
		}
	},
	initialize: function(defaults, inter, options, time) {
		this.inter = inter;
		// this.listenTo(this.inter, "change", function() {
		// 	console.log("event trigger");
		// });
		this.options = options;
		// Backbone.on('selectEdges',renderBands(selectedTieData, timelist);)
		Backbone.on('selectEdges',this.renderBands,this);
		Backbone.on('hoverEdge', this.renderEdge, this);
		Backbone.on('renderScale',this.renderScaleEvent,this);
		this.time = time;
	},
	renderScaleEvent:function(){
		this.renderScale();
	},
	renderEdge: function (i) {
		var options = this.options;
		this.bar.classed("hovered", function (d) {
			return d.i === i;
		});
		this.rect.style('fill', function (d) {
			return options.scaleColor3(d.d, false);
		});
		this.bandView.selectAll('.hovered').selectAll('rect')
			.style('fill', function (d) {
				return options.scaleColor3(d.d, true);
			});	
	},
	render: function() {
		var margin = this.defaults.margin;
		this.width = this.$el.width() - margin.left - margin.right;
		this.height = this.$el.height() - margin.top - margin.bottom;
		this.container = d3.select(this.el).append("svg")
			.attr("width", this.width + margin.left + margin.right)
			.attr("height", this.height + margin.top + margin.bottom)
			.append("g")
			.attr("id", "band")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var width = this.width;
		this.listenTo(this.time, "change", function() {
			// console.log("event trigger");
			d3.select("#band").select("#time").attr("transform", function(d) {
						var pos = d.get("pos");
						// console.log(pos);
						var scale = d3.scale.linear().domain([0, 1]).range([0, width]);
						var x = scale(pos);
						return "translate(" + x + "," + "0)";
					});
		})

	},
	renderBands: function(tieData, timelist) {
		var width = this.width;
		var height = this.height;
		var margin = this.defaults.margin;
		var time = this.time;
		var nBands = tieData.length;
		var options = this.options;
		if (options.doMDS && nBands > 2 && nBands < options.thresholdMDS) {
			console.log('Doing MDS to ' + nBands + ' bands');

            //this.hieCluter(tieData);
			this.changeOrder(tieData);
		}
		// else{
		//   console.log('No MDS to ' + nBands + ' bands');    
		// }
		// console.log(tieData);
		this.container.selectAll('g').remove();

		// var bandViewWidth = 200;
		// var bandViewWidth = options.timelineWidth;
		var bandViewWidth = this.width;
		var bandViewHeight = 400;

		// adaptive band height
		var bandHeightMin = 2;
		var bandHeightMax = 18;
		var interBandHeight = 2;
		var bandHeight = bandViewHeight / nBands - interBandHeight;
		if (bandHeight < bandHeightMin) {
			bandHeight = bandHeightMin;
		} else if (bandHeight > bandHeightMax) {
			bandHeight = bandHeightMax;
		}
		
		this.bandHeight = bandHeight;
		
		bandViewHeight = (bandHeight + interBandHeight) * nBands;

		this.bandView = this.container;

		var scaleY = d3.scale.linear()
			.domain([0, tieData.length])
			.range([0, bandViewHeight]);

		this.bar = this.bandView.selectAll('g')
			.data(tieData)
			.enter()
			.append('g')
			.attr('id', function(d) {
				return 'barf' + d.y + 't' + d.x;
			})
			.attr('transform', function(d, i) {
				return 'translate(0,' + scaleY(i) + ')';
			})
			.on('mouseover', function(d, i) {
				// // hoverEdge(d.i);
				// var mpos = d3.mouse(this);
				// //bandView.selectAll("#time").remove();
				// var t = mpos[0] / (width - margin.left - margin.right);
				// t = t < 0 ? 0 : t > 1 ? 1 : t;
				// time.set("pos", t);
				// timeBar.attr("transform", function(d) {
				// 	var pos = d.get("pos");
				// 	var scale = d3.scale.linear().domain([0, 1]).range([margin.left, width - margin.right]);
				// 	var x = scale(pos);
				// 	return "translate(" + x + "," + "0)";
				// });
				Backbone.trigger('hoverEdge', d.i);
		})
		// .attr('id', function (d, i) { return 'bar' + i; })
		;

		this.scaleX = d3.scale.linear()
			.domain([0, timelist.length])
			.range([0, bandViewWidth]);
		this.inter.scaleBandBipa = this.scaleX;
		// console.log(this.inter.scaleBandBipa);
		
		var zoom = d3.behavior.zoom()
			.on("zoom", function(){
				Backbone.trigger('renderScale');
			})
			.x(this.scaleX);
		this.inter.zoomBandBipa = zoom;
		
		this.bandView.call(zoom);
		
		var singleWidth = bandViewWidth / timelist.length;

		this.rect = this.bar.selectAll('rect')
			.data(function(d) {
				var data = d['d'].map(function(d , i) {
					return {
						"d" : d,
						"index" : i
					}
				}).filter(function(d) {
					var res = true;
					if(d.d == 0) {
						res = false
					}
					return res;
				})
				return data;
			})
			.enter()
			.append('rect');

		var that = this;
		this.renderScale = function(){
			// console.log("renenrenr");
			that.rect
			.attr('x', function(d) {
				return that.scaleX(d.index);
			})
			// .attr('y', function(d,i){return scaleY(i);})
			// .attr('width', singleWidth)
			.attr('width', that.scaleX(1)-that.scaleX(0))
			.attr('height', that.bandHeight)
			.style('fill', function(d) {
				return options.scaleColor3(d.d,false);
			});
		};
		
		this.renderScale();

		var line = d3.svg.line()
			.x(function(d) {
				return d.x;
			})
			.y(function(d) {
				return d.y;
			})
			.interpolate("basis");
		var timeBar = this.bandView.append("g")
			.datum(time)
			.append("path")
			.attr("id", "time")
			.attr("d", function(d) {
				return line([{
					"x": 0,
					"y": 0
				}, {
					"x": 0,
					"y": height
				}]);
			})
			.attr("stroke", "#000000")
			.attr("opacity", 0.5)
			.attr("transform", function(d) {
				var pos = d.get("pos");
				var scale = d3.scale.linear().domain([0, 1]).range([0, width]);
				var x = scale(pos);
				return "translate(" + x + "," + "0)";
			});
		var range = [];
		for(var i = 0; i < timelist.length; i++) {
			range.push(i);
		}
		var timeScale = d3.scale.quantize().domain([0, 1]).range(range);
		d3.select("#band")
			.on("mousemove", function() {
					var mpos = d3.mouse(this);
					//bandView.selectAll("#time").remove();
					var t = (mpos[0] - margin.left) / (width);
					t = t < 0 ? 0 : t > 1 ? 1 : t;
					time.set("pos", t);
					
				// 	Backbone.trigger('hoverEdge', d.i);

			})
			.on("click", function() {
				var mpos = d3.mouse(this);
				// var t = (mpos[0] - margin.left) / (width);
				// Backbone.trigger("selectTime", timeScale(t));
				var time = Math.floor(that.scaleX.invert((mpos[0] - margin.left)));
				Backbone.trigger("selectTime", time);
			});
	},
	hieCluter: function(tieData) {
		var vectDist = function(a, b) {
			var res = 0;
			for(var i = 0; i < a.length; i++) {
				res += (a[i] - b[i]) * (a[i] - b[i]);
			}
			return Math.sqrt(res);
		};
		var dist = function(v1, v2, dist) {
			var res = 0;
			for(var i = 0; i < v1.length; i++) {
				for(var j = 0; j < v2.length; j++) {
					res += dist(v1[i], v2[j]);
				}
			}
			return res / (v1.length * v2.length);
		};
        var expand = function(node) {
            var n0, n1;
            var children = node.children;
            var temp = children.map(function(d) {
                var res;
                if(d.data.length == 1) {
                    res = d.data;
                } else {
                    res = expand(d);
                }
                return res;
            });
            var res = [];
            for(var i = 0, len = temp.length; i < len; i++) {
                res = res.concat(temp[i]);
            }
            return res;
        };
		var cluster = [];
		for(var i = 0; i < tieData.length; i++) {
			cluster.push({
                data:[tieData[i]]
            });
		}
		while(cluster.length > 1) {
			var min = Number.MAX_VALUE, id1, id2;
			for(var i = 0; i < cluster.length; i++) {
				for(var j = i + 1; j < cluster.length; j++) {
					var d = dist(cluster[i].data, cluster[j].data, function(a, b) {
                        return vectDist(a.d, b.d);
                    });
					if(min > d) {
						min = d;
						id1 = i;
						id2 = j;
					}
				}
			}
			//cluster[id1].data = cluster[id1].data.concat(cluster[id2].data);
            var newNode = {};
            newNode.data = cluster[id1].data.concat(cluster[id2].data);
            newNode.children = [cluster[id1], cluster[id2]];
            cluster[id1] = newNode;
			cluster.splice(id2, 1);
		}
        console.log(cluster[0]);
        //console.log(expand(cluster[0]).map(function(d) {return d.i}));
        return cluster;
	},
	changeOrder: function(tieData) {
		var dat = [];
		var len = tieData.length;
		for (var i = 0; i < len; i++) {
			var t = [];
			for (var j = 0; j < len; j++) {
				t.push(dist(tieData, i, j));
			}
			dat.push(t);
		}

		var p = MDS(dat, 1);

		// console.log(dat);
		// console.log(p);

		for (var i = 0; i < len; i++) {
			tieData[i].p = p[i][0];
		}
		tieData.sort(function(a, b) {
			return a.p - b.p;
		});


		function dist(d, a, b) {
			var i, ret = 0,
				p, q;
			for (i = 0; i < 24; i++) {
				p = +d[a].d[i];
				q = +d[b].d[i];
				ret += (p - q) * (p - q);
			}
			return Math.sqrt(ret);
		}

		function MDS(distances, dimensions) {
			dimensions = dimensions || 2;

			var M = numeric.mul(-.5, numeric.pow(distances, 2));

			function mean(A) {
				return numeric.div(numeric.add.apply(null, A), A.length);
			}
			var rowMeans = mean(M),
				colMeans = mean(numeric.transpose(M)),
				totalMean = mean(rowMeans);

			for (var i = 0; i < M.length; ++i) {
				for (var j = 0; j < M[0].length; ++j) {
					M[i][j] += totalMean - rowMeans[i] - colMeans[j];
				}
			}

			var ret = numeric.svd(M),
				eigenValues = numeric.sqrt(ret.S);
			return ret.U.map(function(row) {
				return numeric.mul(row, eigenValues).splice(0, dimensions);
			});
		};
	}
})