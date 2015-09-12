/* global d3 */
var options = {
  dataset: 'parse'
};
d3.json(options.dataset + '/tieDataParallel.json', function (tieData) {
  d3.json(options.dataset + '/nodelist.json', function (nodelist) {
    d3.json(options.dataset + '/timelist.json', function (timelist) {
      render(tieData, nodelist, timelist);
    });
  });
});

function render(tieData, nodelist, timelist) {
  var bandViewWidth = 200;
  var bandViewHeight = 8000;

  var bandView = d3.select('#bandView').append('svg')
    .attr('width', bandViewWidth)
    .attr('height', bandViewHeight);

  var scaleY = d3.scale.linear()
    .domain([0, tieData.length])
    .range([0, bandViewHeight]);
  var singleHeight = bandViewHeight / tieData.length*0.8;

  var bar = bandView.selectAll('g')
    .data(tieData)
    .enter()
    .append('g')
    .attr('transform',function(d,i){
      return 'translate(0,'+scaleY(i)+')';
    })
    ;

  var scaleX = d3.scale.linear()
    .domain([0, timelist.length])
    .range([0, bandViewWidth]);
  var singleWidth = bandViewWidth / timelist.length;

  var scaleClor = d3.scale.linear()
    .domain([0,1000])
    .range(['white','red']);

  var rect = bar.selectAll('rect')
    .data(function (d) { return d['d']; })
    .enter()
    .append('rect');

  rect
    .attr('x', function(d,i){return scaleX(i);})
    // .attr('y', function(d,i){return scaleY(i);})
    .attr('width',singleWidth)
    .attr('height',singleHeight)
    .style('fill',function(d){return scaleClor(d);})
  ;
};