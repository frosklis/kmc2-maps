/*global jQuery: false, L:false*/
/*jslint bitwise: true*/
jQuery(document).ready(function () {
    'use strict';
    var map, layer;
    map = L.map('post_position');

    // Using stame map
    layer = new L.StamenTileLayer("watercolor");
    map.addLayer(layer);

    // Center map on position and add marker
	map.setView(L.latLng(window.post_latitude, window.post_longitude), 2);
	L.marker([window.post_latitude, window.post_longitude]).addTo(map);

});