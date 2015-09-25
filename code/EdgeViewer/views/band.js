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
			changeOrder(tieData);
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

		var bandView = this.container;

		var scaleY = d3.scale.linear()
			.domain([0, tieData.length])
			.range([0, bandViewHeight]);

		var bar = bandView.selectAll('g')
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
				hoverEdge(d.i);
			})
			// .attr('id', function (d, i) { return 'bar' + i; })
		;

		var scaleX = d3.scale.linear()
			.domain([0, timelist.length])
			.range([0, bandViewWidth]);
		var singleWidth = bandViewWidth / timelist.length;

		var rect = bar.selectAll('rect')
			.data(function(d) {
				return d['d'];
			})
			.enter()
			.append('rect');

		rect
			.attr('x', function(d, i) {
				return scaleX(i);
			})
			// .attr('y', function(d,i){return scaleY(i);})
			.attr('width', singleWidth)
			.attr('height', bandHeight)
			.style('fill', function(d) {
				return options.scaleColor2(d);
			});
	}
})