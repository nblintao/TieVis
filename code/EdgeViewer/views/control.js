var ControlPanel = Backbone.View.extend({
	initialize:function() {
		this.html = '<div class="btn-group-vertical btn-group-sm" role="group">'+
				'<button type="button" class="btn btn-default" aria-label="Left Align" id = "brush" data-toggle="button">'+
	 				'<span class="glyphicon glyphicon-screenshot" aria-hidden="true"></span>' +
				'</button>' +
				'<button type="button" class="btn btn-default" aria-label="Left Align" id = "stick" data-toggle="button">' +
	 				'<span class="glyphicon glyphicon-pushpin" aria-hidden="true"></span>' +
				'</button>' +				
			'</div>';
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