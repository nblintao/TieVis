var d3render = function (d3, icoord, iedges) {

	// var width = 8000;
	// var height = 1500;
	var width = window.innerWidth - 25;
	var height = window.innerHeight - 25;
	var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height);
 
 
	// d3.json('data/icoord.js',function(link){
	//     d3.json('data/iedge.js',function(node){
 
	var start = new Date();
	console.log("start timing");

	function TimerPoint(desc) {
		var now = new Date();
		console.log(desc + ': ' + (now.getTime() - start.getTime()) + ' ms');
		start = now;
	}
	/*************************************************/

	var xcoord = icoord.map(function (d) { return d[0] });
	var ycoord = icoord.map(function (d) { return d[1] });
	// console.log(xcoord,ycoord);
	var maxx = Math.max.apply(null, xcoord),
		minx = Math.min.apply(null, xcoord),
		scax = width / (maxx - minx),
		maxy = Math.max.apply(null, ycoord),
		miny = Math.min.apply(null, ycoord),
		scay = height / (maxy - miny);
            
	// console.log(two.width);
	TimerPoint('Get Scale');
            
            
	/*************************************************/

	svg.selectAll(".link")
		.data(iedges)
		.enter().append("line")
		.attr("class", "link")
	// .style("stroke-width", function (d) { return Math.sqrt(d.value); });
		.attr('x1', function (d) { return scax * (icoord[d[0]][0] - minx) })
		.attr('y1', function (d) { return scay * (icoord[d[0]][1] - miny) })
		.attr('x2', function (d) { return scax * (icoord[d[1]][0] - minx) })
		.attr('y2', function (d) { return scay * (icoord[d[1]][1] - miny) });

	TimerPoint('Move Lines');
	/*************************************************/
	svg.selectAll(".node")
		.data(icoord)
		.enter().append("circle")
		.attr("class", "node")
		.attr("r", 5)
		.style("fill", "red")
		.attr("cx", function (d) { return scax * (d[0] - minx) })
		.attr("cy", function (d) { return scay * (d[1] - miny) });


	TimerPoint('Move Circles');
            
	/*************************************************/
	TimerPoint('Update');


}
