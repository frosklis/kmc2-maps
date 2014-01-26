<?php
/*
Plugin Name: Km C2 maps
Plugin URI: http://URI_Of_Page_Describing_Plugin_and_Updates
Description: Provides widgets and functionality to show maps.
Version: 0.1
Author: Claudio Noguera
Author URI: http://claudionoguera.tk/blog
License: A "Slug" license name e.g. GPL2
*/
?>
<?php

// Require every single widget file
// They have a class for the Widget but don't instantiate it
require('w_visited_countries.php');
require('w_viajes.php');
require('w_visualization.php');
require('w_trip_visualization.php');

// register Widgets
function register_map_widgets() {
    register_widget( 'Visited_Countries' );
    register_widget( 'Viajes');
    register_widget( 'Kmc2_Visualization');
    register_widget( 'Kmc2_Trip_Visualization');
}



if(!class_exists('KmC2_Maps')) { 
	class KmC2_Maps { // don't need to extend WP_Widget

		public function __construct() { 
			// register actions  and filters
			add_action( 'widgets_init', 'register_map_widgets' );
			
			// The admin stuff is only loaded if in the admin page
			if (is_admin()) {
				add_action( 'category_add_form_fields', 'kmc2_category_add_form_fields' ); 
				add_action( 'category_edit_form_fields', 'kmc2_category_edit_form_fields' ); 
				add_action( 'create_category', 'kmc2_custom_field_save', 10, 2 );    
				add_action( 'edited_category', 'kmc2_custom_field_save', 10, 2 );
				add_filter( 'manage_category_custom_column', 'categoriesColumnsRow', 10, 3 );
			}
			
		} // END public function __construct 
		public static function activate() { 
			// Do nothing 
		} // END public static function activate 

		public static function deactivate() { 
			// Do nothing 
		} // END public static function deactivate 
	}//End Class KmC2_Maps
}

if(class_exists('KmC2_Maps')) { 
	// Installation and uninstallation hooks 
	register_activation_hook(__FILE__, array('KmC2_Maps', 'activate')); 
	register_deactivation_hook(__FILE__, array('KmC2_Maps', 'deactivate')); 

	// instantiate the plugin
	$maps_plugin = new KmC2_Maps(); 
}


//
// This goes in the add category page
//
function kmc2_category_add_form_fields() {
	?>
	<div class="form-field">
		<label for="kmc2-visited-countries"><?php _e('Visited countries', 'kmc2_maps') ?></label>
		<input name="kmc2-visited-countries" id="kmc2-visited-countries" type="text" value="" size="40">
		<p><?php _e('Visited countries', 'kmc2_maps') ?></p>
	</div>

	<div class="form-field">
		<label for="kmc2-visited-places"><?php _e('Visited places', 'kmc2_maps') ?></label>
		<input name="kmc2-visited-places" id="kmc2-visited-places" type="text" value="" size="40">
		<p><?php _e('Visited places', 'kmc2_maps') ?></p>
	</div>
	<!--
	<div class="form-field">
		<label for="kmc2-round-trip"><?php _e('Round trip?', 'kmc2_maps') ?></label>
		<input name="kmc2-round-trip" id="kmc2-round-trip" type="text" value="" size="40">
		<p><?php _e('Round trip?', 'kmc2_maps') ?></p>
	</div>
	-->
<?php
}

