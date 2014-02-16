<?php

/**
 * Adds Visited_Countries widget.
 */
class Kmc2_Visualization extends WP_Widget {

	/**
	 * Register widget with WordPress.
	 */
	function __construct() {
		parent::__construct(
			'Kmc2_Visualization', // Base ID
			'Visualization of our trips', // Name
			array( 'description' => __( 'Visualization of our trips', 'kmc2_maps' ), ) // Args
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
		// enqueue styles and scripts

	    wp_localize_script('trips-visualization', 'kmc2_visualization_vars',
	    	array(
				'basepath' => plugins_url('kmc2-maps/',''),
				'siteurl' => home_url( '/' )
			)
		);

	    wp_enqueue_script('trips-visualization');

	    wp_enqueue_style('kmc2-maps');
	    wp_enqueue_style('leaflet');

		echo $args['before_widget'];
		if ( !empty( $title ) ){
			echo $args['before_title'] . $title . $args['after_title'];
		}
		echo('<div class="kmc2-maps-plugin"><div class="maps-container"><div id="trips-visualization-map">');
		echo('</div></div></div>');
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
	    wp_register_script( 'leaflet-tiles', 'http://maps.stamen.com/js/tile.stamen.js?v1.2.4', '', '', true );
	    wp_register_script( 'leaflet', 'http://cdn.leafletjs.com/leaflet-0.7.1/leaflet.js', '', '', true );
		wp_register_script( 'trips-visualization', plugins_url( 'kmc2-maps/js/kmc2-trips-visualization.min.js' , ''), array( 'jquery', 'leaflet', 'leaflet-tiles' ), '', true );

		// register styles
	    wp_register_style( 'kmc2-maps', plugins_url( 'kmc2-maps/css/maps.css' , ''), array(), '', 'all' );
	    wp_register_style( 'leaflet', "http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.css");

	}

} // class Kmc2_Visualization


?>
