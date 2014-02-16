jQuery('#kmc2_maps_post_location_edit input[name="kmc2-visited-places-get"]').click(function () {
    var s, q, geocode_url;
    geocode_url = 'http://maps.googleapis.com/maps/api/geocode/json?';
    s = "kmc2_maps_place";
    q = jQuery('input[name="' + s + '"]').val();

    jQuery.get(geocode_url, {'address': q, 'sensor': false}, function (d) {
        if (d.status !== "OK") {
            return false;
        }

        jQuery('#kmc2_maps_post_location_edit input[name="kmc2_maps_lat"]').val(d.results[0].geometry.location.lat);
        jQuery('#kmc2_maps_post_location_edit input[name="kmc2_maps_lon"]').val(d.results[0].geometry.location.lng);
        return true;
    });
});

