/*global jQuery: false, L:false, kmc2_visualization_vars:false*/
/*jslint bitwise: true*/
jQuery(document).ready(function () {
    'use strict';
    var map, layer, markers, marker, i, a, title, ajaxUrl, Stamen_TonerLabels;

    ajaxUrl = kmc2_visualization_vars.siteurl + 'wp-admin/admin-ajax.php';


    if (jQuery('#trips-visualization-map').length === 0) {
        return false;
    }

    map = L.map('trips-visualization-map',
		{
			'scrollWheelZoom': false,
			// 'doubleClickZoom': false,
			'touchZoom': false,
            'fullscreenControl': true
		});
    map.on ('enterFullscreen', function() {
        map.scrollWheelZoom.enable();
        // map.doubleClickZoom.enable();
        map.touchZoom.enable();
    });

    map.on ('exitFullscreen', function() {
        map.scrollWheelZoom.disable();
        // map.doubleClickZoom.disable();
        map.touchZoom.disable();
    });


    // Using stame map
    // replace "toner" here with "terrain" or "watercolor"
    layer = new L.StamenTileLayer("watercolor");
    map.addLayer(layer);

	map.setView(L.latLng(30, 0), 2);

    Stamen_TonerLabels = L.tileLayer('http://{s}.tile.stamen.com/toner-labels/{z}/{x}/{y}.png', {
        // attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        subdomains: 'abcd',
        minZoom: 8,
        maxZoom: 20
    });
    map.addLayer(Stamen_TonerLabels);

    // Add clusters of posts and pictures!
    markers = L.markerClusterGroup(
        // {
        //     chunkedLoading: true,
        //     iconCreateFunction: function(cluster) {
        //         return new L.DivIcon({ html: '<b>' + cluster.getChildCount() + '</b>' });
        //     }
        // }
        {
            maxClusterRadius: 50
        }
    );

    jQuery.ajax({
        type: "POST",
        url: ajaxUrl + "?action=kmc2_posts_location",
        success: function (d) {
            d = jQuery.parseJSON(d);
            for (i = 0; i < d.length; i++) {
                a = d[i];
                title = '<a href="' + kmc2_visualization_vars.siteurl + '?p=' + a.id + '">' + a.post_title + '</a>';
                marker = L.marker(L.latLng(a.geo_latitude, a.geo_longitude), { title: title });
                marker.bindPopup(title);
                markers.addLayer(marker);
            }

        }
    });
    map.addLayer(markers);
});