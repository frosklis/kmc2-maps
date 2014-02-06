/*global kmc2_visualization_vars, jQuery: false, d3: false, topojson:false*/
/*jslint bitwise: true*/
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
    var j, g, b, path, color, neighbors, countries, counter;

    color = d3.scale.category10();

    d = JSON.parse(d);

    // Some checkings on d
    if (d.length === 0) {
        d3.select(".trip-map").remove();
        return null;
    }

    vv.route = {
        type: "LineString",
        coordinates: []
    };

    counter = 0;
    for (j = 0; j < d.length; j++) {
        if (d[j].lon !== "" && d[j].lat !== "") {
            counter++;
        }
        vv.route.coordinates.push([parseFloat(d[j].lon), parseFloat(d[j].lat)]);
    }

    if (counter === 0) {
        d3.select(".trip-map").remove();
        return null;
    }


    d3.select(".trip-map svg").remove();
    vv.svg = d3.select(".trip-map").append("svg");

    vv.width = jQuery(".trip-map").width();
    vv.height = jQuery(".trip-map").height();

    vv.g = vv.svg.append("g");

    vv.projection = calculateProjection(vv.route);

    path = d3.geo.path()
        .projection(vv.projection);

    g = vv.g.append("g")
        .attr("class", "viaje");

    b = g.append("g");

    g.append("path")
        .datum(vv.route)
        .attr("class", "route")
        .attr("d", path);
    g.selectAll("circle")
        .data(vv.route.coordinates).enter().append("circle")
        .attr("cx", function (d) {
            return vv.projection(d)[0];
        })
        .attr("cy", function (d) {
            return vv.projection(d)[1];
        })
        .attr("r", "5px");

    d3.json(basepath + 'data/countries-50m-topojson.json', function (world) {
        neighbors = topojson.neighbors(world.objects.world.geometries);
        countries = topojson.feature(world, world.objects.world).features;

        vv.svg
            .attr("width", vv.width)
            .attr("height", vv.height);
        vv.aspectratio = vv.width / vv.height;

        b.append("path")
            .datum(topojson.mesh(world, world.objects.world, function (a, b) { return a === b; }))
            .attr("d", path)
            .attr("class", "coast");
        b.append("path")
            .datum(topojson.mesh(world, world.objects.world, function (a, b) { return a !== b; }))
            .attr("d", path)
            .attr("class", "boundary");


        b.selectAll(".country")
            .data(countries)
            .enter().insert("path", ".graticule")
            .attr("class", "country")
            .attr("d", path)
            .style("fill", function (d, i) {
                d.color = d3.max(neighbors[i], function (n) {
                    return countries[n].color;
                }) + 1 | 0;
                return color(d.color);
            });
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
        .attr("width", vv.width * vv.mult);
    vv.width *= vv.mult;
    vv.projection = calculateProjection(vv.route);

    d3.selectAll(".trip-map path").attr("d", d3.geo.path()
        .projection(vv.projection));
    d3.selectAll(".trip-map circle")
        .attr("cx", function (d) {
            return vv.projection(d)[0];
        })
        .attr("cy", function (d) {
            return vv.projection(d)[1];
        });
    // vv.g.transition()
    //     .duration(750)
    //     .attr("transform", "scale(" + vv.mult + ")");
});

