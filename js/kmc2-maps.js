// Maps class

function Kmc2_Maps (parameters) {
	var vis = this;

	vis.mult = 1.0;
    // Delete the svg object if it exists and create it
    vis.selector = parameters.selector;
    vis.div = d3.select(vis.selector);

    d3.select(vis.selector + " svg").remove();
    vis.svg = d3.select(vis.selector).append("svg");

    vis.width = parseFloat(vis.svg.style("width"));

    vis.rotation = [-10,0,0];

	vis.projection = 
	  d3.geo.winkel3()
	  // d3.geo.cylindricalStereographic()
	    .scale(1)
	    .center([0,0])
	    .rotate(vis.rotation)
	    .precision(.1);

	vis.g = vis.svg.append("g").attr("class", "world");

	var left_border = Infinity,
	  lower_border = -Infinity,
	  right_border = -Infinity,
	  upper_border = Infinity;

	d3.json(basepath+'data/world-110m-topojson.json', function(world) {
		vis.world = world;
		vis.worldfeatures = topojson.feature(world, world.objects["world-110m"]);


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

		// Cambiar escala en función de la anchura de la pantalla
		vis.projection.scale(vis.width / (right_border-left_border));
		vis.scale = vis.projection.scale();

		// Definir altura y centrar
		vis.height = vis.width * (lower_border-upper_border) / (right_border-left_border);

		vis.svg
			.attr("width", vis.width)
			.attr("height", vis.height);

		vis.projection.translate([
			vis.width / 2, 
			vis.height / 2
		]);
		vis.aspectratio = vis.width / vis.height;

		vis.path = d3.geo.path().projection(vis.projection);

		vis.g.append("path")
		    .datum({type: "Sphere"})
		    .attr("class", "sphere")
		    .attr("d", vis.path);

		vis.g.append("use")
		    .attr("class", "stroke")
		    .attr("xlink:href", "#sphere");

		vis.g.append("use")
		    .attr("class", "fill")
		    .attr("xlink:href", "#sphere");


		vis.graticule = d3.geo.graticule();

		vis.g.append("path")
		    .datum(vis.graticule)
		    .attr("class", "graticule")
		    .attr("d", vis.path);
		vis.g.append("g").selectAll("path")
		    .data(vis.graticule).enter().append("path")
		    .attr("class", "graticule")
		    .attr("d", vis.path);


		vis.g.insert("path")
		  .datum(topojson.mesh(vis.world, vis.world.objects["world-110m"], function(a, b) { return a == b; }))
			.attr("class", "coast")
			.attr("d", vis.path);
		vis.g.insert("path")
		  .datum(topojson.mesh(vis.world, vis.world.objects["world-110m"], function(a, b) { return a != b; }))
			.attr("class", "boundary")
			.attr("d", vis.path);


		vis.g.selectAll('path')
			.data(vis.worldfeatures.features)
		  .enter().append('path')
			.attr('id', function(d){return d.id;})
			.attr('class', 'country')
			.attr('d', vis.path)
			.on("click", vis.clicked);
	

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
			var centroid = [0,0];
			vis.rotation = [-10,0,0];

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



		vis.g.selectAll('.country')
		.attr('d', vis.path);

		vis.g.selectAll('.coast, .boundary, .sphere, .graticule').remove();
		vis.g.insert("path")
		  .datum(topojson.mesh(vis.world, vis.world.objects["world-110m"], function(a, b) { return a == b; }))
			.attr("class", "coast")
			.attr("d", vis.path);
		vis.g.insert("path")
		  .datum(topojson.mesh(vis.world, vis.world.objects["world-110m"], function(a, b) { return a != b; }))
			.attr("class", "boundary")
			.attr("d", vis.path);
		vis.g.append("path")
		    .datum({type: "Sphere"})
		    .attr("class", "sphere")
		    .attr("d", vis.path);
		vis.g.append("path")
		    .datum(vis.graticule)
		    .attr("class", "graticule")
		    .attr("d", vis.path);

		// vis.g.selectAll('.boundary')
		// .attr('d', vis.path);

		// vis.g.selectAll('.coast')
		// .attr('d', vis.path);

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