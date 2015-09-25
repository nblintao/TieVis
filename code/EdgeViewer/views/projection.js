var ProjectionView = Backbone.View.extend({
	defaults: {
		margin: {
			top: 20,
			right: 20,
			bottom: 30,
			left: 40
		}
	},
	initialize: function(options, inter) {
		this.inter = inter;
		this.listenTo(this.inter, "change", function() {
			console.log("event trigger");
		})
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
	},
	renderProjectView: function(pcaResult) {

		// width = 800 - margin.left - margin.right,
		// var width = options.rightWidth - margin.left - margin.right,
		// 	height = 400 - margin.top - margin.bottom;
		var width = this.width,
			height = this.height;
		var margin = this.defaults.margin;
		var x = d3.scale.linear()
			.range([0, width]);

		var y = d3.scale.linear()
			.range([height, 0]);

		var color = d3.scale.category10();

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");

		var data = pcaResult;

		x.domain(d3.extent(data, function(d) {
			return d[0];
		})).nice();
		y.domain(d3.extent(data, function(d) {
			return d[1];
		})).nice();

		var zoom = d3.behavior.zoom()
			.x(x)
			.y(y)
			// .scaleExtent([1, 10])
			.on("zoom", zoomed);

		var svg = this.container
			// http://stackoverflow.com/questions/13713528/how-to-disable-pan-for-d3-behavior-zoom
			.on("mousedown.zoom", null);

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.append("text")
			.attr("class", "label")
			.attr("x", width)
			.attr("y", -6)
			.style("text-anchor", "end")
			.text("Axis X");

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("class", "label")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Axis Y");

		svg.append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", width)
			.attr("height", height);

		var gDots = svg.append('g')
			.attr('class', 'dots')
			.attr("clip-path", "url(#clip)");

		var dots = gDots.selectAll(".dot")
			.data(data)
			.enter().append("circle")
			.attr("class", "dot")
			.attr('id', function(d, i) {
				return 'dot' + i;
			})
			// cannot catch the event because of the brush background
			// .attr('mouseover', function (d, i) { hoverEdge(i); })
			// .style('pointer-events','all')    
			.attr("r", 3.5)
			.attr("cx", function(d) {
				return x(d[0]);
			})
			.attr("cy", function(d) {
				return y(d[1]);
			});

		function zoomed() {
			svg.select(".x.axis").call(xAxis);
			svg.select(".y.axis").call(yAxis);

			// gDots.selectAll('circle').attr("transform", function (d) {
			//   return "translate(" + x(d[0]) + "," + y(d[1]) + ")";
			// });

			gDots.selectAll('circle')
				.attr("cx", function(d) {
					return x(d[0]);
				})
				.attr("cy", function(d) {
					return y(d[1]);
				});
		}
		
		var theView = this;

		var brush = svg.append("g")
			.attr("class", "brush")
			.call(d3.svg.brush()
				.x(x)
				.y(y)
				.on("brushend", function() {
					var extent = d3.event.target.extent();
					selectedEdges = [];
					dots.classed("selected", function(d, i) {
						var flag = extent[0][0] <= d[0] && d[0] < extent[1][0] && extent[0][1] <= d[1] && d[1] < extent[1][1];
						if (flag) {
							selectedEdges.push(i);
						}
						return flag;
					});
					// console.log(selectedEdges);
					theView.renderSelectedEdges(selectedEdges);
				}));


		var legend = svg.selectAll(".legend")
			.data(color.domain())
			.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) {
				return "translate(0," + i * 20 + ")";
			});

		legend.append("rect")
			.attr("x", width - 18)
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color);

		legend.append("text")
			.attr("x", width - 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) {
				return d;
			});
	},
	renderSelectedEdges: function (idList) {
		// console.log(selectedEdges);
		var selectedTieData = [];
		for (var i = 0; i < idList.length; i++) {
			var id = idList[i];
			selectedTieData.push(tieData[id]);
		}
		// console.log(idList, selectedTieData);
		Backbone.trigger('selectEdges', selectedTieData, timelist, idList);
		// renderBands(selectedTieData, timelist);
		// renderBipartite(selectedTieData);
		// renderLinks(idList);
	}

})