var tieVis = {
	start: function() {
		var proj = new ProjectionView({
			el: "#projection"
		});
		var band = new BandView({
			el: "#band"
		})
		var bipartite = new BiPartiteView({
			el: "#bipartite"
		})
		var nodelink = new NodeLinkView({
			el: "#nodelink"
		})
		proj.render();
		band.render();
		bipartite.render();
		nodelink.render();
	}
}