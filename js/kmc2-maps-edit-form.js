basepath = kmc2_vars.basepath;
ajaxUrl = kmc2_vars.siteurl + 'wp-admin/admin-ajax.php';

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


// Add a row every time the button is changed
jQuery('#table-kmc2-visited-places input[name="kmc2-visited-places-add"]').click(function () {

	var i = jQuery("#table-kmc2-visited-places tr").length - 1;
	jQuery('#table-kmc2-visited-places')
		.append('<tr><td><input type="hidden" name="kmc2-visited-places-index-'+i+'" value="'+i+'"><input name="kmc2-visited-places-name-'+i+'" type="text" value="" size="40"></td><td><input name="kmc2-visited-places-lon-'+i+'" type="text" value="" size="40"></td><td><input name="kmc2-visited-places-lat-'+i+'" type="text" value="" size="40"></td></tr>');
});

