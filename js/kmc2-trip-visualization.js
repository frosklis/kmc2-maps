/*global jQuery: false, L:false, kmc2_visualization_vars:false*/
/*jslint bitwise: true*/
jQuery(document).ready(function () {
    'use strict';
    var map, layer, markers, markersLayer, marker, i, a, title, ajaxUrl;

    ajaxUrl = kmc2_visualization_vars.siteurl + 'wp-admin/admin-ajax.php';

    if (jQuery('#trip-map').length === 0) {
        return false;
    }

    map = L.map('trip-map',
        {
            'scrollWheelZoom': false,
            'doubleClickZoom': false,
            'touchZoom': false,
            'fullscreenControl': true
        });
    map.on('enterFullscreen', function () {
        map.scrollWheelZoom.enable();
        map.doubleClickZoom.enable();
        map.touchZoom.enable();
    });

    map.on('exitFullscreen', function () {
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
        map.touchZoom.disable();
    });

    // Using stame map
    // replace "toner" here with "terrain" or "watercolor"
    layer = new L.StamenTileLayer("watercolor");
    map.addLayer(layer);

    map.fitWorld();


    // Add clusters of posts and pictures!
    // markers = L.markerClusterGroup(
    //     // {
    //     //     chunkedLoading: true,
    //     //     iconCreateFunction: function(cluster) {
    //     //         return new L.DivIcon({ html: '<b>' + cluster.getChildCount() + '</b>' });
    //     //     }
    //     // }
    //     {
    //         maxClusterRadius: 50
    //     }
    // );

    markers = [];

    jQuery.ajax({
        type: "POST",
        url: ajaxUrl + "?action=kmc2_trip_places",
        data: { cat: kmc2_visualization_vars.category_id},
        success: function (d) {
            d = jQuery.parseJSON(d);

            for (i = 0; i < d.length; i++) {
                a = d[i];
                title = a.name;
                marker = L.marker(L.latLng(a.lat, a.lon), { title: title });
                marker.bindPopup(title);
                marker.addTo(map);
                // markers.addLayer(marker);
                markers.push(marker);
            }

            // map.addLayer(markers);
            markersLayer = L.featureGroup(markers);
            map.fitBounds(markersLayer.getBounds(), {
                'padding': [10, 10]
            });
            markersLayer.addTo(map);
        }
    });

});