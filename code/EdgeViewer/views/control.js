var ControlPanel = Backbone.View.extend({
	initialize:function() {
		this.html = '<div class="btn-group-vertical btn-group-sm" role="group">'+
				'<button type="button" class="btn btn-default" aria-label="Left Align" id = "brush" data-toggle="button" style="background-image:url(Iconset/Select.png);width:40px;height:40px;background-size:40px;">'+
	 				// '<span class="glyphicon glyphicon-screenshot" aria-hidden="true"></span>' +
					// '<img src="Iconset/Select.png" height="20px" width="20px"/>' +
				'</button>' +
				'<button type="button" class="btn btn-default" aria-label="Left Align" id = "stick" data-toggle="button" style="background-image:url(Iconset/Lock.png);width:40px;height:40px;background-size:40px;">' +
	 				// '<span class="glyphicon glyphicon-pushpin" aria-hidden="true"></span>' +
					//  '<img src="Iconset/Lock.png" height="20px" width="20px"/>' +
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