//
// This goes in the edit category page
//
function kmc2_category_edit_form_fields($cat) {
		wp_register_script( 'kmc2-maps-edit-form', plugins_url( 'kmc2-maps/js/kmc2-maps-edit-form.js' , ''), array('jquery-ui-sortable'), '', true );	    

		wp_localize_script('kmc2-maps-edit-form', 'kmc2_vars', 
	    	array(
				'basepath' => plugins_url('kmc2-maps/',''),
				'siteurl' => home_url( '/' )
			)
		);
		wp_enqueue_script('kmc2-maps-edit-form');
	?>
	<tr class="form-field">
		<th scope="row" valign="top"><label for="kmc2-visited-countries"><?php _e('Visited countries'); ?></label></th>
		<td><input name="kmc2-visited-countries" id="kmc2-visited-countries" type="text" value="<?php echo(get_term_meta($cat->term_id, 'kmc2-visited-countries', true)); ?>" size="40">
		<p class="description"><?php _e('Visited countries. <a href="http://en.wikipedia.org/wiki/ISO_3166-1_alpha-3">Three digit code</a>, separated by commas. Example: "ESP,FRA"', 'kmc2_maps') ?></p>
		</td>
	</tr>
	<tr class="form-field">
		<th scope="row" valign="top"><label for="kmc2-visited-places"><?php _e('Visited places', 'kmc2_maps'); ?></label></th>
		<td>
			<table id="table-kmc2-visited-places">
				<tr>
					<th>Place name</th>
					<th>Longitude</th>
					<th>Latitude</th>
					<th><input name="kmc2-visited-places-add" type="button" value="Add place"></th>
				</tr>
				<?php
					$visited_places = json_decode(get_term_meta($cat->term_id, 'kmc2-visited-places', true), true);

					for($i=0; $i < count($visited_places); $i++) {
						// This will have to change
						// echo("<tr>");
						// echo("<td>");
						// echo($visited_places[$i]["name"]);
						// echo("</td");
						// echo("<td>");
						// echo($visited_places[$i]["lon"]);
						// echo("</td");
						// echo("<td>");
						// echo($visited_places[$i]["lat"]);
						// echo("</td");
						// echo("</tr>");
						?>

						<tr>
							<td><input type="hidden" name="kmc2-visited-places-index-<?php echo($i);?>" value="<?php echo($i);?>">
							<input name="kmc2-visited-places-name-<?php echo($i);?>" type="text" value="<?php echo(utf8_decode($visited_places[$i]["name"])); ?>" size="40"></td>
							<td><input name="kmc2-visited-places-lon-<?php echo($i);?>" type="text" value="<?php echo($visited_places[$i]["lon"]); ?>" size="40"></td>
							<td><input name="kmc2-visited-places-lat-<?php echo($i);?>" type="text" value="<?php echo($visited_places[$i]["lat"]); ?>" size="40"></td>
						</tr>
						<?php
					}
				
				if($i == 0) {
				?>
					<tr>
						<td><input type="hidden" name="kmc2-visited-places-index-<?php echo($i);?>" value="<?php echo($i);?>">
						<input name="kmc2-visited-places-name-<?php echo($i);?>" type="text" value="" size="40"></td>
						<td><input name="kmc2-visited-places-lon-<?php echo($i);?>" type="text" value="" size="40"></td>
						<td><input name="kmc2-visited-places-lat-<?php echo($i);?>" type="text" value="" size="40"></td>
					</tr>
					<?php
				} ?>
			</table>
		</td>
	</tr>
<?php
}


 
function kmc2_custom_field_save( $term_id) {
	update_term_meta($term_id, 'kmc2-visited-countries', $_POST['kmc2-visited-countries']);

	// Construct visited places JSON
	$i = 0;
	$kmc2_postdata = [];
	while(true) {
		$index = "kmc2-visited-places-index-" . $i;
		if (!isset($_POST[$index])) break;

		$index = intval($_POST[$index]);

		$name = $_POST["kmc2-visited-places-name-" . $i];
		$lon = $_POST["kmc2-visited-places-lon-" . $i];
		$lat = $_POST["kmc2-visited-places-lat-" . $i];
		
		$kmc2_postdata[$index] = Array();
		$kmc2_postdata[$index]["name"] = utf8_decode($name);
		$kmc2_postdata[$index]["lon"] = $lon;
		$kmc2_postdata[$index]["lat"] = $lat;

		$i++;
	}
	ksort($kmc2_postdata);
	update_term_meta($term_id, 'kmc2-visited-places', json_encode($kmc2_postdata));
}
// - See more at: http://designorbital.com/snippets/add-custom-field-to-category/#sthash.bdjaPKl9.dpuf

function categoriesColumnsHeader($columns) {
    $columns['kmc2-visited-countries'] = __('Visited countries');
    return $columns;
}
add_filter( 'manage_edit-category_columns', 'categoriesColumnsHeader' );
function categoriesColumnsRow($argument, $columnName, $categoryID){
        if($columnName == 'kmc2-visited-countries'){
                return get_term_meta($categoryID, 'kmc2-visited-countries', true);
        }
}




function kmc2_country_trips() {
	global $wpdb;

	$query = 'select a.*, b.name, b.slug
		from
			(
			select taxonomy_id, meta_key, meta_value as visited_countries
			from wp_taxonomymeta
			where meta_key = "kmc2-visited-countries"
			) a,
			wp_terms b
		where a.taxonomy_id = b.term_id';
	$myrows = $wpdb->get_results( $query );

	$countries = array();
	$trips = array();
	foreach ($myrows as $row) {
		$c = explode(',', $row->visited_countries);

		$trips[$row->slug] = array(
			"countries" => $c,
			"category" => $row->name,
			"slug" => $row->slug);
	
		for ($i = 0; $i < count($c); $i++) {
			if(!isset($countries[$c[$i]])) {
				$countries[$c[$i]] = array();
			}
			array_push($countries[$c[$i]], array(
				"category" => $row->name,
				"slug" => $row->slug));
		}
	}


	$return_value = json_encode(array(
			"countries" => $countries,
			"trips" => $trips
		));

	die($return_value);

}
add_action( 'wp_ajax_kmc2_country_trips', 'kmc2_country_trips' );
add_action( 'wp_ajax_nopriv_kmc2_country_trips', 'kmc2_country_trips' );


?>