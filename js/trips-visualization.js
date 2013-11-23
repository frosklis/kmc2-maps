basepath = kmc2_visualization_vars.basepath;
ajaxUrl = kmc2_visualization_vars.siteurl + 'wp-admin/admin-ajax.php';

jQuery(document).ready(function() {
	var parameters = new Object();
	parameters.selector = ".trips-visualization-map";

	var world = new Kmc2_Maps(parameters);

	d3.json(ajaxUrl + "?action=kmc2_country_trips", function(error, json) {
		if (error) return console.warn(error);
		// console.log(json);


		world.legend = 
			world.div.append("div")
				.attr("class", "legend")
				// .attr("transform", "translate(50,50)")
				;

		for (var key in json) {

			world.legend
			  .append("div")
				.attr("id", "legend_" + key)
				.attr("class", "invisible")
			  .selectAll("h3")
				.data(json[key])
			  .enter().append("h3").append("a")
			  	.text(function(d) {return d.category;})
			  	.attr("href", function (d) { return kmc2_visualization_vars.siteurl + "category/" + d.slug; })
			;

			world.svg.selectAll('#' + key).classed("highlight", true);

			world.g.selectAll("#" + key)
				.on("mouseover", function (d) {
					// console.log(d);

					// Highlight selected country
					// world.g.selectAll(".country")
					//   .classed("selected", false);
					// world.g.selectAll("#"+d.properties.adm0_a3)
					//   .classed("selected", true);

					// Pick the right legend
					world.legend.selectAll("div")
					  .classed("invisible", true)
					 ; 
					world.legend.selectAll("#legend_"+d.id)
					  .classed("invisible", false)
					 ;
				})
				;
		}


	});

});