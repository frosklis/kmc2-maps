<?php

/**
 * Adds trip visualization widget.
 */
class Kmc2_Trip_Visualization extends WP_Widget {

	/**
	 * Register widget with WordPress.
	 */
	function __construct() {
		parent::__construct(
			'Kmc2_Trip_Visualization', // Base ID
			'Visualization of a trip', // Name
			array( 'description' => __( 'Visualization of a trip. This widget is only useful when used in a category page.', 'kmc2_maps' ), ) // Args
		);

		if ( is_active_widget(false, false, $this->id_base) ) {
			$this->register_scripts_and_styles();
    	}

	}

	/**
	 * Front-end display of widget.
	 *
	 * @see WP_Widget::widget()
	 *
	 * @param array $args     Widget arguments.
	 * @param array $instance Saved values from database.
	 */
	public function widget( $args, $instance ) {


	    wp_localize_script('trip-visualization', 'kmc2_visualization_vars',
	    	array(
				'basepath' => plugins_url('kmc2-maps/',''),
				'siteurl' => home_url( '/' ),
				'category_id' => intval(get_query_var('cat'))
			)
		);

		if (!empty($instance['title'])){
			$title = apply_filters( 'widget_title', $instance['title'] );
		}

		echo $args['before_widget'];
		if ( !empty( $title ) ){
			echo $args['before_title'] . $title . $args['after_title'];
		}
		echo('<div class="kmc2-maps-plugin"><div id="trip-map">');
		echo('</div></div>');
		echo $args['after_widget'];
	}

	/**
	 * Back-end widget form.
	 *
	 * @see WP_Widget::form()
	 *
	 * @param array $instance Previously saved values from database.
	 */
	public function form( $instance ) {
		if ( isset( $instance[ 'title' ] ) ) {
			$title = $instance[ 'title' ];
		}
		else {
			$title = __( 'New title', 'kmc2_maps' );
		}
		?>
		<p>
		<label for="<?php echo $this->get_field_name( 'title' ); ?>"><?php _e( 'Title:' ); ?></label>
		<input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>" />
		</p>
		<?php
	}

	/**
	 * Sanitize widget form values as they are saved.
	 *
	 * @see WP_Widget::update()
	 *
	 * @param array $new_instance Values just sent to be saved.
	 * @param array $old_instance Previously saved values from database.
	 *
	 * @return array Updated safe values to be saved.
	 */
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';

		return $instance;
	}

	public function register_scripts_and_styles () {
	    // adding scripts file in the footer
		wp_register_script( 'leaflet-tiles', plugins_url( 'kmc2-maps/lib/tile.stamen.min.js' , ''), '', '', true );
		wp_register_script( 'leaflet', plugins_url( 'kmc2-maps/lib/leaflet.min.js', ''), '', '', true );
	    wp_register_script ('leaflet-cluster', plugins_url( 'kmc2-maps/lib/leaflet.markercluster.js' , ''), array('leaflet'), '', true);
	    wp_register_script ('leaflet-fullscreen', plugins_url( 'kmc2-maps/lib/Control.Fullscreen.min.js' , ''), array('leaflet'), '', true);
		wp_register_script( 'trip-visualization', plugins_url( 'kmc2-maps/js/kmc2-trip-visualization.min.js' , ''), array( 'jquery', 'leaflet', 'leaflet-tiles', 'leaflet-cluster', 'leaflet-fullscreen' ), '', true );

		// register styles
	    wp_register_style( 'kmc2-maps', plugins_url( 'kmc2-maps/css/maps.css' , ''), array(), '', 'all' );
	    // wp_register_style( 'leaflet', "http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.css");
	    wp_register_style ('leaflet', plugins_url( 'kmc2-maps/css/leaflet.css' , ''), array(), '', 'all' );
	    wp_register_style ('leaflet-cluster', plugins_url( 'kmc2-maps/css/markercluster.css' , ''), array(), '', 'all' );


	    wp_enqueue_script('trip-visualization');

	    wp_enqueue_style('kmc2-maps');
	    wp_enqueue_style('leaflet');
	    wp_enqueue_style('leaflet-cluster');

	}

} // class Kmc2_Trip_Visualization



function kmc2_trip_places() {
	$cat_id = intval($_POST['cat']);

	$return_value = get_term_meta($cat_id, 'kmc2-visited-places', true);

	die($return_value);

}
add_action( 'wp_ajax_kmc2_trip_places', 'kmc2_trip_places' );
add_action( 'wp_ajax_nopriv_kmc2_trip_places', 'kmc2_trip_places' );

?>
