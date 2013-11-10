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

	vis.projection = d3.geo.winkel3()
	    .scale(1)
	    .center([0,0])
	    .precision(.1);

	vis.path = d3.geo.path().projection(vis.projection);

	vis.g = vis.svg.append("g").attr("class", "world");


		
	var left_border = Infinity,
	  lower_border = -Infinity,
	  right_border = -Infinity,
	  upper_border = Infinity,
	  left_border_taboo = Infinity,
	  lower_border_taboo = -Infinity,
	  right_border_taboo = -Infinity,
	  upper_border_taboo = Infinity;

	// vis.taboo = new Array("ATA");
	vis.taboo = new Array();

	console.log(vis.taboo);

	d3.json(basepath+'data/world-110m.json', function(world) {
		vis.world = world;
		// Añadir propiedades
		for(j=0; j<world.features.length; j++) {
			d3.geo.bounds(world.features[j]).forEach(function(coords) {
				coords = vis.projection(coords);
				var x = coords[0],
				y = coords[1];

				if (vis.taboo.indexOf(world.features[j].properties.adm0_a3) == -1) {
					if (x < left_border) left_border = x;
					if (x > right_border) right_border = x;
					if (y > lower_border) lower_border = y;
					if (y < upper_border) upper_border = y;
				}

				if (x < left_border_taboo) left_border_taboo = x;
				if (x > right_border_taboo) right_border_taboo = x;
				if (y > lower_border_taboo) lower_border_taboo = y;
				if (y < upper_border_taboo) upper_border_taboo = y;
			
			});

		}

		// Cambiar escala en función de la anchura de la pantalla
		vis.projection.scale(vis.width / (right_border-left_border));
		// Definir altura y centrar
		vis.height = vis.width * (lower_border-upper_border) / (right_border-left_border);
		vis.width_taboo = vis.width * (right_border_taboo - left_border_taboo) / (right_border - left_border);
		vis.height_taboo = vis.height * (lower_border_taboo - upper_border_taboo) / (lower_border - upper_border);
		vis.svg
			.attr("width", vis.width)
			.attr("height", vis.height);

		console.log(vis.width, vis.width_taboo);
		console.log(vis.height, vis.height_taboo);

		vis.projection.translate([
			vis.width_taboo / 2, 
			vis.height_taboo / 2
		]);
		vis.aspectratio = vis.width / vis.height;

		vis.g.selectAll('path')
		.data(world.features)
		.enter().append('path')
		.filter(function (d) {
			return vis.taboo.indexOf(d.properties.adm0_a3) == -1;
		})
		.attr('d', d3.geo.path().projection(vis.projection))
		.attr('id', function(d){return d.properties.adm0_a3})
		.attr('class', 'country')
		.on("click", vis.clicked);

	

	});


	// Clicked function
	vis.clicked = function (d) {
		console.log(d);
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