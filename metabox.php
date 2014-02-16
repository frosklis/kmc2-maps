<?php

/**
 * Adds a box to the main column on the Post and Page edit screens.
 */
function kmc2_add_custom_box() {

  $screens = array( 'post', 'page', 'attachment' );

  foreach ( $screens as $screen ) {

	add_meta_box(
	  'kmc2_maps_location',
	  __( 'Where is this?', 'kmc2maps' ),
	  'kmc2_maps_inner_location_box',
	  $screen,
	  'normal',
	  'high'
	  );
  }
}
add_action( 'add_meta_boxes', 'kmc2_add_custom_box' );

/**
 * Prints the box content.
 *
 * @param WP_Post $post The object for the current post/page.
 */
function kmc2_maps_inner_location_box( $post ) {

	// Add an nonce field so we can check for it later.
	wp_nonce_field( 'kmc2_maps_inner_location_box', 'kmc2_maps_inner_location_box_nonce' );


	wp_register_script( 'kmc2-maps-edit-location', plugins_url( 'kmc2-maps/js/kmc2-maps-edit-location.min.js' , ''), array('jquery'), '', true );

	wp_enqueue_script('kmc2-maps-edit-location');

	/*
	* Use get_post_meta() to retrieve an existing value
	* from the database and use the value for the form.
	*/
	$lat = get_post_meta( $post->ID, 'geo_latitude', true );
	$lon = get_post_meta( $post->ID, 'geo_longitude', true );
	echo '<table id="kmc2_maps_post_location_edit">';
	echo '<tr>';
	echo '<td><label for="kmc2_maps_place">';
	_e( "Place", 'kmc2maps' );
	echo '</label></td>';
	echo '<td><input type="text" id="kmc2_maps_place" name="kmc2_maps_place" value="" size="25" /></td>';
	echo '<td><input name="kmc2-visited-places-get" type="button" value="'; _e('Get coordinates', 'kmc2maps'); echo '"></td>';
	echo '</tr>';
	echo '<tr>';
	echo '<tr>';
	echo '<td><label for="kmc2_maps_lat">';
	_e( "Latitude", 'kmc2maps' );
	echo '</label></td>';
	echo '<td><input type="text" id="kmc2_maps_lat" name="kmc2_maps_lat" value="' . esc_attr( $lat ) . '" size="25" /></td><td></td>';
	echo '</tr>';
	echo '<tr>';
	echo '<td><label for="kmc2_maps_lon">';
	_e( "Longitude", 'kmc2maps' );
	echo '</label></td>';
	echo '<td><input type="text" id="kmc2_maps_lon" name="kmc2_maps_lon" value="' . esc_attr( $lon ) . '" size="25" /></td><td></td>';
	echo '</tr>';
	echo '</table>';
}

/**
 * When the post is saved, saves our custom data.
 *
 * @param int $post_id The ID of the post being saved.
 */
function kmc2_maps_save_post_location( $post_id ) {

	/*
	* We need to verify this came from the our screen and with proper authorization,
	* because save_post can be triggered at other times.
	*/

	// Check if our nonce is set.
	if ( ! isset( $_POST['kmc2_maps_inner_location_box_nonce'] ) )
	return $post_id;

	$nonce = $_POST['kmc2_maps_inner_location_box_nonce'];

	// Verify that the nonce is valid.
	if ( ! wp_verify_nonce( $nonce, 'kmc2_maps_inner_location_box' ) )
	return $post_id;

	// If this is an autosave, our form has not been submitted, so we don't want to do anything.
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
	return $post_id;

	// Check the user's permissions.
	if ( 'page' == $_POST['post_type'] ) {

	if ( ! current_user_can( 'edit_page', $post_id ) )
	  return $post_id;

	} else {

	if ( ! current_user_can( 'edit_post', $post_id ) )
	  return $post_id;
	}

	/* OK, its safe for us to save the data now. */

	// Sanitize user input.
	$lat = sanitize_text_field( $_POST['kmc2_maps_lat'] );
	$lon = sanitize_text_field( $_POST['kmc2_maps_lon'] );

	// Update the meta field in the database.
	update_post_meta( $post_id, 'geo_latitude', $lat );
	update_post_meta( $post_id, 'geo_longitude', $lon );
}
add_action( 'save_post', 'kmc2_maps_save_post_location' );