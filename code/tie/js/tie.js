/* global numeric */
/* global d3 */

var datasets = ['parse', 'tiedata'];
var bipartiteTypes = ['Original', 'CrossReduction'];
var options = {
  dataset: datasets[1],
  bipartiteType: bipartiteTypes[1],
  doMDS: true,
  thresholdMDS: 500,
  timelineWidth: 600,
  timeLeftMargin: 30,
  rightWidth: 600

};

var fullColor;
switch (options.dataset) {
  case 'parse':
    fullColor = 1000;
    break;
  case 'tiedata':
    fullColor = 1;
  default:
    break;
}
var scaleColor = d3.scale.linear()
  .domain([0, fullColor])
  .range(['rgb(200,200,200)', 'rgb(16,16,16)']);

var scaleColor2 = function (d) {
  if (d === 0) {
    return 'white';
  } else {
    return scaleColor(d);
  }
};

var selectedEdges = [];
var tieData, timelist, nodelist, nodeLink;
var links;

d3.json(options.dataset + '/tieDataParallel.json', function (data1) {
  tieData = data1;
  d3.json(options.dataset + '/timelist.json', function (data2) {
    timelist = data2;
    d3.json(options.dataset + '/nodelist.json', function (data3) {
      nodelist = data3;
      // renderBipartite([]);
      d3.json(options.dataset + '/nodelink.json', function (data4) {
        nodeLink = data4;
        initializeNodeLinkView(nodelist, nodeLink);
      });
    });
    renderBands(tieData, timelist);
  });
});



d3.json(options.dataset + '/pcaResult.json', function (pcaResult) {
  renderProjectView(pcaResult);
});

function renderBipartite(data) {
  switch (options.bipartiteType) {
    case 'Original':
      renderBipartiteOriginal(data);
      break;
    case 'CrossReduction':
      renderBipartiteCrossReduction(data);
    default:
      break;
  }
}

function renderBipartiteCrossReduction(data) {
  // find related nodes
  var relatedNodes = new Set();
  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    for (var j = 0; j < d.d.length; j++) {
      relatedNodes.add(d.x);
      relatedNodes.add(d.y);
    }
  }
  // console.log(relatedNodes);
  var nNodes = relatedNodes.size;
  var periods = timelist.length;
  var nodeOrder = new Array(periods + 1);
  
  // shuffle for the first line
  nodeOrder[0] = [];
  for (var entry of relatedNodes) {
    nodeOrder[0].push(entry);
    // console.log(entry);
  }
  nodeOrder[0].sort(function (a, b) { return Math.random() > .5 ? -1 : 1; });
  console.log(nodeOrder[0]);
  
  // calculate order for each line
  for (var step = 0; step < periods; step++) {
    nodeOrder[step + 1] = new Array(nNodes);
    var info = {};
    for (var i = 0; i < data.length; i++) {
      var t = data[i];
      if (t.d[step] === 0) {
        continue;
      } else {
        // console.log(t);
        if (!info[t.x]) {
          info[t.x] = [];
        }
        info[t.x].push(t.y);
      }
    }
    // console.log(info);
    // find position for each end point
    for (var key in info) {
      if (info.hasOwnProperty(key)) {
        var element = info[key];
        var posList = [];
        for (var it in element) {
          posList.push(nodeOrder[step].indexOf(element[it]));
        }
        var bestPos = Math.floor(d3.median(posList));
        // console.log('best', bestPos, posList);
        var offset = 0;
        var pos;
        while (true) {
          pos = bestPos - offset;
          if (pos >= 0 && pos < nNodes && !nodeOrder[step + 1][pos]) {
            break;
          }
          offset += 1;
          pos = bestPos + offset;
          if (pos >= 0 && pos < nNodes && !nodeOrder[step + 1][pos]) {
            break;
          }
        }
        nodeOrder[step + 1][pos] = +key;
        // console.log(pos);
      }
    }
    
    //add other data
    var blankPos = 0;
    for (var i = 0; i < nodeOrder[0].length; i++) {
      var e = nodeOrder[0][i];
      if (nodeOrder[step + 1].indexOf(e) === -1) {
        while (nodeOrder[step + 1][blankPos]) {
          blankPos++;
        }
        nodeOrder[step + 1][blankPos] = e;
      }

    }
    console.log(nodeOrder[step + 1]);
  }
  
  // start rendering
  var margin = { top: 10, right: 10, bottom: 10, left: options.timeLeftMargin },
    // width = 800 - margin.left - margin.right,
    width = options.timelineWidth,
    height = 350 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
    .rangePoints([0, width], 1)
    .domain(d3.range(timelist.length + 1));
  // different !!!
  var oldY = d3.scale.linear()
    .domain([0, nNodes - 1])
    .range([height, 0]);
  var y = function (value, step) {
    console.log(nodeOrder[step].indexOf(value));
    return oldY(nodeOrder[step].indexOf(value));
  };
  
  // // same order for each line
  // var y = function (value, step) {
  //   console.log(nodeOrder[0].indexOf(value));
  //   return oldY(nodeOrder[0].indexOf(value));
  // };
  d3.select("#bipartiteView").selectAll('svg').remove();

  var svg = d3.select("#bipartiteView").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add an axis and title.
  var axis = d3.svg.axis()
    .scale(oldY)
    .orient("left");
  svg.append("g")
    .attr("class", "axis")
    .call(axis)
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function (d) { return d; });

  var edge = svg.selectAll('.edge')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'edge');

  var line = edge.selectAll('line')
    .data(function (d) {
      var r = [];
      for (var i = 0; i < d.d.length; i++) {
        r.push({ 'd': d.d[i], 'x': d.x, 'y': d.y });
      }
      return r;
    })
    .enter()
    .append('line')
    .attr('x1', function (d, i) { return x(i); })
    .attr('x2', function (d, i) { return x(i + 1); })
    .attr('y1', function (d, i) { return y(d.y, i); })
    .attr('y2', function (d, i) { return y(d.x, i + 1); })
    .style('stroke', function (d) { return scaleColor(d.d); })
    ;

}

