/* global d3 */

// var edgeWaveData_old = [
//   {
//     timeID: 0,
//     timeName: 'day1',
//     edges: [
//       [0, 0, 1],
//       [0, 1, 2],
//       [1, 0, 3],
//       [1, 1, 4],
//     ]
//   },
//   {
//     timeID: 1,
//     timeName: 'day2',
//     edges: [
//       [0, 0, 1],
//       [0, 1, 2],
//       [1, 0, 3],
//       [1, 1, 4],
//     ]
//   },
//   {
//     timeID: 2,
//     timeName: 'day3',
//     edges: [
//       [0, 0, 5],
//       [0, 1, 4],
//       [1, 0, 6],
//       [1, 1, 0],
//     ]
//   },
//   {
//     timeID: 3,
//     timeName: 'day4',
//     edges: [
//       [0, 0, 3],
//       [0, 1, 4],
//       [1, 0, 6],
//       [1, 1, 0],
//     ]
//   },
//   {
//     timeID: 4,
//     timeName: 'day5',
//     edges: [
//       [0, 0, 5],
//       [0, 1, 1],
//       [1, 0, 6],
//       [1, 1, 1],
//     ]
//   }
// ];

// var nodes = [{ "name": "node1" }, { "name": "node2" }, { "name": "node3" }, { "name": "node4" }];

var options = {
  matrixwave: true,
  // dataset: 'smalldata'
  dataset: 'largedata'
};

d3.json(options.dataset + '/edgeWaveData.json', function (edgeWaveData) {
  d3.json(options.dataset + '/nodelist.json', function (nodelist) {
    d3.json(options.dataset + '/details.json', function (details) {
      // console.log(edgeWaveData);
      render(edgeWaveData, nodelist, details);
    });
  });
});

