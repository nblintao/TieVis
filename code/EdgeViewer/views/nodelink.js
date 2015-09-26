var NodeLinkView = Backbone.View.extend({
	defaults: {
		margin: {
			top: 20,
			right: 20,
			bottom: 30,
			left: 40
		}
	},
	initialize: function (defaults, inter, options) {
		this.inter = inter;
		this.options = options;
		Backbone.on('hoverEdge', this.renderLink, this);
		Backbone.on('selectEdges', this.renderLinks, this);
	},
	render: function () {
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
	renderLink: function(i){
		this.links.classed("hovered", function (d) {
			return d.id === i;
		});		
	},
	renderLinks: function (v0, v1, idList) {
		this.links.classed("selected", function (d) {
			return idList.indexOf(d.id) !== -1;
		});
	},
	initializeNodeLinkView: function (nodelist, nodeLink) {
		var width = this.width,
			height = this.height;

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

		var svg = this.container;

		force
			.nodes(nodeNameList)
			.links(nodeLink)
			.start();

		this.links = svg.selectAll(".link")
			.data(nodeLink)
			.enter().append("line")
			.attr("class", "link")
		// .style("stroke-width", function (d) { return Math.sqrt(d.value / fullColor); })
		// .style("stroke-width", 2)
			.attr('id', function (d) {
				return 'f' + d.source.index + 't' + d.target.index;
			})
			.on('mouseover', function (d, i) {
				// it diffcult for user to select exact one link from so many links
				// so, only select from selected links
				if (this.classList.contains('selected')) {
					// hoverEdge(i);
					Backbone.trigger('hoverEdge', i);
				}
			})
			.each(function (d, i) {
				d.id = i;
			});

		var node = svg.selectAll(".node")
			.data(nodeNameList)
			.enter().append("circle")
			.attr("class", "node")
			.attr("r", 5)
		// .style("fill", function (d) { return color(d.group); })
			.call(force.drag);

		node.append("title")
			.text(function (d) {
				return d.name;
			});
		var links = this.links;
		force.on("tick", function () {
			links.attr("x1", function (d) {
				return d.source.x;
			})
				.attr("y1", function (d) {
					return d.source.y;
				})
				.attr("x2", function (d) {
					return d.target.x;
				})
				.attr("y2", function (d) {
					return d.target.y;
				});

			node.attr("cx", function (d) {
				return d.x;
			})
				.attr("cy", function (d) {
					return d.y;
				});
		});

	}
})