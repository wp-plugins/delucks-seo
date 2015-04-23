<?php
// Creating the description widget 
	class DelucksMetaDescription extends WP_Widget {
		
		function DelucksMetaDescription() {
			// Instantiate the parent object
			parent::__construct('DelucksMetaDescription', __('Meta description', 'dpc'), array( 'description' => __( 'Nutzen Sie die Meta-Beschreibung Ihres Beitrags/Seite als Einleitungstext für Ihre Besucher.', 'dpc' ), ));
		}

		function widget( $args, $instance ) {
			global $plugin_dpc;
			$module = $plugin_dpc->getModuleInstance('basic', 'metadata')->settings;;
			echo $plugin_dpc->getModuleInstance('basic', 'metadata')->the_metadescription();
		}
		
		function update( $new_instance, $old_instance ) {
			$instance = array();
			$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
			return $instance;
		}
				
		function form( $instance ) {
			if ( isset( $instance[ 'title' ] ) ) {
				$title = $instance[ 'title' ];
			}
		?>
			<p>
				<label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e( 'Title' ); ?>:</label> 
				<input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>" />
			</p>
		<?php 
		}
	} 
?>