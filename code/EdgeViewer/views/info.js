var InfoView = Backbone.View.extend({
	initialize: function() {
		// this.html = "<div class = 'col-lg-1' id='tform'  style='width:50%;height:100%; overflow:auto; float:left;' ><form></form></div>" +
		// "<div class = 'col-lg-1' id='subj'  style='width:50%;height:100%; overflow:auto; float:left;' ><form></form></div>";
		// this.html = 
		// '<p id="temp"></p>' + 
		// '<p id="time"></p>'+
		// "<div id='tform'  style='width:50%;height:100%; overflow:auto; float:left;' ><form></form></div>" +
		// "<div id='subj'  style='width:50%;height:100%; overflow:auto; float:left;' ><form></form></div>";
		Backbone.on("showInfo", this.showInfo, this);	
		Backbone.on('hoverEdge', this.showEdgeInfo, this);
		Backbone.on('selectTime',this.showCollapse, this);
	},
	showTime: function (t) {
		var timeinfo;
		if (t >= timelist.length) {
			timeinfo = 'Period Not Exist';
		} else {
			timeinfo = 'Period ' + t + ': ' + timelist[t];
		}
		d3.select('#time').html(timeinfo);
	},
	showEdgeInfo: function (i) {
		// var edge = tieData[i];
		// var info = edge.y + '(' + nodelist[edge.y] + ')' + '->' + edge.x + '(' + nodelist[edge.x] + ') ' + edge.d
		// d3.select('#temp').html(info);
		this.hovered = i;
		// $('.collapse').collapse('hide');
		// $('#collapse'+i).collapse('show');
		this.headings
			.style('padding', '0px 5px')
			.style('background-color','#f5f5f5');
			
		d3.select('#heading'+i)
			.style('padding', '10px 5px')
			.style('background-color','#ddd');
	},
	showCollapse: function(){
		$('.collapse').collapse('hide');
		$('#collapse'+this.hovered).collapse('toggle');
	},
	render: function() {
		// $(this.el).html(this.html);
	},
	setData: function(occup, mailinfo, mails) {
		this.occupation = occup;
		this.mailinfo = mailinfo;
		this.mails = mails;
	},
	showInfo: function(dat){
		var occupation = this.occupation;
		var mailinfo = this.mailinfo;
		var mails = this.mails;
				
		dat = dat.map(function(dd,i) {
			var d = tieData[dd];
			return {
				i: i,
				no: dd,
				data: d,
				s:{
					occu: occupation[nodelist[d['y']]] || 'N/A',
					id: d['y'],
					name: nodelist[d['y']]
				},
				t:{
					occu: occupation[nodelist[d['x']]] || 'N/A',
					id: d['x'],
					name: nodelist[d['x']]
				}
			};
		});
		// console.log(dat);
		
		var accordion = d3.select('#accordion');
		accordion.selectAll('div').remove();
		var edge = accordion.selectAll('div')
			.data(dat)
			.enter()
			.append('div')
			.attr('class','panel panel-default');

		this.headings = edge.append('div')
			.attr('class', 'panel-heading')
			.attr('role', 'tab')
			.attr('id', function (d) { return 'heading' + d.no; })
		
		this.headings
			.append('div')
			.attr('class', 'panel-title')
			
			.append('a')
			.attr('role', 'button')
			.attr('data-toggle', 'collapse')
			.attr('data-parent', '#accordion')
			.attr('href', function (d) { return '#collapse' + d.no; })
			.attr('aria-expanded', 'false')
			.attr('class', 'collapsed')
			.attr('aria-controls', function (d) { return 'collapse' + d.no; })
			
			// .append('font')
			// .attr('size','12px')
			
			.append('table')
			.attr('width','100%')
			.style('font-size','small')
			.style('table-layout','fixed')
			
			.append('tbody')
			
			.append('tr')
			
			.selectAll('td')
			.data(function (d) { return [d.s.name, d.t.name]; })
			.enter()
			.append('td')
			.html(function (d, i) {
				var str = '<span class="glyphicon ';
				if (i === 0) {
					str += 'glyphicon-log-out';
				}
				else if (i === 1) {
					str += 'glyphicon-log-in';
				}
				str += '" aria-hidden="true"></span>';
				str += ' ' + d;
				return str;
			});
			// .html(function(d){
			// 	return d.s.name + 
			// 	// '<span class="label label-default">'+d.s.occu+'</span>'+
			// 	'&nbsp;<span class="glyphicon glyphicon-send" aria-hidden="true"></span>&nbsp;&nbsp;' + 
			// 	d.t.name;
			// 	// '<span class="label label-default">'+d.t.occu+'</span>';
				
			// });
		
		var content = edge.append('div')
			.attr('id', function (d) { return 'collapse' + d.no; })
			.attr('class', 'panel-collapse collapse')
			.attr('role', 'tabpanel')
			.attr('aria-labelledby', function (d) { return 'heading' + d.no; })
			.append('div')
			.attr('class', 'panel-body');
			
		content
			.html(function (d) {
				return '<b>Sender: </b><br/>' +
					d.s.name + //'<br/>' +
					'<span class="label label-default">' + d.s.occu + '</span>' + '<br/>' +
					'<b>Receiver: </b><br/>' +
					d.t.name + //'<br/>' +
					'<span class="label label-default">' + d.t.occu + '</span>';
			});			
			
		content
		.append('div')
		.append('ul')
		.selectAll('li')
		.data(function(d){
			return mailinfo[d.no].d.map(function (d) {
				return mails[d];
			}).slice(0, 10); // show 10 emails only
		})
		.enter()
		.append('li')
		.html(function(d){
			return d.subject;
		})
		.on('click',function(d){
			alert(d.body);	
		});

		// $('.panel-group').on('shown.bs.collapse', function (e) {
		// 	var offset = $('.panel.panel-default > .panel-collapse.in').offset();
		// 	if (offset) {
		// 		$('#infopanel').animate({
		// 			scrollTop: $('.panel-collapse.in').siblings('.panel-heading').offset().top
		// 		}, 500);
		// 	}
		// });
		// $('.collapse').collapse();	
		
	},
	show_info: function(dat) {
		var occupation = this.occupation;
		var mailinfo = this.mailinfo;
		var mails = this.mails;
		var t = d3.select("#tform");
		t.select("form").remove();
		var ff = t.append("form");
		dat.forEach(function(dd) {
			var f = ff.append("div").attr("No", dd);
			var d = tieData[dd];
			var t = occupation[nodelist[d['y']]];
			f.data(d);
			if (t == null) t = 'N/A';
			f.append("b").text("source:")
			f.append("label").text(d['y'] + ": " + nodelist[d['y']] + ";");
			f.append("br");
			f.append("b").text("occupation:")
			f.append("label").text(t);
			f.append("br");
			t = occupation[nodelist[d['x']]];
			if (t == null) t = 'N/A';
			f.append("b").text("target:");
			f.append("label").text(d['x'] + ": " + nodelist[d['x']] + ";");
			f.append("br");
			f.append("b").text("occupation:")
			f.append("label").text(t);
			f.append("hr");

			f.on("click", function() {
				var cur = d3.select(this);
				var p = cur.attr("No");
				var s = d3.select("#subj");
				s.select("form").remove();
				var ff = s.append("form");
				mailinfo[p].d.forEach(function(d) {
					var f = ff.append("div");
					var q = mails[d];
					f.append("label").text(q.subject);
					f.append("hr");
					f.on("click", function() {
						alert(q.body);
					});
				});
			});
		});
	}
});