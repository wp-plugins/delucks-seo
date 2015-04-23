<?php 

class DPC_Module_Basic_Textopt implements DPC_Module_Interface {
	
	var $dpc				= null;
	var $isSubmodule		= true;
	var $moduleDirectory 	= 'basic/';
	var $moduleTitle 		= '';
	var $optionsHook		= 'dpc-basic-textopt';
	var $settingsFile		= false;
	var $settings			= array();
	var $translatorJs       = array();
	
	function adminHead(){ 
		wp_enqueue_script('dpc-basic-textopt-backend', plugins_url( 'assets/js/backend.js', __FILE__ ), array('jquery-ui-autocomplete'));
		wp_localize_script('dpc-basic-textopt-backend', 'dpc_basic_textopt_translator', $this->translatorJs);
		wp_enqueue_style('dpc-basic-textopt-settings', plugins_url( 'assets/css/backend.css', __FILE__ ));	
	}
	
	function executeFrontendActions(){ 
		add_action('wp_head', array($this, 'metaTags'));
	}
	
	function __construct(&$dpc){
		$this->dpc 			= $dpc;
		$this->moduleTitle	= $this->dpc->getText('Text optimization');
		$this->settingsFile = dirname(__FILE__) . '/settings.xml';
		$this->settings 	= $this->dpc->getModuleSettings('basic_textopt');
		$this->translatorJs = array(
				'title' 				=> $this->dpc->getText('Title'),
				'super' 	 			=> $this->dpc->getText('Super'),
				'keyword'				=> $this->dpc->getText('Keyword'),
				'inTitle' 				=> $this->dpc->getText('found in the title'),
				'warn' 					=> $this->dpc->getText('Warning'),
				'notInTitle'			=> $this->dpc->getText('not found in the title'),
				'desc'					=> $this->dpc->getText('Description'),
				'inDesc'				=> $this->dpc->getText('found in the description'),
				'notInDesc'				=> $this->dpc->getText('not found in the description'),
				'content'				=> $this->dpc->getText('Content'),
				'inContent'				=> $this->dpc->getText('found in the content'),
				'notInContent'			=> $this->dpc->getText('not found in the content'),
				'keywordTooltip'		=> $this->dpc->getText('Please enter a phrase or term with which this content should be found. This field serves to focus on the content about your topic.'),
				'descriptionTooltip'	=> $this->dpc->getText('The description is used primarily as a preview for the search results of Google (so-called "Meta description"). You can also make use of the description as an introduction and make it visible by installing it on our PHP code in your theme (see Basic settings> Text optimization).')
		);
	}

	function adminSettings(){
		$this->dpc->parseSettingsByXml($this->settingsFile, 'general');
	}
	
	function adminSettingsHead(){
		wp_enqueue_style('dpc-basic-textopt-settings', plugins_url( 'assets/css/settings.css', __FILE__ ));		 
	}
	
	function registerWidgets(){ }
	
	function executeBackendActions(){
		add_action('add_meta_boxes', array( &$this, 'addMetaBoxes' ) );
		//add_action('admin_footer', array($this, 'moveBoxes') );
		add_action('save_post', array(&$this, 'savePost'));
		add_action('admin_enqueue_scripts', array(&$this, 'hook_admin_enqueue_scripts'));
	}
	
	function hook_admin_enqueue_scripts(){
		echo '<script type="text/javascript">'."\n";
		echo '	var dpc_basic_textopt_settings = ' . json_encode($this->dpc->getModuleInstance('basic_textopt')->settings) . ";\n";
		echo '	var dpc_basic_textopt_suggest_callback = "' . (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 'https://' : 'http://') . 'suggestqueries.google.com/complete/search?callback=?";';
		echo '</script>'."\n";
	}
	
