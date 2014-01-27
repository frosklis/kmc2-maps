/*global kmc2_visualization_vars, jQuery: false, d3: false, topojson:false*/
var basepath = kmc2_visualization_vars.basepath,
    ajaxUrl = kmc2_visualization_vars.siteurl + 'wp-admin/admin-ajax.php',
    category_id = kmc2_visualization_vars.category_id,
    vv = {};



function calculateProjection(route) {
    'use strict';
    var bounds, center, scaleX, scaleY, path, projection, dist, prevScale, iters;

    // Calculate the route center
    projection = d3.geo.conicConformal()
        .scale(1);

    dist = Infinity;
    prevScale = 1;
    iters = 0;
    while (dist > 1 && iters < 10) {
        path = d3.geo.path()
            .projection(projection);

        bounds = path.bounds(route);
        center = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
        center = projection.invert(center);

        scaleX = projection.scale() * vv.width / (bounds[1][0] - bounds[0][0]);
        scaleY = projection.scale() * vv.height / (bounds[1][1] - bounds[0][1]);

        projection.scale(Math.min(scaleY, scaleX) * 0.75)
            .rotate([-center[0], -center[1], 0]);
        projection.translate([vv.width / 2, vv.height / 2]);

        dist = Math.abs(projection.scale() - prevScale);
        prevScale = projection.scale();
        iters++;
    }
    return projection;

}

function drawRoute(d) {
    'use strict';
    var j, g, route, path;

    d = JSON.parse(d);


    route = {
        type: "LineString",
        coordinates: []
    };

    for (j = 0; j < d.length; j++) {
        route.coordinates.push([parseFloat(d[j].lon), parseFloat(d[j].lat)]);
    }


    d3.select(".trip-map svg").remove();
    vv.svg = d3.select(".trip-map").append("svg");

    vv.width = jQuery(".trip-map svg").width();
    vv.height = jQuery(".trip-map svg").height();
    vv.g = vv.svg.append("g");

    vv.projection = calculateProjection(route);

    path = d3.geo.path()
        .projection(vv.projection);

    g = vv.g.append("g")
        .attr("class", "viaje");

    g.append("path")
        .datum(route)
        .attr("class", "route")
        .attr("d", path);
    g.selectAll("circle")
        .data(route.coordinates).enter().append("circle")
        .attr("cx", function (d) {
            return vv.projection(d)[0];
        })
        .attr("cy", function (d) {
            return vv.projection(d)[1];
        })
        .attr("r", "5px");

    d3.json(basepath + 'data/countries-110m-topojson.json', function (world) {

        vv.svg
            .attr("width", vv.width)
            .attr("height", vv.height);
        vv.aspectratio = vv.width / vv.height;

        vv.g.append("path")
            .datum(topojson.mesh(world, world.objects.world, function (a, b) { return a !== b; }))
            .attr("d", path)
            .attr("class", "boundary");
        vv.g.append("path")
            .datum(topojson.mesh(world, world.objects.world, function (a, b) { return a === b; }))
            .attr("d", path)
            .attr("class", "coast");
    });

    g.append("path")
        .datum(d3.geo.graticule())
        .attr("class", "graticule")
        .attr("d", path);

}


jQuery(document).ready(function () {
    'use strict';
    vv.mult = 1.0;

    jQuery.ajax({
        type: "POST",
        url: ajaxUrl + "?action=kmc2_trip_places",
        data: {cat: category_id},
        success: drawRoute
    });

});

jQuery(window).resize(function () {
    'use strict';
    vv.mult = jQuery(".trip-map svg").width() / vv.width;
    vv.svg
        .attr("width", vv.width * vv.mult)
        .attr("height", vv.height * vv.mult);
    vv.g.transition()
        .duration(750)
        .attr("transform", "scale(" + vv.mult + ")");
});

