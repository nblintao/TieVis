var Matrix_ = function(canvas, config) {
	this.canvas = canvas;
	_.extend(this, config)
};

Matrix_.prototype.layout = function(graph) {

	var nodes = graph.getNodes();

    if (nodes.length <= 2) {
    	return nodes
    } else {
        var fv = graph.fiedlerVector(),
            sorted = _.sortBy(nodes, function(nid) {
                return fv[nid];
            });
        return sorted
    }

};
Matrix_.prototype.remove = function() {
    this.canvas.selectAll("*").remove();
}

Matrix_.prototype.render = function(graph) {

	var that = this,
		canvas = this.canvas,
		nodes = this.layout(graph);
    var labelGroup = canvas.append("g").attr("id", "mouseLabel");
    labelGroup.append("text");
	var nodeIndices = {},
		i = -1;
	while(++i < nodes.length) {
		nodeIndices[nodes[i]] = i;
	}

	//render matrix cells
    var size = this.geometry.cellSize,
    	padding = this.geometry.padding,
    	range = this.visual.color.range,
    	colorRamp = config.general.colorRamp.RdYlBl,
        colorField = this.visual.color.field;


    range.interval = range.end - range.begin;

  	var rows = canvas.selectAll('.row')
    	.data(nodes, _.identity);
    rows.enter().append('g')
    	.attr('class', 'row');
    rows.exit().remove();

    rows.each(function(n, i) {
        var cells = d3.select(this).selectAll('.cell')
            .data(graph.adjacents(n), _.identity);
        cells.enter().append('rect')
            .attr('class', 'cell');
        cells.attr('x', function(e, j) { return nodeIndices[graph.neighbor(n, e)] * (size + padding);})
            .attr('y', function(e, j) {return i * (size + padding);})
            .attr('width', size).attr('height', size)
            .attr('fill', function(e, j) {
                var w = 1;
                if (graph.link(e).attrs[colorField] !== undefined) {
                    w = graph.link(e).attrs[colorField]
                }
                //console.info(w)
                var cidx = Math.floor((w - range.begin) / range.interval * colorRamp.length);
                cidx = (cidx >= colorRamp.length ? (colorRamp.length - 1): cidx);
                return "#" + colorRamp[cidx].toHex();
            })
            .attr('stroke', '#333');
        cells.exit().remove();
        cells.on("mouseover", function(d) {
            //console.log(graph.link(this.id));
            var edge = graph.link(d);
            var key = edge.source + "," + edge.target;
            var text = d3.select("#mouseLabel").selectAll("text").data([d]);
            text.text(key)
            .attr('x', nodeIndices[graph.neighbor(n, d)] * (size + padding))
            .attr('y', i * (size + padding));
        cells.on("mouseout", function(d) {
            var text = d3.select("#mouseLabel").selectAll("text").data([""]);
            key = "";
            text.text(key)
                .attr('x', nodeIndices[graph.neighbor(n, d)] * (size + padding))
                .attr('y', i * (size + padding));
        })
            //text.exit().remove();
        });
    });

    //render node labels
    var labelField = this.visual.label.field || 'id';
    var labels = canvas.selectAll('.node_label')
    	.data(nodes, _.identity);
    labels.enter().append('text')
    	.text(function(nid){return labelField === 'id' ? nid : graph.getNodeAttr(labelField, nid);});
    labels.attr('x', nodes.length * (size + padding))
    	.attr('y', function(d, i) {return i * (size + padding) + size;});
    labels.exit().remove();

    //render node attributes
    



};

