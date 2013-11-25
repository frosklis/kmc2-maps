basepath = kmc2_visualization_vars.basepath;
ajaxUrl = kmc2_visualization_vars.siteurl + 'wp-admin/admin-ajax.php';

jQuery(document).ready(function() {
	var parameters = new Object();
	parameters.selector = ".trips-visualization-map";

	var world = new Kmc2_Maps(parameters);

	d3.json(ajaxUrl + "?action=kmc2_country_trips", function(error, json) {
		if (error) return console.warn(error);
		// console.log(json);

		countries = json.countries;
		trips = json.trips;
		// console.log(d3.values(trips));



		for (var key in countries) {
			world.svg.selectAll('#' + key).classed("highlight", true);
		}

		world.legend = 
			world.div.append("div")
				.attr("class", "legend")
				// .attr("transform", "translate(50,50)")
				;
		world.legend.selectAll("div")
			.data(d3.values(trips)).enter()
		  .append("div")
		  	.attr("id", function(d) {return "legend_" + d.slug;})
		  .append("h3").append("a")
		  	.text(function(d) {return d.category;})
		  	.attr("href", function (d) { return kmc2_visualization_vars.siteurl + "category/" + d.slug; })
			;

		world.legend.selectAll("div")
			.on("mouseover", function (d) {
				// console.log(d);

				// Unselect all countries
				world.svg.selectAll(".country")
					.classed("selected", false);

				// Select countries for the trip
				for (var i=0; i<d.countries.length;i++) {
					world.svg.selectAll("#" + d.countries[i])
						.classed("selected", true);
				}

			});

		world.g.selectAll(".country")
			.on("mouseover", function (d) {


				world.legend.selectAll("div")
					.classed("highlight", false);

				highlight_trips = countries[d.id];

				if (undefined == highlight_trips) return;


				for(var i=0; i<highlight_trips.length; i++) {
					world.legend.selectAll("#legend_" + highlight_trips[i].slug)
						.classed("highlight", true);
				}

			});

		// for (var key in trips) {

		// 	world.legend
		// 	  .append("div")
		// 		.attr("id", "legend_" + key)
		// 		// .attr("class", "invisible")
		// 	  .selectAll("h3")
		// 		.data(trips[key])
		// 	  .enter().append("h3").append("a")
		// 	  	.text(function(d) {return d.category;})
		// 	  	.attr("href", function (d) { return kmc2_visualization_vars.siteurl + "category/" + d.slug; })
		// 	;

		// }

	});

});