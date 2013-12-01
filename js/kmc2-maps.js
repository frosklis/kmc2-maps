// Maps class

function Kmc2_Maps (parameters) {
	var vis = this;

	vis.mult = 1.0;
    // Delete the svg object if it exists and create it
    vis.selector = parameters.selector;
    vis.countries = parameters.countries;

    vis.aspectratio = parameters.aspectratio;    
    vis.maxHeight = parameters.maxHeight;
    vis.maxWidth = parameters.maxWidth;
    vis.useDefaultClick = parameters.useDefaultClick;

    vis.showAllCountries = true;
    if (undefined != parameters.showAllCountries) {
    	vis.showAllCountries = parameters.showAllCountries;
    }
    vis.zoom = false;
    if (undefined != parameters.zoom) {
    	vis.zoom = parameters.zoom;
    }

    vis.div = d3.select(vis.selector);

    d3.select(vis.selector + " svg").remove();
    vis.svg = d3.select(vis.selector).append("svg");

    vis.width = parseFloat(vis.svg.style("width"));

    vis.center = [10,0];
    vis.rotation = [-vis.center[0],-vis.center[1],0];

	vis.projection = 
	  d3.geo.winkel3()
	    .scale(1)
	    // .center([0,0])
	    // .rotate(vis.rotation)
	    .precision(.1);

	vis.g = vis.svg.append("g").attr("class", "world");

	var left_border = Infinity,
	  lower_border = -Infinity,
	  right_border = -Infinity,
	  upper_border = Infinity,
	  left_border_coords = Infinity,
	  lower_border_coords = -Infinity,
	  right_border_coords = -Infinity,
	  upper_border_coords = Infinity;

	// d3.json(basepath+'data/world-50m-topojson.json', function(world) {
	// 	vis.world_highres = world;
	// 	vis.worldfeatures_highress = topojson.feature(world, world.objects["world"]);
	// });
	
	featuresPath = 'data/world-110m-topojson.json';
	if (vis.zoom) featuresPath = 'data/world-50m-topojson.json';
	d3.json(basepath+featuresPath, function(world) {
		vis.worldfeatures = topojson.feature(world, world.objects["world"]);

		if ((typeof vis.countries === 'undefined' && typeof vis.taboo === 'undefined') || vis.zoom == false) {
			// Añadir propiedades
			for(j=0; j<vis.worldfeatures.features.length; j++) {
				d3.geo.bounds(vis.worldfeatures.features[j]).forEach(function(coords) {
					coords = vis.projection(coords);
					var x = coords[0]*1.1,
					y = coords[1]*1.1;

					if (x < left_border) left_border = x;
					if (x > right_border) right_border = x;
					if (y > lower_border) lower_border = y;
					if (y < upper_border) upper_border = y;

				});

			}
		}
		else {
			// Añadir propiedades
			for(j=0; j<vis.worldfeatures.features.length; j++) {
				if (typeof vis.countries != 'undefined' ) {
					if (vis.countries.indexOf(vis.worldfeatures.features[j].id) == -1) continue;
				}
				if (typeof vis.taboo != 'undefined'){
					if (vis.taboo.indexOf(vis.worldfeatures.features[j].id) > -1) continue;
				}
				d3.geo.bounds(vis.worldfeatures.features[j]).forEach(function(coords) {
					// if (vis.worldfeatures.features[j].id == "FRA") {
					// 	console.log(coords[0], coords[1]);
					// }
					if (vis.worldfeatures.features[j].id == "RUS" && coords[0] <= -169) {
						if (featuresPath.indexOf("110") > -1) coords[0] = 19.60396039603961;
						else coords[0] = 360 + coords[0];
					}
					if (vis.worldfeatures.features[j].id == "FRA" ) {
						if (coords[0] <= 0){
							coords[0] = -5.13;
							coords[1] = 41.37;
						} 
						else {
							coords[0] = 9.558955895589577;
							// coords[1] = 23.76;
						}
					}
					x_coords = coords[0];
					y_coords = coords[1];

					coords = vis.projection(coords);
					var x = coords[0]*1.1,
					y = coords[1]*1.1;

					if (x < left_border) left_border = x;
					if (x > right_border) right_border = x;
					if (y > lower_border) lower_border = y;
					if (y < upper_border) upper_border = y;

					if (x_coords < left_border_coords) left_border_coords = x_coords;
					if (x_coords > right_border_coords) right_border_coords = x_coords;
					if (y_coords > lower_border_coords) lower_border_coords = y_coords;
					if (y_coords < upper_border_coords) upper_border_coords = y_coords;

				});
			}

			var centroid = [(left_border_coords + right_border_coords) / 2, (lower_border_coords + upper_border_coords) / 2 ];

			vis.rotation = [-centroid[0],-centroid[1],0];

			vis.center = centroid;

			vis.projection
				.center(vis.center)
				.rotate(vis.rotation);
		
		}


		// Cambiar escala en función de la anchura de la pantalla
		var max_width = Math.abs(right_border-left_border);
		var max_height = Math.abs(lower_border - upper_border);


		if (undefined != vis.aspectratio && max_height / max_width > (1 / vis.aspectratio)) {
			max_width = vis.aspectratio *  max_height;
		}
		// Definir altura
		vis.height = vis.width * max_height / max_width;

		if (undefined != vis.maxHeight) {
			vis.height = Math.min(vis.maxHeight, vis.height);
		}
		if (undefined != vis.maxWidth) {
			vis.width = Math.min(vis.maxWidth, vis.width);
		}
		vis.projection.scale(Math.min(vis.width / max_width, vis.height / max_height));
		vis.scale = vis.projection.scale();

		vis.svg
			.attr("width", vis.width)
			.attr("height", vis.height);

		vis.projection.translate([0,0
		]);

		var pan = vis.projection(vis.center);

		vis.projection.translate([
			vis.width / 2 - pan[0], 
			vis.height / 2 - pan[1]
		]);

		vis.aspectratio = vis.width / vis.height;

		vis.path = d3.geo.path().projection(vis.projection);

		vis.g.append("path")
		    .datum({type: "Sphere"})
		    .attr("class", "sphere")
		    .attr("d", vis.path);

		// vis.g.append("use")
		//     .attr("class", "stroke")
		//     .attr("xlink:href", "#sphere");

		// vis.g.append("use")
		//     .attr("class", "fill")
		//     .attr("xlink:href", "#sphere");


		vis.graticule = d3.geo.graticule();

		vis.g.append("path")
		    .datum(vis.graticule)
		    .attr("class", "graticule")
		    .attr("d", vis.path);
		vis.g.selectAll("path")
		    .data(vis.graticule).enter().append("path")
		    .attr("class", "graticule")
		    .attr("d", vis.path);

		vis.g.insert("path")
		  .datum(topojson.mesh(world, world.objects["world"], function(a, b) { return a == b; }))
			.attr("class", "coast")
			.attr("d", vis.path);

		if (vis.showAllCountries) {
			vis.g.insert("path")
			  .datum(topojson.mesh(world, world.objects["world"], function(a, b) { return a != b; }))
				.attr("class", "boundary")
				.attr("d", vis.path);
		}

		vis.g.selectAll('path')
			.data(vis.worldfeatures.features)
		  .enter().append('path')
		  	.filter(function(d) {
		  		if (undefined == vis.countries) return true;
		  		return vis.countries.indexOf(d.id) > -1;
		  	})
			.attr('id', function(d){return d.id;})
			.attr('class', 'country')
			.attr('d', vis.path)
			.classed("highlight", function(d) {return undefined != vis.countries;});

		if (false != vis.useDefaultClick) {
			vis.g.selectAll(".country").on("click", vis.clicked);
		}
		

	});


	// Clicked function
	vis.clicked = function (d) {

		if (d && vis.centered !== d) {
			var centroid = d3.geo.centroid(d);
			vis.rotation = [-centroid[0],-centroid[1],0];

			vis.projection
				.center(d3.geo.centroid(d))
				.rotate(vis.rotation)
			    .translate([0,0]);

			var bounds = vis.path.bounds(d);
			var w = Math.abs(bounds[0][0] - bounds[1][0]);
			var h = Math.abs(bounds[0][1] - bounds[1][1]);

			var scale = vis.projection.scale();

			scale = 0.75 * Math.min((vis.width) * scale / w, (vis.height) * scale / h);
			vis.centered = d;

		} else {
			var centroid = vis.center;
			vis.rotation = [-vis.center[0],-vis.center[1],0];

			vis.projection
				.center(d3.geo.centroid(d))
				.rotate(vis.rotation)
			    .translate([0,0]);

			var scale = vis.scale;


			vis.centered = null;
		}

	
		vis.projection.scale(scale);

		var pan = vis.projection(centroid);

		vis.projection.translate([
			vis.width / 2 - pan[0], 
			vis.height / 2 - pan[1]
		]);

		vis.path = d3.geo.path().projection(vis.projection);




		vis.g.selectAll('.sphere, .graticule').remove();
		// vis.g.insert("path")
		//   .datum(topojson.mesh(vis.world, vis.world.objects["world-110m"], function(a, b) { return a == b; }))
		// 	.attr("class", "coast")
		// 	.attr("d", vis.path);
		// vis.g.insert("path")
		//   .datum(topojson.mesh(vis.world, vis.world.objects["world-110m"], function(a, b) { return a != b; }))
		// 	.attr("class", "boundary")
		// 	.attr("d", vis.path);
		vis.g.append("path")
		    .datum({type: "Sphere"})
		    .attr("class", "sphere")
		    .attr("d", vis.path);
		vis.g.append("path")
		    .datum(vis.graticule)
		    .attr("class", "graticule")
		    .attr("d", vis.path);



		// vis.g.insert("path")
		//   .datum(topojson.mesh(vis.world, vis.world.objects["world-110m"], function(a, b) { return a != b; }))
		// 	.attr("class", "boundary")
		// 	.attr("d", vis.path);


		// vis.g.selectAll('.coast')
		// .attr('d', vis.path);

		// vis.g.selectAll('.boundary')
		// 	.transition()
		// 	.duration(750)
		// 	.attr('d', vis.path(vis.g.selectAll('.boundary').datum()));


		vis.g.selectAll('.country')
			.transition()
			// .duration(1500)
			.attr('d', vis.path);

		// vis.g.transition()
		//   .duration(750)
		//   .attr("transform", traslacion)
		//   .style("stroke-width", 1.5 / k + "px");

		return;

		// console.log(d);
		var x, y, k;
		var width, height;
		width = vis.width * vis.mult;
		height = vis.height * vis.mult;

		if (d && vis.centered !== d) {
			var centroid = vis.path.centroid(d);
			var bounds = vis.path.bounds(d);
			x = centroid[0] + (width-vis.width) / 2;
			y = centroid[1] + (height-vis.height) / 2;

			var maxKx, maxKy;
			maxKx = width / Math.abs(bounds[0][0] - bounds[1][0]);
			maxKy = height / Math.abs(bounds[0][1] - bounds[1][1]);
			k = Math.min(8,maxKy,maxKx) * vis.mult;
			vis.centered = d;
		} else {
			x = width / 2;
			y = height / 2;
			k = 1 * vis.mult;
			vis.centered = null;
		}

		vis.g.selectAll("path")
		  .classed("active", vis.centered && function(d) { return d === vis.centered; });

		var traslacion = "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")";

		traslacion += "translate(" + (width-vis.width) / 2 + "," + (height-vis.height) / 2 + ")";

		vis.g.transition()
		  .duration(750)
		  .attr("transform", traslacion)
		  .style("stroke-width", 1.5 / k + "px");
	};

}