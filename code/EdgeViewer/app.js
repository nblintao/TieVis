var tieVis = {
	start: function() {
		var time = new TimeBar();
		var inter = new InterOption();
		var control = new ControlPanel({
			el: "#toolbox",
			model: inter
		});
		var bipartiteTypes = ['Original', 'CrossReduction'];
		var datasets = ['parse', 'data', 'Enron_Mon'];
		var options = {
			dataset: datasets[2],
			bipartiteType: bipartiteTypes[1],
			doMDS: true,
			thresholdMDS: 500,
			// timelineWidth: 600,
			// timeLeftMargin: 30,
			// rightWidth: 600

		};
		var fullColor;
		switch (options.dataset) {
			case 'parse':
				fullColor = 1000;
				break;
			case 'data':
				fullColor = 1;
			case 'Enron_Mon':
				fullColor = 15;
			default:
				break;
		}
		options.scaleColor = d3.scale.linear()
			.clamp(true)
			.domain([0, fullColor])
			// .range(['rgb(200,200,200)', 'rgb(16,16,16)']);
			.range(['white', '#3a8edb']);
		options.scaleColorHighLight = d3.scale.linear()
			.clamp(true)
			.domain([0, fullColor])
			// .range([d3.hsl(0,0.5,0.5), d3.hsl(0,1,0.5)]);
			// .range(['rgb(255,200,200)', 'rgb(255,0,0)']);
			.range(['white', '#f3a031']);
			
		// options.scaleColor2 = function(d) {
		// 	if (d === 0) {
		// 		return 'white';
		// 	} else {
		// 		return options.scaleColor(d);
		// 	}
		// };
		options.scaleColor3 = function(d, flag) {
			if (d === 0) {
				return 'white';
			}
			// hovered
			if (flag) {
				return options.scaleColorHighLight(d);
			} else
			// unhovered
			{
				return options.scaleColor(d);
			}
		};
		control.render();
		var proj = new ProjectionView({
			el: "#projection"
		}, inter);
		var band = new BandView({
			el: "#band"
		}, inter, options, time);
		var bipartite = new BiPartiteView({
			el: "#bipartite"
		}, inter, options, time);
		var nodelink = new NodeLinkView({
			el: "#nodelink"
		}, inter, options);
		var info = new InfoView({
			el: "#info"
		});
		proj.render();
		//render band before bipartite because of inter.scaleBandBipa
		band.render();
		bipartite.render();
		nodelink.render();
		info.render();
		$('.collapse').collapse();

		d3.json(options.dataset + '/tieDataParallel.json', function(data1) {
			tieData = data1;
			tieData.forEach(function(d, i) {
				d.i = i;
			});
			// console.log(tieData);
			d3.json(options.dataset + '/timelist.json', function(data2) {
				timelist = data2;

                d3.json(options.dataset + "/distance.json", function(dist) {
                    band.setDist(dist);
					
                    // forbidden render overview:					
                    // band.renderData(tieData, timelist);
					
                    d3.json(options.dataset + '/nodelist.json', function(data3) {
                        nodelist = data3;

                        // forbidden render overview:
						// bipartite.renderBipartiteCrossReduction([]);
						
                        // Backbone.trigger('selectEdges',[])
                        // renderBipartite([]);
                        d3.json(options.dataset + '/nodelink.json', function(data4) {
                            nodeLink = data4;
                            nodelink.initializeNodeLinkView(nodelist, nodeLink);
                            nodelink.setData(tieData, nodelist);
                        });
                    });
                });


				//renderBands(tieData, timelist);
			});
		});
		d3.json(options.dataset + '/pcaResult.json', function(pcaResult) {
			proj.renderProjectView(pcaResult);
		});
		d3.json(options.dataset + '/occupation.json', function(occup) {
			// info.setOccupation(dat);
			d3.json(options.dataset + '/mailinfo.json', function(mailinfo) {
				d3.json(options.dataset + '/mails.json', function(mails) {
					info.setData(occup, mailinfo, mails);
				});
			});
		});

		
	}
};