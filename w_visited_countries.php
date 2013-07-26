<?php

/**
 * Adds Visited_Countries widget.
 */
class Visited_Countries extends WP_Widget {

	/**
	 * Register widget with WordPress.
	 */
	function __construct() {
		parent::__construct(
			'visited_countries', // Base ID
			'Visited Countries', // Name
			array( 'description' => __( 'Map showing visited countries', 'kmc2_maps' ), ) // Args
		);

		if ( is_active_widget(false, false, $this->id_base) ) {

		    //adding scripts file in the footer
		    // con plugins_url( 'js/d3.v3.min.js' , __FILE__ )
		    wp_register_script( 'd3', plugins_url( 'kmc2-maps/lib/d3.v3.min.js' , ''), '', '', false );
		    wp_register_script( 'queue', plugins_url( 'kmc2-maps/lib/queue.v1.min.js' , ''), '', '', false );
		    wp_register_script( 'd3-geo-projection', plugins_url( 'kmc2-maps/lib/d3.geo.projection.v0.min.js' , ''), '', '', false );
		    wp_register_script( 'topojson', plugins_url( 'kmc2-maps/lib/topojson.v1.min.js' , ''), '', '', false );
			wp_register_script( 'visited-countries', plugins_url( 'kmc2-maps/js/visited-countries.js' , ''), array( 'd3', 'queue', 'd3-geo-projection', 'topojson' ), '', true );



			// register styles
		    wp_register_style( 'kmc2-maps', plugins_url( 'kmc2-maps/css/maps.css' , ''), array(), '', 'all' );


		    // enqueue styles and scripts
		    wp_enqueue_script('d3');
		    wp_enqueue_script('queue');
		    wp_enqueue_script('d3-geo-projection');
		    wp_enqueue_script('topojson');

		    wp_enqueue_script('visited-countries');

		    wp_enqueue_style('kmc2-maps');


            // add_action( 'wp_head', array(&$this, 'recent_comments_style') );
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
		$title = apply_filters( 'widget_title', $instance['title'] );

		echo $args['before_widget'];
		if ( ! empty( $title ) )
			echo $args['before_title'] . $title . $args['after_title'];
		echo('<div class="visited-countries-map">');
		echo('</div>');
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

} // class Visited_Countries
			


?>
