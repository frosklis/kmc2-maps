/*global jQuery: false, L:false*/
/*jslint bitwise: true*/
jQuery(document).ready(function () {
    'use strict';
    var map, layer;

	if (jQuery('#post_position').length === 0) {
		return false;
	}
    map = L.map('post_position',
		{
			'scrollWheelZoom': false,
			'doubleClickZoom': false,
			'touchZoom': false
		});

    // Using stame map
    layer = new L.StamenTileLayer("watercolor");
    map.addLayer(layer);

    // Center map on position and add marker
	map.setView(L.latLng(window.post_latitude, window.post_longitude), 2);
	L.marker([window.post_latitude, window.post_longitude]).addTo(map);

});