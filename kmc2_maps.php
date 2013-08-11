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


// register Widgets
function register_map_widgets() {
    register_widget( 'Visited_Countries' );
    register_widget( 'Viajes');
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


?>