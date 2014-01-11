basepath = kmc2_visualization_vars.basepath;
ajaxUrl = kmc2_visualization_vars.siteurl + 'wp-admin/admin-ajax.php';

jQuery(document).ready(function() {
	var parameters = new Object();
	parameters.selector = ".trips-visualization-map";
	parameters.maxHeight = 700;
	parameters.showAllCountries = true;
	parameters.zoom = false;
	parameters.useDefaultClick = false;
	parameters.highlightAll = false;
	parameters.showSphere = false;
	parameters.taboo = ["ATA"];

	var world = new Kmc2_Maps(parameters);

	d3.json(ajaxUrl + "?action=kmc2_country_trips", function(error, json) {
		if (error) return console.warn(error);
		// console.log(json);

		countries = json.countries;
		trips = json.trips;

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
		  	.style("cursor", "pointer")
		  .append("p").append("a")
		  	.text(function(d) {return d.category;})
			.on("click", function (d) {
				d3.selectAll(".maps-container .trip").style("display", "none");
				d3.selectAll(".trip-" + d.slug).style("display", "block");
				world.svg.remove();

			});
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

			})
			.on("mouseout", function (d) {
				// Unselect countries for the trip
				for (var i=0; i<d.countries.length;i++) {
					world.svg.selectAll("#" + d.countries[i])
						.classed("selected", false);
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

		var trips_parameters = new Object();
		var trips_visualizations = new Object();

		for (var key in trips) {

			d3.selectAll(".kmc2-maps-plugin .maps-container")
				.append("div").classed("trip-" + key, true)
				.classed("trip", true)
				;

			trips_parameters[key] = new Object();
			trips_parameters[key].selector = ".trip-" + key;
			trips_parameters[key].countries = trips[key].countries;
			trips_parameters[key].countries = ["RUS"];
			trips_parameters[key].maxHeight = 700;
			trips_parameters[key].zoom = true;
			trips_parameters[key].showAllCountries = false;
			trips_parameters[key].useDefaultClick = false;

			trips_visualizations[key] = new Kmc2_Maps(trips_parameters[key]);

			d3.select(".trip-" + key, true)
				.style("display", "none")
				;

		}

	});

});