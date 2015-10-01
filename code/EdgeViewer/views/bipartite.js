var BiPartiteView = Backbone.View.extend({
	defaults: {
		margin: {
			top: 20,
			right: 20,
			bottom: 20,
			left: 20
		}
	},
	initialize: function(defaults, inter, options, time) {
		this.options = options;
		this.inter = inter;
		Backbone.on('selectEdges',this.renderBipartiteCrossReduction,this);
		Backbone.on('hoverEdge', this.renderEdge, this);
		this.time = time;
		Backbone.on('selectTime', this.renderBipartiteGroup, this);
		Backbone.on('renderScale', this.renderScaleEvent, this);
		this.colorCat = d3.scale.category10();
	},
	renderScaleEvent:function(){
		this.renderScale();
	},
	renderBipartiteCrossReduction:function(data){
		this.data = data;
		this.renderBipartite(data, -1);
	},
	renderBipartiteGroup: function(selectedTime){
		this.renderBipartite(this.data, selectedTime);
	},
	renderEdge: function (i) {
		var options = this.options;
		var that = this;
		this.edge.classed("hovered", function (d) {
			return d.i === i;
		});
		this.line.style('stroke', function (d) {
			return that.colorScale(d, false);
		});
		this.svg.selectAll('.hovered').selectAll('line')
			.style('stroke', function (d) {
				return that.colorScale(d, true);
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
			.attr("id", "bipartite")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var width = this.width;
		this.listenTo(this.time, "change", function() {
				// console.log("event trigger");
				d3.select("#bipartite").select("#time").attr("transform", function(d) {
					var pos = d.get("pos");
					// console.log(pos);
					var scale = d3.scale.linear().domain([0, 1]).range([0, width]);
					var x = scale(pos);
					return "translate(" + x + "," + "0)";
				});
			});
			// function renderBipartite(data) {
			// 	switch (options.bipartiteType) {
			// 		case 'Original':
			// 			renderBipartiteOriginal(data);
			// 			break;
			// 		case 'CrossReduction':
			// 			renderBipartiteCrossReduction(data);
			// 		default:
			// 			break;
			// 	}
			// }
	},
	orderCrossReduction: function (nodeOrder, relatedNodes, periods, nNodes, data) {
		// shuffle for the first line
		nodeOrder[0] = [];
		for (var entry of relatedNodes) {
			nodeOrder[0].push(entry);
			// console.log(entry);
		}
		nodeOrder[0].sort(function (a, b) {
			return Math.random() > .5 ? -1 : 1;
		});
		// console.log(nodeOrder[0]);

		// calculate order for each line
		for (var step = 0; step < periods; step++) {
			nodeOrder[step + 1] = new Array(nNodes);
			var info = {};
			for (var i = 0; i < data.length; i++) {
				var t = data[i];
				if (t.d[step] === 0) {
					continue;
				} else {
					// console.log(t);
					if (!info[t.x]) {
						info[t.x] = [];
					}
					info[t.x].push(t.y);
				}
			}
			// console.log(info);
			// find position for each end point
			for (var key in info) {
				if (info.hasOwnProperty(key)) {
					var element = info[key];
					var posList = [];
					for (var it in element) {
						posList.push(nodeOrder[step].indexOf(element[it]));
					}
					var bestPos = Math.floor(d3.median(posList));
					// console.log('best', bestPos, posList);
					var offset = 0;
					var pos;
					while (true) {
						pos = bestPos - offset;
						if (pos >= 0 && pos < nNodes && !nodeOrder[step + 1][pos]) {
							break;
						}
						offset += 1;
						pos = bestPos + offset;
						if (pos >= 0 && pos < nNodes && !nodeOrder[step + 1][pos]) {
							break;
						}
					}
					nodeOrder[step + 1][pos] = +key;
					// console.log(pos);
				}
			}

			//add other data
			var blankPos = 0;
			for (var i = 0; i < nodeOrder[0].length; i++) {
				var e = nodeOrder[0][i];
				if (nodeOrder[step + 1].indexOf(e) === -1) {
					while (nodeOrder[step + 1][blankPos]) {
						blankPos++;
					}
					nodeOrder[step + 1][blankPos] = e;
				}

			}
			// console.log(nodeOrder[step + 1]);
		}
	},
	orderGroup: function (nodeOrder, relatedNodes, periods, nNodes, data, selectedTime) {
		//console.log(nodeOrder, relatedNodes, periods, nNodes, data, selectedTime);
		var edgesNow = [];
		for (var i = 0; i < data.length; i++) {
			if (data[i].d[selectedTime] !== 0) {
				// edgesNow.push([data[i].y, data[i].x]);
				edgesNow.push(data[i]);
			}
		}

		var groups = [];
		// construct the groups
		for (var i = 0; i < edgesNow.length; i++) {
			var edge = edgesNow[i];
			var fset = -1, tset = -1;
			for (var j = 0; j < groups.length; j++) {
				if (groups[j].s.indexOf(edge.y) !== -1) {
					fset = j;
				}
				if (groups[j].s.indexOf(edge.x) !== -1) {
					tset = j;
				}
			}

			if (fset === -1 && tset === -1) {
				var ss;
				if(edge.y === edge.x){
					ss = [edge.y];
				}else{
					ss = [edge.y, edge.x];
				}
				groups.push({ e: [edge], s: ss});
			}
			else if (fset === -1 || tset === -1) {
				if (fset === -1) {
					groups[tset].e.push(edge);
					groups[tset].s.push(edge.y);
				} else {
					groups[fset].e.push(edge);
					groups[fset].s.push(edge.x);
				}
			}
			else if (fset !== tset) {
				var ga = groups[fset];
				var gb = groups[tset];
				ga.e = ga.e.concat(gb.e);
				ga.e.push(edge);
				ga.s = ga.s.concat(gb.s);
				groups.splice(tset, 1);
			}
			else // fset === tset
			{
				groups[fset].e.push(edge);
			}
		}
		
		// reduce cross in the group
		var permulation = function (d) {
			if (d.length <= 1) {
				return [d];
			}
			var perm = [];
			for (var i = 0; i < d.length; i++) {
				var ele = [d[i]];
				var behind = d.slice(0);
				behind.splice(i, 1);
				var permBehind = permulation(behind);
				for (var j = 0; j < permBehind.length; j++) {
					var pushedEle = ele.concat(permBehind[j]);
					perm.push(pushedEle);
				}
			}
			return perm;
		};
		var countCross = function(perm, edges){
			var count = 0;
			var nEdge = edges.length;
			for(var i = 0; i< nEdge-1; i++){
				for(var j=i+1;j<nEdge;j++){
					var edgei = edges[i];
					var edgej = edges[j];
					if(edgei.y === edgej.y ||edgei.x === edgej.x ){
						continue;
					}
					if((perm.indexOf(edgei.y) > perm.indexOf(edgej.y)) !== (perm.indexOf(edgei.x) > perm.indexOf(edgej.x))){
						count++;
					}
				}
			}
			return count;
		};
		for (var i = 0; i < groups.length; i++) {
			var group = groups[i];
			// do not calculate when group is too large
			if (group.s.length <= 2 || group.s.length > 10) {
				continue;
			}
			var bestOrder;
			var minCross = -1;
			var perms = permulation(group.s);
			for(var j=0;j<perms.length;j++){
				var perm = perms[j];
				var cross = countCross(perm, group.e);
				// console.log(perm,cross);
				if(minCross === -1 || cross < minCross){
					minCross = cross;
					bestOrder = perm;
					if(cross === 0){
						break;
					}
				}
			}
			group.s = bestOrder;
			// console.log(group,bestOrder,minCross);
		}
		
		
		// TODO:reduce cross between groups
		
		
		//console.log(groups);
		
		// set group id
		data.forEach(function(d){
			d.g = undefined;
		});
		for (var i = 0; i < groups.length; i++) {
			var edges = groups[i].e;
			for(var j=0;j<edges.length;j++){
				var oneEdge = edges[j];
				oneEdge.g = i;
			}
		}
		
		// get the order
		var order = [];
		for (var i = 0; i < groups.length; i++) {
			order = order.concat(groups[i].s);
		}
		for (var entry of relatedNodes) {
			if(order.indexOf(entry)===-1){
				order.push(entry);
			}
		}
		//console.log(order);
		for (var i = 0; i < periods + 1; i++) {
			nodeOrder[i] = order;
		}
	},
	renderBipartite: function(data, selectedTime) {
		var that = this;
		// find related nodes
		var options = this.options;
		var relatedNodes = new Set();
		var time = this.time;
		for (var i = 0; i < data.length; i++) {
			var d = data[i];
			// for (var j = 0; j < d.d.length; j++) {
				relatedNodes.add(d.x);
				relatedNodes.add(d.y);
			// }
		}
		// console.log(relatedNodes);
		var nNodes = relatedNodes.size;
		var periods = timelist.length;
		var nodeOrder = new Array(periods + 1);
		
		if (selectedTime === -1){
			this.orderCrossReduction(nodeOrder, relatedNodes, periods, nNodes, data);
		}
		else {
			this.orderGroup(nodeOrder, relatedNodes, periods, nNodes, data, selectedTime);
		}
		
		// console.log(nodeOrder);
		
		
		// start rendering
		var margin = this.defaults.margin,
			// width = 800 - margin.left - margin.right,
			// width = options.timelineWidth,
			width = this.width,
			// height = 350 - margin.top - margin.bottom;
			height = this.height;

		// var x = d3.scale.ordinal()
		//   .rangePoints([0, width], 1)
		//   .domain(d3.range(timelist.length + 1));

		// var x = d3.scale.linear()
		// 	.range([0, width])
		// 	.domain([0, timelist.length]);
			
		var x = this.inter.scaleBandBipa;
		this.container.call(this.inter.zoomBandBipa);

		// different !!!
		var oldY = d3.scale.linear()
			.domain([0, nNodes - 1])
			.range([height, 0]);
		var y = function(value, step) {
			// console.log(nodeOrder[step].indexOf(value));
			return oldY(nodeOrder[step].indexOf(value));
		};

		// // same order for each line
		// var y = function (value, step) {
		//   console.log(nodeOrder[0].indexOf(value));
		//   return oldY(nodeOrder[0].indexOf(value));
		// };
		this.container.selectAll('g').remove();

		var svg = this.container;
		this.svg = svg;
		svg.append("clipPath")
			.attr("id", "clipBi")
			.append("rect")
			.attr("width", width)
			.attr("height", height);
	
		// Add an axis and title.
		var axis = d3.svg.axis()
			.scale(oldY)
			.orient("left");
		svg.append("g")
			.attr("class", "axis")
			.call(axis)
			.append("text")
			.style("text-anchor", "middle")
			.attr("y", -9)
			.text(function(d) {
				return d;
			});
			
		var cliped = svg.append('g')
			.attr("clip-path", "url(#clipBi)");
			
		var edge = cliped.selectAll('.edge')
			.data(data)
			.enter()
			.append('g')
			.attr('class', 'edge')
			.attr('id',function(d){return d.i;})
			.on('mouseover', function(d) {
				// hoverEdge(d.i);
				Backbone.trigger('hoverEdge', d.i);
			});
		this.edge = edge;
		
		this.colorScale = function (d, flag) {
			if (d.e.g !== undefined) {
				return that.colorCat(d.e.g);
			} else {
				return options.scaleColor3(d.d, flag);
			}
		};
		
		this.line = edge.selectAll('line')
			.data(function(d) {
				var r = [];
				for (var i = 0; i < d.d.length; i++) {
					if (d.d[i] !== 0) {
						r.push({
							'd': d.d[i],
							'x': d.x,
							'y': d.y,
							'i': i,
							'e': d
						});
						// y/x means from/to here
					}
				}
				return r;
			})
			.enter()
			.append('line')
			.attr('x1', function(d, i) {
				return x(d.i);
			})
			.attr('x2', function(d, i) {
				return x(d.i + 1);
			})
			.attr('y1', function(d, i) {
				return y(d.y, d.i);
			})
			.attr('y2', function(d, i) {
				return y(d.x, d.i + 1);
			})
			.style('stroke', function(d){return that.colorScale(d,false);});
			
		this.renderScale = function(){
			this.line
				.attr('x1', function (d, i) {
					return x(d.i);
				})
				.attr('x2', function (d, i) {
					return x(d.i + 1);
				});
		}
		var line = d3.svg.line()
			.x(function(d) {
				return d.x;
			})
			.y(function(d) {
				return d.y;
			})
			.interpolate("basis");
		var width = this.width;
		var height = this.height;
		var timeBar = svg.append("g")
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
		for (var i = 0; i < timelist.length; i++) {
			range.push(i);
		}
		var timeScale = d3.scale.quantize().domain([0, 1]).range(range);
		
		d3.select("#bipartite")
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
				var time = Math.floor(that.inter.scaleBandBipa.invert((mpos[0] - margin.left)));
				Backbone.trigger("selectTime", time);
			});

	}

})