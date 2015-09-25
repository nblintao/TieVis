var BiPartiteView = Backbone.View.extend({
	defaults: {
		margin: {
			top: 20,
			right: 20,
			bottom: 30,
			left: 40
		}
	},
	initialize:function(defaults, inter, options) {
		this.options = options;
	},
	render: function() {
		var margin = this.defaults.margin;
		this.width = this.$el.width() - margin.left - margin.right;
		this.height = this.$el.height() - margin.top - margin.bottom;
		this.container = d3.select(this.el).append("svg")
			.attr("width", this.width + margin.left + margin.right)
			.attr("height", this.height + margin.top + margin.bottom)
			.append("g")
			.attr("id", "container")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
	renderBipartiteCrossReduction: function(data) {
		// find related nodes
		var options = this.options;
		var relatedNodes = new Set();
		for (var i = 0; i < data.length; i++) {
			var d = data[i];
			for (var j = 0; j < d.d.length; j++) {
				relatedNodes.add(d.x);
				relatedNodes.add(d.y);
			}
		}
		// console.log(relatedNodes);
		var nNodes = relatedNodes.size;
		var periods = timelist.length;
		var nodeOrder = new Array(periods + 1);

		// shuffle for the first line
		nodeOrder[0] = [];
		for (var entry of relatedNodes) {
			nodeOrder[0].push(entry);
			// console.log(entry);
		}
		nodeOrder[0].sort(function(a, b) {
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

		// start rendering
		var margin = this.defaults.margin,
			// width = 800 - margin.left - margin.right,
			width = options.timelineWidth,
			height = 350 - margin.top - margin.bottom;

		// var x = d3.scale.ordinal()
		//   .rangePoints([0, width], 1)
		//   .domain(d3.range(timelist.length + 1));

		var x = d3.scale.linear()
			.range([0, width])
			.domain([0, timelist.length]);


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

		var edge = svg.selectAll('.edge')
			.data(data)
			.enter()
			.append('g')
			.attr('class', 'edge')
			.on('mouseover', function(d) {
				hoverEdge(d.i);
			});

		var line = edge.selectAll('line')
			.data(function(d) {
				var r = [];
				for (var i = 0; i < d.d.length; i++) {
					if (d.d[i] !== 0) {
						r.push({
							'd': d.d[i],
							'x': d.x,
							'y': d.y,
							'i': i
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
			.style('stroke', function(d) {
				return scaleColor2(d.d);
			});

	}

})