function renderBipartiteOriginal(data) {

  var margin = { top: 10, right: 10, bottom: 10, left: 30 },
    width = 800 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
    .rangePoints([0, width], 1)
    .domain(d3.range(timelist.length + 1));
  var y = d3.scale.linear()
    .domain([0, nodelist.length])
    .range([height, 0]);

  d3.select("#bipartiteView").selectAll('svg').remove();

  var svg = d3.select("#bipartiteView").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add an axis and title.
  var axis = d3.svg.axis()
    .scale(y)
    .orient("left");
  svg.append("g")
    .attr("class", "axis")
    .call(axis)
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function (d) { return d; });

  var edge = svg.selectAll('.edge')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'edge');

  var line = edge.selectAll('line')
    .data(function (d) {
      var r = [];
      for (var i = 0; i < d.d.length; i++) {
        r.push({ 'd': d.d[i], 'x': d.x, 'y': d.y });
      }
      return r;
    })
    .enter()
    .append('line')
    .attr('x1', function (d, i) { return x(i); })
    .attr('x2', function (d, i) { return x(i + 1); })
    .attr('y1', function (d, i) { return y(d.y); })
    .attr('y2', function (d, i) { return y(d.x); })
    .style('stroke', function (d) { return scaleColor(d.d); })
    ;


}


