/*global jQuery: false, L:false, kmc2_visualization_vars:false*/
/*jslint bitwise: true*/
jQuery(document).ready(function () {
    'use strict';
    var map, layer, markers, marker, i, a, title, ajaxUrl;

    ajaxUrl = kmc2_visualization_vars.siteurl + 'wp-admin/admin-ajax.php';


    if (jQuery('#trips-visualization-map').length === 0) {
        return false;
    }

    map = L.map('trips-visualization-map',
		{
			'scrollWheelZoom': false,
			'doubleClickZoom': false,
			'touchZoom': false,
            'fullscreenControl': true
		});
    map.on ('enterFullscreen', function() {
        map.scrollWheelZoom.enable();
        map.doubleClickZoom.enable();
        map.touchZoom.enable();
    });

    map.on ('exitFullscreen', function() {
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
        map.touchZoom.disable();
    });

    // Using stame map
    // replace "toner" here with "terrain" or "watercolor"
    layer = new L.StamenTileLayer("watercolor");
    map.addLayer(layer);

	map.setView(L.latLng(30, 0), 2);


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