var InfoView = Backbone.View.extend({
	initialize: function() {
		// this.html = "<div class = 'col-lg-1' id='tform'  style='width:50%;height:100%; overflow:auto; float:left;' ><form></form></div>" +
		// "<div class = 'col-lg-1' id='subj'  style='width:50%;height:100%; overflow:auto; float:left;' ><form></form></div>";
		this.html = 
		'<p id="temp"></p>' + 
		'<p id="time"></p>'+
		"<div id='tform'  style='width:50%;height:100%; overflow:auto; float:left;' ><form></form></div>" +
		"<div id='subj'  style='width:50%;height:100%; overflow:auto; float:left;' ><form></form></div>";
		Backbone.on("showInfo", this.show_info, this);	
		Backbone.on('hoverEdge', this.showEdgeInfo, this);
		Backbone.on('selectTime',this.showTime, this);
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
		var edge = tieData[i];
		// console.log('hover edge from ' + edge.y + ' to ' + edge.x);
		var info = edge.y + '(' + nodelist[edge.y] + ')' + '->' + edge.x + '(' + nodelist[edge.x] + ') ' + edge.d
		d3.select('#temp').html(info);
		// console.log(info);
	},
	render: function() {
		$(this.el).html(this.html);
	},
	setData: function(occup, mailinfo, mails) {
		this.occupation = occup;
		this.mailinfo = mailinfo;
		this.mails = mails;
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
})