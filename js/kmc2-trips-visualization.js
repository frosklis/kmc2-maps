/*global jQuery: false, L:false*/
/*jslint bitwise: true*/
jQuery(document).ready(function () {
    'use strict';
    var map, layer;
    map = L.map('trips-visualization-map',
		{
			'scrollWheelZoom': false,
			'doubleClickZoom': false,
			'touchZoom': false
		});

    // Using stame map
    // replace "toner" here with "terrain" or "watercolor"
    layer = new L.StamenTileLayer("watercolor");
    map.addLayer(layer);

	map.setView(L.latLng(30, 0), 2);
});