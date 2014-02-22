/*global jQuery: false, L:false*/
/*jslint bitwise: true*/

function onDragging (e) {
    var position = e.target.getLatLng();
    window.lat = position.lat;
    window.lon = position.lng;

    jQuery('#kmc2_maps_post_location_edit input[name="kmc2_maps_lat"]').val(window.lat);
    jQuery('#kmc2_maps_post_location_edit input[name="kmc2_maps_lon"]').val(window.lon);

}

function addMarker() {
    window.marker = L.marker([window.lat, window.lon], {
        'draggable': true
    });
    window.marker.addTo(window.map);
    window.marker.on('drag', onDragging);
}


function update_map() {
    window.lat = jQuery('#kmc2_maps_post_location_edit input[name="kmc2_maps_lat"]').val();
    window.lon = jQuery('#kmc2_maps_post_location_edit input[name="kmc2_maps_lon"]').val();


    if (window.lat !== '' && window.lon !== '') {
        if (typeof("window.marker" === "undefined")) {
            addMarker();
        }

        window.marker.setLatLng([window.lat, window.lon]);
    }
}

jQuery('#kmc2_maps_post_location_edit input[name="kmc2-visited-places-get"]').click(function () {
    var s, q, geocode_url;
    geocode_url = 'http://maps.googleapis.com/maps/api/geocode/json?';
    s = "kmc2_maps_place";
    q = jQuery('input[name="' + s + '"]').val();

    jQuery.get(geocode_url, {'address': q, 'sensor': false}, function (d) {
        if (d.status !== "OK") {
            return false;
        }

        window.lat = d.results[0].geometry.location.lat;
        window.lon = d.results[0].geometry.location.lng;

        jQuery('#kmc2_maps_post_location_edit input[name="kmc2_maps_lat"]').val(window.lat);
        jQuery('#kmc2_maps_post_location_edit input[name="kmc2_maps_lon"]').val(window.lon);

        update_map();

        return true;
    });

});




jQuery(document).ready(function () {
    var layer;

    window.lat = jQuery('#kmc2_maps_post_location_edit input[name="kmc2_maps_lat"]').val();
    window.lon = jQuery('#kmc2_maps_post_location_edit input[name="kmc2_maps_lon"]').val();


    // Add a map with a draggable marker
    window.map = L.map('map_edit_post_location');

    // Using stame map
    layer = new L.StamenTileLayer("watercolor");
    window.map.addLayer(layer);

    // Center map on position and add marker
    if (window.lat !== '' && window.lon !== '') {
        window.map.setView(L.latLng(window.lat, window.lon), 14);
        window.marker = L.marker([window.lat, window.lon], {
            'draggable': true
        });
        window.marker.addTo(window.map);
        window.marker.on('drag', onDragging);
    }
    else {
        window.map.fitWorld();
        window.map.on('click', function (e) {
            var position = e.latlng;
            window.lat = position.lat;
            window.lon = position.lng;


            jQuery('#kmc2_maps_post_location_edit input[name="kmc2_maps_lat"]').val(window.lat);
            jQuery('#kmc2_maps_post_location_edit input[name="kmc2_maps_lon"]').val(window.lon);

            addMarker();
            window.map.off('click');
        });
    }

});



jQuery('#kmc2_maps_post_location_edit input[name="kmc2_maps_lat"]').on('change', update_map);
jQuery('#kmc2_maps_post_location_edit input[name="kmc2_maps_lon"]').on('change', update_map);
