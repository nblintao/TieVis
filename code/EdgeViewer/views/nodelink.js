var NodeLinkView = Backbone.View.extend({
	defaults: {
		margin: {
			top: 20,
			right: 20,
			bottom: 30,
			left: 40
		}
	},
	initialize: function(defaults, inter, options) {
		this.inter = inter;
		this.options = options;
		Backbone.on('hoverEdge', this.renderLink, this);
		Backbone.on('selectEdges', this.renderLinks, this);
		Backbone.on('selectTime', this.renderTime, this);
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
	renderLinks: function(v0, v1, idList) {
		this.idList = idList;
		this.links.classed("selected", function(d) {
			return idList.indexOf(d.id) !== -1;
		});
	},
	renderTime: function(time) {
		var tieData = this.tieData;
		if (this.selectedTime === undefined || this.selectedTime !== time) {
			this.selectedTime = time;
			var nodelink = tieData.filter(function(d) {
				var res = false;
				if (d.d[time] > 0) {
					res = true;
				}
				return res;
			}).map(function(d) {
				return {
					x: d.x,
					y: d.y,
					source: this.nodelist[d.x],
					target: this.nodelist[d.y],
					value: d.d[time]
				};
			});
			var nodeIndex = [];
			for(var i = 0; i < nodelink.length; i++) {
				var source = nodelink[i].x;
				var target = nodelink[i].y;
				if(nodeIndex.indexOf(source) <= 0) {
					nodeIndex.push(source);
				}
				if(nodeIndex.indexOf(target) <= 0) {
					nodeIndex.push(target);
				}
			}
			var tempList = this.nodelist.filter(function(d, i) {
				var res = false;
				if(nodeIndex.indexOf(i) >= 0){
					res = true;
				}
				return res;
			})
			nodelink = nodelink.map(function(d) {
				return {
					source: tempList.indexOf(d.source),
					target: tempList.indexOf(d.target),
					value: d.value
				}
			});
			this.initializeNodeLinkView(tempList, nodelink);
			if (this.idList !== undefined) {
				this.renderLinks(null, null, this.idList);
			}
		}

	},
	setData: function(tieData, nodelist) {
		this.tieData = tieData;
		this.nodelist = nodelist;
	},
	initializeNodeLinkView: function(nodelist, nodeLink) {
		this.container.selectAll("g").remove();
		var width = this.width,
			height = this.height;
		// this.nodelist = nodelist;

		// var color = d3.scale.category20();

		var nodeNameList = [];
		for (var i = 0; i < nodelist.length; i++) {
			var t = nodelist[i];
			nodeNameList.push({
				'name': t
			});

		}

		// console.log(nodeNameList, nodeLink);
		var force = d3.layout.force()
			.charge(-80)
			.linkDistance(50)
			.size([width, height]);

		var svg = this.container.append("g");

		force
			.nodes(nodeNameList)
			.links(nodeLink);


		this.links = svg.selectAll(".link")
			.data(nodeLink)
			.enter().append("line")
			.attr("class", "link")
			// .style("stroke-width", function (d) { return Math.sqrt(d.value / fullColor); })
			// .style("stroke-width", 2)
			.attr('id', function(d) {
				return 'f' + d.source.index + 't' + d.target.index;
			})
			.on('mouseover', function(d, i) {
				// it diffcult for user to select exact one link from so many links
				// so, only select from selected links
				if (this.classList.contains('selected')) {
					// hoverEdge(i);
					Backbone.trigger('hoverEdge', i);
				}
			})
			.each(function(d, i) {
				d.id = i;
			});

		var node = svg.selectAll(".node")
			.data(nodeNameList)
			.enter().append("circle")
			.attr("class", "node")
			.attr("r", 5)
			// .style("fill", function (d) { return color(d.group); })
			// .call(force.drag);

		node.append("title")
			.text(function(d) {
				return d.name;
			});
		var that = this;
		force.on("tick", function() {
			that.links.attr("x1", function(d) {
					return d.source.x;
				})
				.attr("y1", function(d) {
					return d.source.y;
				})
				.attr("x2", function(d) {
					return d.target.x;
				})
				.attr("y2", function(d) {
					return d.target.y;
				});

			node.attr("cx", function(d) {
					return d.x;
				})
				.attr("cy", function(d) {
					return d.y;
				});
		});

		force.start();
		// for(var i = 0; i < 1000; i++) {
		// 	force.tick();
		// }
		// force.stop();

	}
})