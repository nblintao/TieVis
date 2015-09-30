var ControlPanel = Backbone.View.extend({
	initialize:function() {
		this.html = '<div class="btn-group-vertical btn-group-sm" role="group">'+
				'<button type="button" class="btn btn-default" aria-label="Left Align" id = "brush" data-toggle="button">'+
	 				'<span class="glyphicon glyphicon-screenshot" aria-hidden="true"></span>' +
				'</button>' +
				'<button type="button" class="btn btn-default" aria-label="Left Align" id = "stick" data-toggle="button">' +
	 				'<span class="glyphicon glyphicon-pushpin" aria-hidden="true"></span>' +
				'</button>' +				
			'</div>' +
			'<p id="temp"></p>' + // TODO: Sidong, please move the showEdgeInfo to infopanel on the right side
			 '<p id="time"></p>'
			;
		Backbone.on('hoverEdge', this.showEdgeInfo, this);
		Backbone.on('selectTime',this.showTime, this);
	},
	showTime:function(t){
		var timeinfo;
		if(t>=timelist.length){
			timeinfo = 'Period Not Exist';
		}else{
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
	render: function(){
		$(this.el).html(this.html);
	},
	events: {
		'click #brush':function() {
			this.model.set({
				// seems triggered before the click is finished, so reverse it
				brush: !($("#brush").hasClass("active"))
			});	
		},
		'click #stick':function() {

		}
	}
})