	function check($objectID){
		$object = get_post($objectID);
		
		if (!is_null($object) ){
			$title = $object->post_title;
			if(trim($title) == ''){
				$this->dpc->log->addWarning($objectID, 'Title not defined');
			}
			
			if (isset($this->settings['keywords'])){
				$keyword 	= get_post_meta($objectID, 'dpc_keyword', true);
				$desc		= get_post_meta($objectID, 'dpc-textopt-description', true);
				if ($keyword !== false && trim($keyword) != ''){
					if (in_array('title', $this->settings['keyword'])){
						if (!preg_match('/\s'.$keyword.'\s/i', ' '.$title.' ')){
							$this->dpc->log->addWarning($objectID, 'Keyword not found in the title');
						}
					}
			
					if(in_array('description', $this->settings['keyword'])){
						if (!preg_match('/\s'.$keyword.'\s/i', ' '.$desc.' ')){
							$this->dpc->log->addWarning($objectID, 'Keyword not found in the description');
						}
					}
			
					if(in_array('content', $this->settings['keyword'])){
						$content = apply_filters('the_content', $object->post_content);
						if (!preg_match('/[\s<>]'.$keyword.'[\s<>]/i', ' '.$content.' ')){
							$this->dpc->log->addWarning($objectID, 'Keyword not found in the content');
						}
					}
				}else{
					$this->dpc->log->addWarning($objectID, 'Keyword not defined');
				}
			}
		}
	}
		
	function metaTags(){
		if (is_singular()){
			$id 		= get_queried_object_id();
			$keyword 	= get_post_meta($id, 'dpc_keyword', true);
			$desc		= get_post_meta($id, 'dpc-textopt-description', true);
			
			if ($keyword !== false && !empty($keyword)){
				echo '<meta name="keywords" content="'.esc_attr($keyword).'" />';
			}
			/* in metadata module 
			if ($desc !== false && !empty($desc)){
				echo '<meta name="description" content="'.esc_attr($desc).'" />';				
			}
			*/
		}
	}
	
	function addMetaBoxes($post_type){
		if (isset($this->settings['keywords']) && $this->settings['keywords'] == 'on'){
			add_meta_box(
				'dpc-textopt-keyword-box'
				,$this->dpc->getText('Keyword')
				,array( $this, 'renderMetaBoxKeyword' )
				,$post_type
				,'advanced'
				,'high'
			);
		}
		add_meta_box(
			'dpc-textopt-description-box'
				,$this->dpc->getText('Description')
				,array( $this, 'renderMetaBoxKeywordDescription' )
				,$post_type
				,'advanced'
				,'high'
		);
	}
	
	function renderMetaBoxKeyword($post){
		wp_nonce_field( 'dpc-textopt-keyword_meta_box', 'dpc-textopt-keyword_meta_box_nonce' );
		$value = get_post_meta( $post->ID, 'dpc_keyword', true );
		echo '<input type="text" id="dpc-textopt-keyword" name="dpc-textopt-keyword" value="' . esc_attr( $value ) . '" size="25" />';
		echo '<div id="dpc-keyword-in-title"></div>';
		echo '<div id="dpc-keyword-in-description"></div>';
		echo '<div id="dpc-keyword-in-content"></div>';
	}
	
	function renderMetaBoxKeywordDescription($post){
		wp_nonce_field( 'dpc-textopt-description_meta_box', 'dpc-textopt-description_meta_box_nonce' );
		$value = get_post_meta( $post->ID, 'dpc-textopt-description', true );
		echo '<input type="text" id="dpc-textopt-description" name="dpc-textopt-description" value="' . esc_attr( $value ) . '" size="25" />';
	}
	
	function moveBoxes(){
		echo '<script type="text/javascript"> 
				jQuery(document).ready(function($) { 
					if ($("#dpc-textopt-keyword-box").length > 0){ 
						$("#dpc-textopt-keyword-box").insertBefore("#titlediv") ;
					}
					if ($("#dpc-textopt-description-box").length > 0){
						$("#dpc-textopt-description-box").insertBefore("#postdivrich") ; 
					}
					
				}) ; </script>';
	}
	
	function savePost($postId){
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}
		if (isset( $_POST['dpc-textopt-keyword_meta_box_nonce']) && wp_verify_nonce( $_POST['dpc-textopt-keyword_meta_box_nonce'], 'dpc-textopt-keyword_meta_box' ) ) {
			$keyword = sanitize_text_field( $_POST['dpc-textopt-keyword'] );
			update_post_meta( $postId, 'dpc_keyword', $keyword );
		}
		
		if (isset( $_POST['dpc-textopt-description_meta_box_nonce']) && wp_verify_nonce( $_POST['dpc-textopt-description_meta_box_nonce'], 'dpc-textopt-description_meta_box' ) ) {	
			$keyword = sanitize_text_field( $_POST['dpc-textopt-description'] );
			update_post_meta( $postId, 'dpc-textopt-description', $keyword );
		}
	}  
}