/* global d3 */
var options = {
  dataset: 'parse'
};

var selectedEdges = [];

d3.json(options.dataset + '/tieDataParallel.json', function (tieData) {
  d3.json(options.dataset + '/nodelist.json', function (nodelist) {
    d3.json(options.dataset + '/timelist.json', function (timelist) {
      render(tieData, nodelist, timelist);
    });
  });
});

d3.json(options.dataset + '/pcaResult.json', function (pcaResult) {
  renderProjectView(pcaResult);
});

function renderProjectView(pcaResult) {
  var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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

  var svg = d3.select("#projectView").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var data = pcaResult;

  x.domain(d3.extent(data, function (d) { return d[0]; })).nice();
  y.domain(d3.extent(data, function (d) { return d[1]; })).nice();

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
  
  var gDots = svg.append('g')
    .attr('class','dots');
  
  var dots = gDots.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr('id',function(d,i){return 'dot'+i;})
    .attr("r", 3.5)
    .attr("cx", function (d) { return x(d[0]); })
    .attr("cy", function (d) { return y(d[1]); });


  var brush = svg.append("g")
      .attr("class", "brush")
      .call(d3.svg.brush()
        .x(x)
        .y(y)
        .on("brushend", function() {
          var extent = d3.event.target.extent();
          selectedEdges = [];
          dots.classed("selected", function(d,i) {
            var flag = extent[0][0] <= d[0] && d[0] < extent[1][0] && extent[0][1] <= d[1] && d[1] < extent[1][1];
            if(flag){
              selectedEdges.push(i);
            }
            return flag;
          });
          console.log(selectedEdges);
        }));


  var legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

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
    .text(function (d) { return d; });


}


function render(tieData, nodelist, timelist) {
  var bandViewWidth = 200;
  var bandViewHeight = 8000;

  var bandView = d3.select('#bandView').append('svg')
    .attr('width', bandViewWidth)
    .attr('height', bandViewHeight);

  var scaleY = d3.scale.linear()
    .domain([0, tieData.length])
    .range([0, bandViewHeight]);
  var singleHeight = bandViewHeight / tieData.length * 0.8;

  var bar = bandView.selectAll('g')
    .data(tieData)
    .enter()
    .append('g')
    .attr('transform', function (d, i) {
      return 'translate(0,' + scaleY(i) + ')';
    })
    .attr('id', function (d, i) { return 'bar' + i; })
    ;

  var scaleX = d3.scale.linear()
    .domain([0, timelist.length])
    .range([0, bandViewWidth]);
  var singleWidth = bandViewWidth / timelist.length;

  var scaleClor = d3.scale.linear()
    .domain([0, 1000])
    .range(['white', 'red']);

  var rect = bar.selectAll('rect')
    .data(function (d) { return d['d']; })
    .enter()
    .append('rect');

  rect
    .attr('x', function (d, i) { return scaleX(i); })
  // .attr('y', function(d,i){return scaleY(i);})
    .attr('width', singleWidth)
    .attr('height', singleHeight)
    .style('fill', function (d) { return scaleClor(d); })
  ;
};