function renderProjectView(pcaResult) {
  var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    // width = 800 - margin.left - margin.right,
    width = options.rightWidth - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

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

  var data = pcaResult;

  x.domain(d3.extent(data, function (d) { return d[0]; })).nice();
  y.domain(d3.extent(data, function (d) { return d[1]; })).nice();

  var zoom = d3.behavior.zoom()
    .x(x)
    .y(y)
  // .scaleExtent([1, 10])
    .on("zoom", zoomed);

  var svg = d3.select("#projectView").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom)
  // http://stackoverflow.com/questions/13713528/how-to-disable-pan-for-d3-behavior-zoom
    .on("mousedown.zoom", null);

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

  svg.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  var gDots = svg.append('g')
    .attr('class', 'dots')
    .attr("clip-path", "url(#clip)");

  var dots = gDots.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr('id', function (d, i) { return 'dot' + i; })
    .attr("r", 3.5)
    .attr("cx", function (d) { return x(d[0]); })
    .attr("cy", function (d) { return y(d[1]); });

  function zoomed() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);

    // gDots.selectAll('circle').attr("transform", function (d) {
    //   return "translate(" + x(d[0]) + "," + y(d[1]) + ")";
    // });
    
    gDots.selectAll('circle')
      .attr("cx", function (d) { return x(d[0]); })
      .attr("cy", function (d) { return y(d[1]); });
  }


  var brush = svg.append("g")
    .attr("class", "brush")
    .call(d3.svg.brush()
      .x(x)
      .y(y)
      .on("brushend", function () {
        var extent = d3.event.target.extent();
        selectedEdges = [];
        dots.classed("selected", function (d, i) {
          var flag = extent[0][0] <= d[0] && d[0] < extent[1][0] && extent[0][1] <= d[1] && d[1] < extent[1][1];
          if (flag) {
            selectedEdges.push(i);
          }
          return flag;
        });
        // console.log(selectedEdges);
        renderSelectedEdges(selectedEdges);
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

function renderSelectedEdges(idList) {
  var selectedTieData = [];
  for (var i = 0; i < idList.length; i++) {
    var id = idList[i];
    selectedTieData.push(tieData[id]);
  }
  console.log(idList, selectedTieData);
  renderBands(selectedTieData, timelist);
  renderBipartite(selectedTieData);
  renderLinks(idList);
}

function renderLinks(idList) {
  links.classed("selected", function (d) {
    return idList.indexOf(d.id) !== -1;
  });
}

function changeOrder(tieData) {
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

function renderBands(tieData, timelist) {
  var nBands = tieData.length;

  if (options.doMDS && nBands > 2 && nBands < options.thresholdMDS) {
    console.log('Doing MDS to ' + nBands + ' bands');
    changeOrder(tieData);
  }
  // else{
  //   console.log('No MDS to ' + nBands + ' bands');    
  // }
  // console.log(tieData);
  d3.select('#bandView').selectAll('svg').remove();

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
  }
  else if (bandHeight > bandHeightMax) {
    bandHeight = bandHeightMax;
  }

  bandViewHeight = (bandHeight + interBandHeight) * nBands;

  var bandView = d3.select('#bandView').append('svg')
    .attr('width', bandViewWidth + options.timeLeftMargin)
    .attr('height', bandViewHeight)
    .append('g')
    .attr("transform", "translate(" + options.timeLeftMargin + ",0)");

  var scaleY = d3.scale.linear()
    .domain([0, tieData.length])
    .range([0, bandViewHeight]);

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

  var rect = bar.selectAll('rect')
    .data(function (d) { return d['d']; })
    .enter()
    .append('rect');

  rect
    .attr('x', function (d, i) { return scaleX(i); })
  // .attr('y', function(d,i){return scaleY(i);})
    .attr('width', singleWidth)
    .attr('height', bandHeight)
    .style('fill', function (d) { return scaleColor2(d); })
  ;
};

function initializeNodeLinkView(nodelist, nodeLink) {
  var width = options.rightWidth,
    height = 350;
    
  // var color = d3.scale.category20();
  
  var nodeNameList = [];
  for (var i = 0; i < nodelist.length; i++) {
    var t = nodelist[i];
    nodeNameList.push({ 'name': t });

  }
  
  // console.log(nodeNameList, nodeLink);
  var force = d3.layout.force()
    .charge(-80)
    .linkDistance(50)
    .size([width, height]);

  var svg = d3.select("#nodeLinkView").append("svg")
    .attr("width", width)
    .attr("height", height);

  force
    .nodes(nodeNameList)
    .links(nodeLink)
    .start();

  links = svg.selectAll(".link")
    .data(nodeLink)
    .enter().append("line")
    .attr("class", "link")
    .style("stroke-width", function (d) { return Math.sqrt(d.value); })
    .attr('id', function (d) { return 'f' + d.source.index + 't' + d.target.index; })
    .each(function (d, i) { d.id = i; });

  var node = svg.selectAll(".node")
    .data(nodeNameList)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 5)
  // .style("fill", function (d) { return color(d.group); })
    .call(force.drag);

  node.append("title")
    .text(function (d) { return d.name; });

  force.on("tick", function () {
    links.attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    node.attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; });
  });

}