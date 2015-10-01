/* global d3 */
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
			this.setAreaMode();		
		});
		Backbone.on('selectTime', this.renderTime, this);
		Backbone.on('hoverEdge', this.renderEdge, this);
		Backbone.on('selectEdges',this.selectEdges,this);
	},
	selectEdges:function(tieData){
		this.tieData = tieData;
	},
	renderTime: function(time) {
		var that = this;
		if (this.selectedTime === undefined || this.selectedTime !== time) {
			this.selectedTime = time;
			var edgesNow = this.tieData.filter(function (d) {
				return d.d[time] > 0;
			});
			var nEdgesNow = edgesNow.length;

			var nodeLineData = [];
			for (var i = 0; i < nEdgesNow - 1; i++) {
				for (var j = 1; j < nEdgesNow; j++) {
					var edgei = edgesNow[i];
					var edgej = edgesNow[j];
					if (edgei.y === edgej.y || edgei.y === edgej.x || edgei.x === edgej.y || edgei.x === edgej.x) {
						nodeLineData.push([edgei.i, edgej.i]);
					}
				}
			}
			
			this.nodeLineData = nodeLineData;
			this.clipped.select('.nodeLines').remove();
			var nodeLines = this.clipped.append('g')
				.attr('class', 'nodeLines');
			this.nodeLine = nodeLines.selectAll('line')
				.data(that.nodeLineData)
				.enter()
				.append('line');
			this.rerenderLines();				
		}
	},
	rerenderLines: function () {
		var that = this;
		that.nodeLine
			.attr('x1', function (d) { return that.x(that.pcaResult[d[0]][0]); })
			.attr('x2', function (d) { return that.x(that.pcaResult[d[1]][0]); })
			.attr('y1', function (d) { return that.y(that.pcaResult[d[0]][1]); })
			.attr('y2', function (d) { return that.y(that.pcaResult[d[1]][1]); });
	},
	// http://stackoverflow.com/questions/17108890/d3-zoom-and-brush-working-at-the-same-time
	setAreaMode: function () {
        var self = this;
		// console.log(self.inter.get('brush'));
        if (self.inter.get('brush')) {
            // self.setCursorToCrosshair();

            /* Deactivating zoom tool */
            self.zoomer.on('zoom', null);
			self.outcontainer.on("mousedown.zoom", null);			

            /* Adding brush to DOM */
            self.svg.append("g")
                .attr('class', 'brush')
                .attr("pointer-events", "all")
                .datum(function() { return { selected: false, previouslySelected: false};});
			// console.log(self.brush)
            /* Attaching listeners to brush */
            d3.select('.brush').call(
				self.brush.on("brushend", self.brushend)
					// .on('brushstart', function(){})
					// .on('brush', function(){})
				);
        }
		else {
            // self.setCursorToDefault();
            /* Activating zoomer */
            self.zoomer.on("zoom", self.zoomed);
			self.outcontainer.call(self.zoomer);// reuse mousedown.zoom
			
			// this.svg.on("mousedown.zoom", this.mousedownzoom);
			// console.log(this.svg);
			
            /* Deactivating listeners brush tool */
            d3.select('.brush').call(self.brush
				.on('brushstart', null)
                .on('brush', null)
                .on('brushend', null)
			);

            /* Removing brush from DOM */
            d3.select('.brush').remove();
        }
    },
	renderEdge:function(index){
		this.dots.classed("hovered", function (d,i) {
			return index === i;
		});	
	},
	render: function() {
		var margin = this.defaults.margin;
		this.width = this.$el.width() - margin.left - margin.right;
		this.height = this.$el.height() - margin.top - margin.bottom;
		this.outcontainer = d3.select(this.el).append("svg")
			.attr("width", this.width + margin.left + margin.right)
			.attr("height", this.height + margin.top + margin.bottom);
		this.container = this.outcontainer
			.append("g")
			.attr("id", "container")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	},
	renderProjectView: function (pcaResult) {
		var that = this;

		// width = 800 - margin.left - margin.right,
		// var width = options.rightWidth - margin.left - margin.right,
		// 	height = 400 - margin.top - margin.bottom;
		var width = this.width,
			height = this.height;
		var margin = this.defaults.margin;
		this.x = d3.scale.linear()
			.range([0, width]);

		this.y = d3.scale.linear()
			.range([height, 0]);

		var color = d3.scale.category10();

		var xAxis = d3.svg.axis()
			.scale(that.x)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(that.y)
			.orient("left");

		var data = pcaResult;
		this.pcaResult = pcaResult;
		this.x.domain(d3.extent(data, function(d) {
			return d[0];
		})).nice();
		this.y.domain(d3.extent(data, function(d) {
			return d[1];
		})).nice();

		this.zoomer = d3.behavior.zoom()
			.x(this.x)
			.y(this.y);
			// .scaleExtent([1, 10])
			// .on("zoom", this.zoomed);

		var svg = this.container;
			// .call(this.zoomer);
			// http://stackoverflow.com/questions/13713528/how-to-disable-pan-for-d3-behavior-zoom
			// .on("mousedown.zoom", null);
			
		// this.mousedownzoom = svg[0][0]['__onmousedown.zoom'];
		this.svg = svg;
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

		this.clipped = svg.append('g')
			.attr("clip-path", "url(#clip)");
			
		var gDots = this.clipped.append('g')
			.attr('class','dots');

		this.dots = gDots.selectAll(".dot")
			.data(data)
			.enter().append("circle")
			.attr("class", "dot")
			.attr('id', function(d, i) {
				return 'dot' + i;
			})
			// cannot catch the event because of the brush background
			.on('mouseover', function (d, i) { Backbone.trigger('hoverEdge', i);})
			// .style('pointer-events','all')    
			.attr("r", 3.5)
			.attr("cx", function(d) {
				return that.x(d[0]);
			})
			.attr("cy", function(d) {
				return that.y(d[1]);
			});
		var dots = this.dots;
		// console.log(dots);
		this.zoomed = function() {
			that.svg.select(".x.axis").call(xAxis);
			that.svg.select(".y.axis").call(yAxis);

			// gDots.selectAll('circle').attr("transform", function (d) {
			//   return "translate(" + that.x(d[0]) + "," + that.y(d[1]) + ")";
			// });

			gDots.selectAll('circle')
				.attr("cx", function(d) {
					return that.x(d[0]);
				})
				.attr("cy", function(d) {
					return that.y(d[1]);
				});
			
			that.rerenderLines();
		};
		
		this.brushend = function () {
			var extent = d3.event.target.extent();
			var selectedEdges = [];
			dots.classed("selected", function (d, i) {
				var flag = extent[0][0] <= d[0] && d[0] < extent[1][0] && extent[0][1] <= d[1] && d[1] < extent[1][1];
				if (flag) {
					selectedEdges.push(i);
				}
				return flag;
			});
			// console.log(selectedEdges);
			that.renderSelectedEdges(selectedEdges);
			this.clipped.select('.nodeLines').remove();
			
			d3.event.target.clear();
			d3.select(this).call(d3.event.target);
		};

		this.brush = d3.svg.brush()
			.x(this.zoomer.x())
			.y(this.zoomer.y());
			// .on("brushend",this.brushend);
			
		// var brush = svg.append("g")
		// 	.attr("class", "brush")
		// 	.call(this.brush);
		
		this.setAreaMode();
		
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
		Backbone.trigger('showInfo', idList);
		// renderBands(selectedTieData, timelist);
		// renderBipartite(selectedTieData);
		// renderLinks(idList);
	}

})