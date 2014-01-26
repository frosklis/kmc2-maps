basepath = kmc2_vars.basepath;
ajaxUrl = kmc2_vars.siteurl + 'wp-admin/admin-ajax.php';

var geocode_url = 'http://maps.googleapis.com/maps/api/geocode/json?';

var fixHelperModified = function(e, tr) {
    var originals = tr.children();
    var helper = tr.clone();
    helper.children().each(function(index) {
        jQuery(this).width(originals.eq(index).width())
    });
    return helper;
},
    updateIndex = function(e, ui) {
        jQuery("#table-kmc2-visited-places tr").each(function (i) {
        	jQuery('input[type=hidden]', this).val(i-1);
        });
    };

jQuery("#table-kmc2-visited-places tbody").sortable({
    helper: fixHelperModified,
    update: updateIndex
}).disableSelection();


function addClickFunctions() {
    jQuery('#table-kmc2-visited-places input[name="kmc2-visited-places-del"]').click(function () {
        jQuery(this).parent().parent().remove();

    });

    jQuery('#table-kmc2-visited-places input[name="kmc2-visited-places-get"]').click(function () {
        i = jQuery('input[type=hidden]', jQuery(this).parent().parent()).val();
        s = "kmc2-visited-places-name-" + i;
        q = jQuery('input[name="' + s + '"]').val();

        jQuery.get(geocode_url, {'address': q, 'sensor': false}, function (d) {
            if (d.status !== "OK") {
                console.log(d);
                return false;
            }

            jQuery('input[name="kmc2-visited-places-lat-' + i + '"]').val(d.results[0].geometry.location.lat);
            jQuery('input[name="kmc2-visited-places-lon-' + i + '"]').val(d.results[0].geometry.location.lng);
            console.log(d);
            return true;
        });

    });
}
addClickFunctions();

// Add a row every time the button is changed
jQuery('#table-kmc2-visited-places input[name="kmc2-visited-places-add"]').click(function () {

	var i = jQuery("#table-kmc2-visited-places tr").length - 1;
	jQuery('#table-kmc2-visited-places')
		.append('<tr><td><input type="hidden" name="kmc2-visited-places-index-' + i + '" value="' + i + '"><input name="kmc2-visited-places-name-' + i + '" type="text" value="" size="40"></td><td><input name="kmc2-visited-places-lon-' + i + '" type="text" value="" size="40"></td><td><input name="kmc2-visited-places-lat-' + i + '" type="text" value="" size="40"></td><td><input name="kmc2-visited-places-get" type="button" value="Get coordinates"></td><td><input name="kmc2-visited-places-del" type="button" value="Delete place"></td></tr>');

    addClickFunctions();
});

getResponse = function (i) {
    s = "kmc2-visited-places-name-" + i;
    q = jQuery('input[name="' + s + '"]').val();

    jQuery.get(geocode_url, {'address': q, 'sensor': false}, function (d) {
        if (d.status !== "OK") {
            console.log(d);
            return false;
        }

        jQuery('input[name="kmc2-visited-places-lat-' + i + '"]').val(d.results[0].geometry.location.lat);
        jQuery('input[name="kmc2-visited-places-lon-' + i + '"]').val(d.results[0].geometry.location.lng);
        console.log(d);
        return true;
    });
};

jQuery('#table-kmc2-visited-places input[name="kmc2-visited-places-get-all"]').click(function () {
    n = jQuery("#table-kmc2-visited-places tr").length;


    for (i = 0; i < n - 1; i++) {
        aux = getResponse(i);
        // aux();
    }
});