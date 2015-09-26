var BandView = Backbone.View.extend({
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
		this.listenTo(this.inter, "change", function() {
			console.log("event trigger");
		});
		this.options = options;
		// Backbone.on('selectEdges',renderBands(selectedTieData, timelist);)
		Backbone.on('selectEdges',this.renderBands,this);
		Backbone.on('hoverEdge', this.renderEdge, this);
	},
	renderEdge: function (i) {
		var options = this.options;
		this.bar.classed("hovered", function (d) {
			return d.i === i;
		});
		this.rect.style('fill', function (d) {
			return options.scaleColor3(d, false);
		});
		this.bandView.selectAll('.hovered').selectAll('rect')
			.style('fill', function (d) {
				return options.scaleColor3(d, true);
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
			.attr("id", "container")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	},
	renderBands: function(tieData, timelist) {
		
		var nBands = tieData.length;
		var options = this.options;
		if (options.doMDS && nBands > 2 && nBands < options.thresholdMDS) {
			console.log('Doing MDS to ' + nBands + ' bands');
			this.changeOrder(tieData);
		}
		// else{
		//   console.log('No MDS to ' + nBands + ' bands');    
		// }
		// console.log(tieData);
		this.container.selectAll('g').remove();

		// var bandViewWidth = 200;
		var bandViewWidth = options.timelineWidth;
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
				// hoverEdge(d.i);
				Backbone.trigger('hoverEdge',d.i);
			})
			// .attr('id', function (d, i) { return 'bar' + i; })
		;

		var scaleX = d3.scale.linear()
			.domain([0, timelist.length])
			.range([0, bandViewWidth]);
		var singleWidth = bandViewWidth / timelist.length;

		this.rect = this.bar.selectAll('rect')
			.data(function(d) {
				return d['d'];
			})
			.enter()
			.append('rect')
			.attr('x', function(d, i) {
				return scaleX(i);
			})
			// .attr('y', function(d,i){return scaleY(i);})
			.attr('width', singleWidth)
			.attr('height', bandHeight)
			.style('fill', function(d) {
				return options.scaleColor2(d);
			});
	},
	changeOrder: function (tieData) {
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
		tieData.sort(function (a, b) { return a.p - b.p; });


		function dist(d, a, b) {
			var i, ret = 0, p, q;
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

			function mean(A) { return numeric.div(numeric.add.apply(null, A), A.length); }
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
			return ret.U.map(function (row) {
				return numeric.mul(row, eigenValues).splice(0, dimensions);
			});
		};
	}
})