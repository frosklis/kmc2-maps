<?php
/*
Plugin Name: Km C2 maps
Plugin URI: http://URI_Of_Page_Describing_Plugin_and_Updates
Description: The maps that appear on the kmc2 website
Version: 0.1
Author: Claudio Noguera
Author URI: http://claudionoguera.tk/blog
License: A "Slug" license name e.g. GPL2
*/
?>
<?php

// Require every single widget file
require('w_visited_countries.php');
require('w_viajes.php');
require('w_visualization.php');


// register Widgets
function register_map_widgets() {
    register_widget( 'Visited_Countries' );
    register_widget( 'Viajes');
    register_widget( 'Kmc2_Visualization');
}


if (!class_exists("KmC2_Maps")) { 
	class KmC2_Maps extends WP_Widget {

		public function __construct() { 
			// register actions 
			add_action( 'widgets_init', 'register_map_widgets' );
		} // END public function __construct 
		public static function activate() { 
			// Do nothing 
		} // END public static function activate 

		public static function deactivate() { 
			// Do nothing 
		} // END public static function deactivate 

		public function test_plugin () {
			echo ("esta función está dentro del plugin");
		}
	}
} //End Class KmC2_Maps

if(class_exists('KmC2_Maps')) { 
	// Installation and uninstallation hooks 
	register_activation_hook(__FILE__, array('KmC2_Maps', 'activate')); 
	register_deactivation_hook(__FILE__, array('KmC2_Maps', 'deactivate')); 

	// instantiate the plugin class 
	$maps_plugin = new KmC2_Maps(); 
}



function kmc2_category_add_form_fields() {
	?>
	<div class="form-field">
		<label for="kmc2-visited-countries"><?php _e('Visited countries') ?></label>
		<input name="kmc2-visited-countries" id="kmc2-visited-countries" type="text" value="" size="40">
		<p><?php _e('Visited countries') ?></p>
	</div>
<?php
}
function kmc2_category_edit_form_fields($cat) {
	?>
	<tr class="form-field">
		<th scope="row" valign="top"><label for="kmc2-visited-countries"><?php _e('Visited countries'); ?></label></th>
		<td><input name="kmc2-visited-countries" id="kmc2-visited-countries" type="text" value="<?php echo(get_term_meta($cat->term_id, 'kmc2-visited-countries', true)); ?>" size="40">
		<p class="description"><?php _e('Visited countries') ?></p>
		</td>
	</tr>
	<!-- <pre>
	<?php			
	global $wp_query;
	var_dump($wp_query);
	?>
	</pre> -->
<?php
}

add_action( 'category_add_form_fields', 'kmc2_category_add_form_fields' ); 
add_action( 'category_edit_form_fields', 'kmc2_category_edit_form_fields' ); 

add_action( 'create_category', 'kmc2_custom_field_save', 10, 2 );    
add_action( 'edited_category', 'kmc2_custom_field_save', 10, 2 );
 
function kmc2_custom_field_save( $term_id) {

	update_term_meta($term_id, 'kmc2-visited-countries', $_POST['kmc2-visited-countries']);
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
add_filter( 'manage_category_custom_column', 'categoriesColumnsRow', 10, 3 );




// AJAX

function prueba_AJAX() {
	$results = array('a' => 1, 'b' => 2, 'c' => 3, 'd' => 4, 'e' => 5);
	die(json_encode($results));
}
// creating Ajax call for WordPress
add_action( 'wp_ajax_prueba_AJAX', 'prueba_AJAX' );
add_action( 'wp_ajax_nopriv_prueba_AJAX', 'prueba_AJAX' );



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