function render(edgeWaveData, nodelist, details) {
  var svg = d3.select('#timeView').append('svg')
    .attr('width', innerWidth * 6)
    .attr('height', innerHeight * 2);

  var skewsvg = svg.append('g')
    .attr('transform', function () {
      if (options.matrixwave) {
        return 'translate(50 200) rotate(-45) ';
      }
      else {
        return 'translate(50 0)';
      }
    });

  var gridSideLength = 400;

  var grid = skewsvg.selectAll('g')
    .data(edgeWaveData)
    .enter().append('g')
    .attr('transform', function (d) {
      var id = d.timeID;
      if (options.matrixwave) {
        var odd = id % 2;
        var translateX = Math.floor(id / 2) * gridSideLength;
        var translateY = Math.ceil(id / 2) * gridSideLength;
        var str = 'translate(' + translateX + ' ' + translateY + ')';
        if (odd) {
          // str += 'translate(' + gridSideLength + ' ' + gridSideLength + ') scale(-1 0)';
          str += ' rotate(-90) scale(-1 1)';
        }
        return str;
      }
      else {
        return 'translate(' + id * gridSideLength + ' 0)';
      }
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

  var nNodes = nodelist.length;

  var innerGridSideLength = gridSideLength - 30;
  var cellOffset = d3.scale.ordinal().rangeBands([0, innerGridSideLength]);
  cellOffset.domain(d3.range(nNodes));

  var row = grid.selectAll(".row")
    .data(function (d) {

      // var matrix = [];
      // nodelist.forEach(function (node, i) {
      //   matrix[i] = d3.range(nNodes).map(function (j) { return { x: j, y: i, z: 0 }; });
      // });
      // d.edges.forEach(function (row,irow) {
      //   row.forEach(function(col,icol){
      //     matrix[irow][icol].z = col;
      //   });
      //   // matrix[edge[0]][edge[1]].z = edge[2];
      // });
      // // console.log(matrix);
      // return matrix;
      return d.edges;

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
    .attr("dy", ".16em")
    .attr("text-anchor", "end")
  // .attr('font','courier new')
    .attr('font-family', 'monospace')
    .text(function (d, i) { return nodelist[i].substring(0, 4); });

  var cell = row.selectAll(".cell")
    .data(function (row) {
      // Donnot have to use the filter anymore, actucally
      return row.filter(function (d) {
        // console.log(d);
        return (d.i !== -1);
      });
    })
  // .data(function (d,i) {
  //   // console.log(d);
  //   return d;
  // })
    .enter().append("rect")
    .attr("class", "cell")
    .attr('id', function (d) { return 'col' + d.x; })
    .attr("x", function (d) { return cellOffset(d.x); })
    .attr("width", cellOffset.rangeBand())
    .attr("height", cellOffset.rangeBand())
    // .style("fill", function (d) { return d3.rgb(0, d.v / 100 * 255, 0); })
    .style("fill", function (d) { return d3.hsl(120,d.v/50,0.5); })
    .on('mouseover', function (d) {
      //   var fromPoint = d.y;
      //   var toPoint = d.x;
      svg.selectAll('#row' + d.y)
        .selectAll('#col' + d.x)
        .style('fill-opacity', 0.5)
      // .style('stroke-width',10)
        .style('stroke', 'red')
      ;
      // .each(function (c) { c.style('fill-opacity', 0.5); });
      
      var kdeData = details[d.i];
      // console.log(kdeData);
      renderKDE(kdeData);
    })
    .on('mouseout', function (d) {
      svg.selectAll('#row' + d.y)
        .selectAll('#col' + d.x)
        .style('fill-opacity', 1)
        .style('stroke', '');

    })
    ;
};

// renderKDE();

// reference: http://bl.ocks.org/mbostock/4341954
function renderKDE(faithful) {
  var margin = { top: 20, right: 30, bottom: 30, left: 40 },
    width = 500 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  var x = d3.scale.linear()
  // .domain([30, 110])
    .domain([d3.min(faithful), d3.max(faithful)])
    .range([0, width]);
  // console.log([d3.min(faithful), d3.max(faithful)])
  var y = d3.scale.linear()
    .domain([0, .1])
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format("%"));

  var line = d3.svg.line()
    .x(function (d) { return x(d[0]); })
    .y(function (d) { return y(d[1]); });

  var histogram = d3.layout.histogram()
    .frequency(false)
    .bins(x.ticks(40));


  var svg = d3.select("#kdeView");
  svg.selectAll('svg').remove();
  svg = svg.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text("Impact");

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  // var faithful = [79, 54, 74, 62, 85, 55, 88, 85, 51, 85, 54, 84, 78, 47, 83, 52, 62, 84, 52, 79, 51, 47, 78, 69, 74, 83, 55, 76, 78, 79, 73, 77, 66, 80, 74, 52, 48, 80, 59, 90, 80, 58, 84, 58, 73, 83, 64, 53, 82, 59, 75, 90, 54, 80, 54, 83, 71, 64, 77, 81, 59, 84, 48, 82, 60, 92, 78, 78, 65, 73, 82, 56, 79, 71, 62, 76, 60, 78, 76, 83, 75, 82, 70, 65, 73, 88, 76, 80, 48, 86, 60, 90, 50, 78, 63, 72, 84, 75, 51, 82, 62, 88, 49, 83, 81, 47, 84, 52, 86, 81, 75, 59, 89, 79, 59, 81, 50, 85, 59, 87, 53, 69, 77, 56, 88, 81, 45, 82, 55, 90, 45, 83, 56, 89, 46, 82, 51, 86, 53, 79, 81, 60, 82, 77, 76, 59, 80, 49, 96, 53, 77, 77, 65, 81, 71, 70, 81, 93, 53, 89, 45, 86, 58, 78, 66, 76, 63, 88, 52, 93, 49, 57, 77, 68, 81, 81, 73, 50, 85, 74, 55, 77, 83, 83, 51, 78, 84, 46, 83, 55, 81, 57, 76, 84, 77, 81, 87, 77, 51, 78, 60, 82, 91, 53, 78, 46, 77, 84, 49, 83, 71, 80, 49, 75, 64, 76, 53, 94, 55, 76, 50, 82, 54, 75, 78, 79, 78, 78, 70, 79, 70, 54, 86, 50, 90, 54, 54, 77, 79, 64, 75, 47, 86, 63, 85, 82, 57, 82, 67, 74, 54, 83, 73, 73, 88, 80, 71, 83, 56, 79, 78, 84, 58, 83, 43, 60, 75, 81, 46, 90, 46, 74];

  var data = histogram(faithful),
    kde = kernelDensityEstimator(epanechnikovKernel(7), x.ticks(100));

  svg.selectAll(".bar")
    .data(data)
    .enter().insert("rect", ".axis")
    .attr("class", "bar")
    .attr("x", function (d) { return x(d.x) + 1; })
    .attr("y", function (d) { return y(d.y); })
    .attr("width", x(data[0].dx + data[0].x) - x(data[0].x) - 1)
    .attr("height", function (d) { return height - y(d.y); });

  svg.append("path")
    .datum(kde(faithful))
    .attr("class", "line")
    .attr("d", line);


  function kernelDensityEstimator(kernel, x) {
    return function (sample) {
      return x.map(function (x) {
        return [x, d3.mean(sample, function (v) { return kernel(x - v); })];
      });
    };
  }

  function epanechnikovKernel(scale) {
    return function (u) {
      return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
    };
  }

}