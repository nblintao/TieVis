/* global d3 */

var edgeWaveDate = [
  {
    timeID: 0,
    timeName: 'day1',
    edges: [
      [0, 0, 1],
      [0, 1, 2],
      [1, 0, 3],
      [1, 1, 4],
    ]
  },
  {
    timeID: 1,
    timeName: 'day2',
    edges: [
      [0, 0, 1],
      [0, 1, 2],
      [1, 0, 3],
      [1, 1, 4],
    ]
  },
  {
    timeID: 2,
    timeName: 'day3',
    edges: [
      [0, 0, 5],
      [0, 1, 4],
      [1, 0, 6],
      [1, 1, 0],
    ]
  },
  {
    timeID: 3,
    timeName: 'day4',
    edges: [
      [0, 0, 3],
      [0, 1, 4],
      [1, 0, 6],
      [1, 1, 0],
    ]
  },
  {
    timeID: 4,
    timeName: 'day5',
    edges: [
      [0, 0, 5],
      [0, 1, 1],
      [1, 0, 6],
      [1, 1, 1],
    ]
  }
];

var svg = d3.select('body').append('svg')
  .attr('width', innerWidth)
  .attr('height', innerHeight);

var skewsvg = svg.append('g')
  .attr('transform', 'translate(50 200) rotate(-45) ');

var gridSideLength = 200;

var grid = skewsvg.selectAll('g')
  .data(edgeWaveDate)
  .enter().append('g')
  .attr('transform', function (d) {
    var id = d.timeID;
    var odd = id % 2;
    var translateX = Math.floor(id / 2) * gridSideLength;
    var translateY = Math.ceil(id / 2) * gridSideLength;
    var str = 'translate(' + translateX + ' ' + translateY + ')';
    if (odd) {
      // str += 'translate(' + gridSideLength + ' ' + gridSideLength + ') scale(-1 0)';
      str += ' rotate(-90) scale(-1 1)';
    }
    return str;
  });

// grid.append('rect')
//   .attr('width', gridSideLength - 30)
//   .attr('height', gridSideLength - 30)
//   .attr('x', 0)
//   .attr('y', 0);

// grid.append('circle')
//   .attr('r', 10)
//   .attr('cx', 10)
//   .attr('cy', 10)
//   .attr('fill', 'blue');
// grid.append('circle')
//   .attr('r', 10)
//   .attr('cx', 10)
//   .attr('cy', 190)
//   .attr('fill', 'red');
// grid.append('circle')
//   .attr('r', 10)
//   .attr('cx', 190)
//   .attr('cy', 190)
//   .attr('fill', 'yellow');

var nodes = [{ "name": "node1" }, { "name": "node2" }, { "name": "node3" }, { "name": "node4" }];
var nNodes = nodes.length;

var innerGridSideLength = gridSideLength - 30;
var cellOffset = d3.scale.ordinal().rangeBands([0, innerGridSideLength]);
cellOffset.domain(d3.range(nNodes));

var row = grid.selectAll(".row")
  .data(function (d) {

    var matrix = [];
    nodes.forEach(function (node, i) {
      matrix[i] = d3.range(nNodes).map(function (j) { return { x: j, y: i, z: 0 }; });
    });
    d.edges.forEach(function (edge) {
      matrix[edge[0]][edge[1]].z = edge[2];
    });
    // console.log(matrix);
    return matrix;

  })
  .enter().append('g')
  .attr('class', 'row')
  .attr('id', function (d, i) { return 'row' + i; })
  .attr('transform', function (d, i) { return 'translate(0,' + cellOffset(i) + ')'; });


// row.append("line")
//   .attr("x2", width);

row.append("text")
  .attr("x", -2)
  .attr("y", cellOffset.rangeBand() / 2)
  .attr("dy", ".32em")
  .attr("text-anchor", "end")
  .text(function (d, i) { return nodes[i].name; });

var cell = row.selectAll(".cell")
// .data(row.filter(function (d) { return d.z; }))
  .data(function (d) {
    // console.log(d);
    return d;
  })
  .enter().append("rect")
  .attr("class", "cell")
  .attr('id', function (d) { return 'col' + d.x; })
  .attr("x", function (d) { return cellOffset(d.x); })
  .attr("width", cellOffset.rangeBand())
  .attr("height", cellOffset.rangeBand())
  .style("fill", function (d) { return d3.rgb(0, d.z / 7 * 255, 0); })
  .on('mouseover', function (d) {
    // console.log(d);
    //   var fromPoint = d.y;
    //   var toPoint = d.x;
    svg.selectAll('#row' + d.y)
      .selectAll('#col' + d.x)
      .style('fill-opacity', 0.5)
    // .style('stroke-width',10)
      .style('stroke', 'red')
    ;
    // .each(function (c) { c.style('fill-opacity', 0.5); });
  })
  .on('mouseout', function (d) {
    svg.selectAll('#row' + d.y)
      .selectAll('#col' + d.x)
      .style('fill-opacity', 1)
      .style('stroke', '');

  })
  ;