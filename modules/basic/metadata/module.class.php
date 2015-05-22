<?php 

class DPC_Module_Basic_Metadata implements DPC_Module_Interface {
	
	var $dpc				= null;
	var $isSubmodule		= true;
	var $moduleDirectory 	= 'basic/';
	var $moduleTitle 		= '';
	var $optionsHook		= 'dpc-basic-metadata';
	var $settingsFile		= false;
	var $settings			= array();
	var $translatorJs       = array();
	var $metaText			= '';
	
	function __construct(&$dpc){
		$this->dpc 			= $dpc;
		$this->moduleTitle	= $this->dpc->getText('Metadata');
		$this->settingsFile = dirname(__FILE__) . '/settings.xml';
		$this->settings 	= $this->dpc->getModuleSettings('basic_metadata');
		
		add_action('edit_category_form_fields', array($this, 'editCategoryDescriptionField'));
		add_action('category_add_form_fields', array($this, 'addCategoryDescriptionField'));
		add_action('edited_category', array($this, 'saveCategoryDescriptionField'));
		add_action('create_category', array($this, 'saveCategoryDescriptionField'));
		add_action('add_meta_boxes', array($this,'add_seo_metabox_callback'));
		add_action('save_post', array($this,'dpc_metabox_save'));
		add_shortcode('dpc_metadescription', array(&$this, 'the_metadescription'));
	}
	
	function getTranslationJs(){
		return array(
				'tooMuchChars' 		=> $this->dpc->getText('characters too much'),
				'remainChars' 	 	=> $this->dpc->getText('characters left'),
				'warning'			=> $this->dpc->getText('Warning'),
				'duplicateTitle' 	=> $this->dpc->getText('The title is already used by another post'),
				'duplicateDesc' 	=> $this->dpc->getText('The description is already used by another post'),
				'withPost'			=> $this->dpc->getText('View post')
		);
	}
	
	
	function add_seo_metabox_callback() {
		$screens = $this->dpc->oFunctions->getCustomPostTypes();

		foreach ( $screens as $screen ) {
			add_meta_box('dpc-seo-metabox', $this->dpc->getText('SEO Settings'), array($this,'seo_metabox_callback'), $screen['name'], 'side', 'default'); 
		}
	}
	
	
	function seo_metabox_callback($post) {
		wp_nonce_field(basename( __FILE__ ), 'dpc_nonce');
		echo '<p><label><input type="checkbox" name="no_index" '.(get_post_meta( $post->ID, 'no_index', true ) == 'on' ? 'checked="checked"' : '').'>'.$this->dpc->getText('Don’t allow search engines to index this page').'</label></p>';
		echo '<p><label><input type="checkbox" name="no_follow" '.(get_post_meta( $post->ID, 'no_follow', true ) == 'on' ? 'checked="checked"' : '').'>'.$this->dpc->getText('Don’t allow search engines to follow this page').'</label></p>';
	}
	
	function dpc_metabox_save($post_id) {
	    $is_autosave = wp_is_post_autosave( $post_id );
	    $is_revision = wp_is_post_revision( $post_id );
	    $is_valid_nonce = (isset($_POST['dpc_nonce']) && wp_verify_nonce($_POST[ 'dpc_nonce' ], basename(__FILE__))) ? 'true' : 'false';
	 
	    if($is_autosave || $is_revision || !$is_valid_nonce){
	        return;
	    } 
		
		update_post_meta( $post_id, 'no_index', (isset($_POST['no_index']) === true ? $_POST['no_index'] : ''));
		update_post_meta( $post_id, 'no_follow', (isset($_POST['no_follow']) === true ? $_POST['no_follow'] : ''));
	}
	


	function getMetaText(){
		return htmlspecialchars($this->dpc->getText('Some themes are using their own output for the website title. In order for the meta title to work please check the header.php of your theme and search for the <title> tag. Change the code between <title> and </title> to <?php echo wp_title(); ?>. If no header.php exists please contact the provider/developer of your theme and ask them for the position of the meta title.'), ENT_QUOTES);
	}
	
	function adminSettings(){
		$this->dpc->parseSettingsByXml($this->settingsFile, 'general');
	}
	 
	function adminSettingsHead(){
		wp_enqueue_style('dpc-basic-metadata-settings', plugins_url( 'assets/css/settings.css', __FILE__ ));		
		wp_enqueue_script('dpc-basic-metadata-settings', plugins_url( 'assets/js/settings.js', __FILE__ ), array('jquery'));
	}

	function adminHead(){
		add_action('admin_enqueue_scripts', array($this, 'hook_admin_enqueue_scripts'));
		add_action('load-post.php', array($this, 'hook_load_post_php'));
		add_action('load-post-new.php', array($this, 'hook_load_post_new_php'));
	}
	
	function hook_admin_enqueue_scripts(){
		$objectID = isset($_REQUEST['post']) ? $_REQUEST['post'] : 0;
		echo '<script type="text/javascript">'."\n";
		echo '	var dpc_basic_metadata_settings = ' . json_encode($this->dpc->getModuleSettings('basic_metadata')) . ";\n";
		echo '	var dpc_lang = "' . $this->dpc->getModuleInstance('basic_metadata')->getLang($objectID) . '";' . "\n";
		echo '</script>'."\n";
	}
	
	function hook_load_post_php(){
		wp_enqueue_script('dpc-basic-metadata-backend', plugins_url('assets/js/backend.js', __FILE__), array('jquery'));
		wp_localize_script('dpc-basic-metadata-backend', 'dpc_basic_metadata_translator', $this->getTranslationJs());
	}
	
	function hook_load_post_new_php(){
		wp_enqueue_script('dpc-basic-metadata-backend', plugins_url('assets/js/backend.js', __FILE__), array('jquery'));
		wp_localize_script('dpc-basic-metadata-backend', 'dpc_basic_metadata_translator', $this->getTranslationJs());
	}
	
	function hook_widgets_init(){
		require_once( 'widgets/description.php' );
		register_widget( 'DelucksMetaDescription' );
	}
	
	function executeBackendActions(){ 
		$this->dpc->registerAjaxAction('dpc-metadata-check-duplicate-title', array($this, 'ajaxCheckDuplicateTitle'));
		$this->dpc->registerAjaxAction('dpc-metadata-check-duplicate-description', array($this, 'ajaxCheckDuplicateDescription'));
	}
	
	function executeFrontendActions(){ 
		add_filter('wp_title',		array($this, 'filterWpTitle'), 1000, 3);
		add_action('wp_head', 		array($this, 'metaTags'));
	}
	
	function registerWidgets(){
		add_action( 'widgets_init', array(&$this, 'hook_widgets_init'));
	}
	
	function editCategoryDescriptionField( $tag ) {
		$t_id		= $tag->term_id;
		$cat_meta	= get_option( "category_$t_id");
		$lang 		= (defined('ICL_LANGUAGE_CODE') && ICL_LANGUAGE_CODE != 'all' ? ICL_LANGUAGE_CODE : $this->getLang(0));
		?>
			<tr class="form-field">
				<th scope="row" valign="top"><label for="dpc-description[<?php echo $lang; ?>]"><?php echo $this->dpc->getText('SEO Description'); ?></label></th>
				<td><textarea name="dpc-description[<?php echo $lang; ?>]" id="dpc-description[<?php echo $lang; ?>]"><?php echo $cat_meta['dpc-description_'.$lang] ? $cat_meta['dpc-description_'.$lang] : ''; ?></textarea></td>
			</tr>
		<?php
	}
	
	function addCategoryDescriptionField( $tag ) {
		$t_id		= $tag->term_id;
		$cat_meta	= get_option( "category_$t_id");
		$lang 		= (defined('ICL_LANGUAGE_CODE') && ICL_LANGUAGE_CODE != 'all' ? ICL_LANGUAGE_CODE : $this->getLang(0));
		
		?>
			<div class="form-field">
				<label for="dpc-description[<?php echo $lang; ?>]"><?php echo $this->dpc->getText('SEO Description'); ?></label>
				<textarea name="dpc-description[<?php echo $lang; ?>]" id="dpc-description[<?php echo $lang; ?>]"><?php echo $cat_meta['dpc-description_'.$lang] ? $cat_meta['dpc-description_'.$lang] : ''; ?></textarea><br />
			</div>
		<?php
	}
	
	function saveCategoryDescriptionField( $term_id ) {
		if ( isset( $_POST['dpc-description'] ) ) {
			$t_id = $term_id;
			$cat_meta = get_option( "category_$t_id");
			$cat_keys = array_keys($_POST['dpc-description']);
			foreach ($cat_keys as $key){
				if (isset($_POST['dpc-description'][$key])){
					$cat_meta['dpc-description_'.$key] = $_POST['dpc-description'][$key];
				}
			}
			update_option( "category_$t_id", $cat_meta );
		}
	}

	function check($objectID){
		global $wpdb;

		$object = get_post($objectID);
		if (null != $object){
			$sql = $wpdb->prepare("SELECT ID FROM {$wpdb->posts} WHERE post_status = 'publish' AND post_title LIKE %s", $object->post_title);
			if (intval($objectID) > 0){
				$sql .= ' AND ID != ' . intval($objectID);
			}
			$id  = $wpdb->get_var($sql);
			if (!is_null($id)){
				if(function_exists('wpml_get_language_information')){
					$current_post_language_information = wpml_get_language_information($objectID);
					$post_language_information = wpml_get_language_information($id);
					if($post_language_information['locale'] == $current_post_language_information['locale']){
						$this->dpc->log->addWarning($objectID, 'The title is already used by another post');
					}
				} else {
					$this->dpc->log->addWarning($objectID, 'The title is already used by another post');
				}
			}
			
			//desc
			$desc = get_post_meta($objectID, 'dpc-textopt-description', true);
			if ($desc !== false && trim($desc) != ''){
				$sql = $wpdb->prepare("SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key LIKE 'dpc-textopt-description' AND meta_value LIKE %s", $desc);
				if (intval($objectID) > 0){
					$sql .= ' AND post_id != ' . intval($objectID);
				}
				$id  = $wpdb->get_var($sql);
				if (!is_null($id)){
					if(function_exists('wpml_get_language_information')){
						$current_post_language_information = wpml_get_language_information($objectID);
						$post_language_information = wpml_get_language_information($id);
						if($post_language_information['locale'] == $current_post_language_information['locale']){
							$this->dpc->log->addWarning($objectID, 'The description is already used by another post');
						}
					} else {
						$this->dpc->log->addWarning($objectID, 'The description is already used by another post');
					}
				}
			}
			
			$lang = $this->getLang($objectID);
			if (isset($this->settings[$lang])){
				//title counter
				$counter = intval($this->settings['titleLimit']) - strlen(utf8_decode($this->settings[$lang]['title']['delimiter'])) - strlen(utf8_decode($this->settings[$lang]['title']['website'])) - strlen(utf8_decode($object->post_title));
				if ($counter < 0){
					$this->dpc->log->addWarning($objectID, 'The title has %d characters too much', array($counter * -1));
				}
				//desc counter
				$desc = get_post_meta($objectID, 'dpc-textopt-description', true);
				if ($desc !== false){
					$counter = intval($this->settings['descLimit']) - strlen(utf8_decode($desc));
					if ($counter < 0){
						$this->dpc->log->addWarning($objectID, 'The description has %d characters too much', array($counter * -1));
					}
				}
			}
			
		}
	}
	
	function getLang($objectID = 0){
		if (function_exists('wpml_get_language_information') && intval($objectID) > 0){
			$lang = wpml_get_language_information($objectID);
			$lang = $lang['locale'];
		}else{
			$lang = get_locale();
		}
		$lang = substr($lang, 0, strpos($lang, '_'));
		return $lang;
	}
	
	function ajaxCheckDuplicateTitle(){
		global $wpdb;
		$sql = $wpdb->prepare("SELECT ID FROM {$wpdb->posts} WHERE post_status = 'publish' AND post_title LIKE %s", $_REQUEST['title']);
		if (intval($_REQUEST['exclusive-id']) > 0){
			$sql .= ' AND ID != ' . intval($_REQUEST['exclusive-id']);
		}
		$id  = $wpdb->get_var($sql);
		
		if (is_null($id)){
			echo json_encode(array('hasDuplicate' => false));
		} else {
			if(function_exists('wpml_get_language_information')){
				$current_post_language_information = wpml_get_language_information(intval($_REQUEST['exclusive-id']));
				$post_language_information = wpml_get_language_information($id);
				if($post_language_information['locale'] == $current_post_language_information['locale']){
					echo json_encode(array( 'hasDuplicate' => true, 'posts' => array('id' => $id, 'url' => get_permalink($id))));
				} else {
					echo json_encode(array('hasDuplicate' => false));
				}		
			} else {
				echo json_encode(array( 'hasDuplicate' => true, 'posts' => array('id' => $id, 'url' => get_permalink($id))));
			}
		}
	}

	function ajaxCheckDuplicateDescription(){
		global $wpdb;
		$sql = $wpdb->prepare("SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key LIKE 'dpc-textopt-description' AND meta_value LIKE %s", $_REQUEST['description']);
		if (intval($_REQUEST['exclusive-id']) > 0){
			$sql .= ' AND post_id != ' . intval($_REQUEST['exclusive-id']);
		}
		$id  = $wpdb->get_var($sql);
		
		if (is_null($id)){
			echo json_encode(array('hasDuplicate' => false));
		} else {
			if(function_exists('wpml_get_language_information')){
				$current_post_language_information = wpml_get_language_information(intval($_REQUEST['exclusive-id']));
				$post_language_information = wpml_get_language_information($id);
				if($post_language_information['locale'] == $current_post_language_information['locale']){
					echo json_encode(array( 'hasDuplicate' => true, 'posts' => array('id' => $id, 'url' => get_permalink($id))));
				} else {
					echo json_encode(array('hasDuplicate' => false));
				}
			} else {
				echo json_encode(array( 'hasDuplicate' => true, 'posts' => array('id' => $id, 'url' => get_permalink($id))));
			}	
		}
	}
	
	function filterWpTitle($title, $sep,$seplocation){
		if (defined("ICL_LANGUAGE_CODE")){ // notice: not 100% 
			$lang = ICL_LANGUAGE_CODE;
		} else {
			$lang = substr(get_locale(), 0, strpos(get_locale(), '_'));
		}

		if((!is_home() || !is_front_page()) && isset($this->settings[$lang]['title']['delimiter']) && strlen($this->getTitle($this->settings[$lang]['title']['delimiter']))){
			$this->settings[$lang]['title']['frontpage'] = $this->getTitle($this->settings[$lang]['title']['delimiter']);
		}
		
		if(isset($this->settings['removePagename']) && isset($this->settings[$lang])){
			if(strlen(implode(' ', $this->settings[$lang]['title'])) - (count($this->settings[$lang]) - 1) > intval($this->settings['titleLimit'])){
				unset($this->settings[$lang]['title']['website'], $this->settings[$lang]['title']['delimiter']);
			}
		}
		
		if(isset($this->settings[$lang])){
			$title = implode(' ', $this->settings[$lang]['title']);
		}
		
		return $title;
	}
	
	
	
	function metaTags(){
		global $post;
		$desc = '';
		
		if(defined("ICL_LANGUAGE_CODE")){ //notice: not 100%
			$lang = ICL_LANGUAGE_CODE;
		} else {
			$lang = substr(get_locale(), 0, strpos(get_locale(), '_'));
		}

		$title  = wp_title(isset($this->settings[$lang]['title']['delimiter']) ? $this->settings[$lang]['title']['delimiter'] : '&raquo;', false);
		$type   = 'website';
		$url 	= (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
		
		if(is_singular()){
			$id 	= get_queried_object_id();
			$desc	= get_post_meta($id, 'dpc-textopt-description', true);
			
			if(!$desc){
				if(isset($this->settings[$lang]['desc']) && !empty($this->settings[$lang]['desc'])){
					$desc = $this->settings[$lang]['desc'];			
				} else {
					$desc = wp_trim_excerpt(get_queried_object()->post_content);
				}
			}			
			
			if (has_post_thumbnail($id)){
				$thumbnail = get_the_post_thumbnail($id, 'full');
				if (preg_match('|\ssrc="(.*?)"|i', $thumbnail, $matches)){
						$thumbnail = $matches[1];
				}else{
					$thumbnail = false;
				}
			}
			
			$type = get_queried_object()->post_type == 'post' ? 'article' : 'website';
			
		} elseif(is_category()){
			global $cat;
			$cat = get_option('category_'.$cat);
			$lang = $this->getLang();
			if(isset($cat['dpc-description']) && isset($cat['dpc-description_'.$lang])){
				$desc = $cat['dpc-description_'.$lang];
			}
		} else {
			if (isset($this->settings[$lang]['desc'])){
				$desc = $this->settings[$lang]['desc'];
			}
		}
		
		echo '<meta property="og:title" content="'.trim(esc_attr($title)).'" />'."\n";
		echo strlen($desc) ? '<meta name="description" content="'.esc_attr($desc).'" />'."\n" : '';
		echo strlen($desc) ? '<meta property="og:description" content="'.esc_attr($desc).'" />'."\n" : '';
		echo isset($thumbnail) ? '<meta property="og:image" content="'.esc_attr($thumbnail).'" />'."\n" : '';
		echo '<meta property="og:url" content="'.esc_attr($url).'" />'."\n";
		echo '<meta property="og:type" content="'.$type.'" />'."\n";
		
		
		if(is_front_page()){
			if(isset($this->settings['verify'])){
				echo (isset($this->settings['verify']['alexa']) && strlen(isset($this->settings['verify']['alexa'])) ? '<meta name="alexaVerifyID" content="'.$this->settings['verify']['alexa'].'"/>'."\n" : '');
				echo (isset($this->settings['verify']['bing']) && strlen(isset($this->settings['verify']['bing'])) ? '<meta name="msvalidate.01" content="'.$this->settings['verify']['bing'].'"/>'."\n" : '');
				echo (isset($this->settings['verify']['google']) && strlen(isset($this->settings['verify']['google'])) ? '<meta name="google-site-verification" content="'.$this->settings['verify']['google'].'"/>'."\n" : '');
				echo (isset($this->settings['verify']['pinterest']) && strlen(isset($this->settings['verify']['pinterest'])) ? '<meta name="p:domain_verify" content="'.$this->settings['verify']['pinterest'].'"/>'."\n" : '');
			}
		}
		
		if((is_tag() || is_category() || is_tax() || is_archive()) && isset($this->settings['follow_texonomies'])){
			$options = array();
			$options[] = $this->settings['follow_texonomies'] ? $this->settings['follow_texonomies'] : 'nofollow';
			$options[] = $this->settings['index_texonomies'] ? $this->settings['index_texonomies'] : 'noindex';
			echo '<meta name="robots" content="'.implode(',', $options).'">'."\n"; 
		}
		
		if(is_paged() && isset($this->settings['follow_paginated'])){
			$options = array();
			$options[] = $this->settings['follow_paginated'] ? $this->settings['follow_paginated'] : 'nofollow';
			$options[] = $this->settings['index_paginated'] ? $this->settings['index_paginated'] : 'noindex';
			echo '<meta name="robots" content="'.implode(',', $options).'">'."\n";
		}

		if(is_object($post)){
			$options = array();
			get_post_meta( $post->ID, 'no_index', true ) == 'on' ? $options[] = 'noindex' : '';
			get_post_meta( $post->ID, 'no_follow', true ) == 'on' ? $options[] = 'nofollow' : '';
			if(count($options)){
				echo '<meta name="robots" content="'.implode(',', $options).'">'."\n";
			}
		}

	}
	
	function getTitle($sep = '&raquo;', $seplocation = '') {
		global $wpdb, $wp_locale;
	
		$m = get_query_var('m');
		$year = get_query_var('year');
		$monthnum = get_query_var('monthnum');
		$day = get_query_var('day');
		$search = get_query_var('s');
		$title = '';
	
		$t_sep = '%WP_TITILE_SEP%'; // Temporary separator, for accurate flipping, if necessary
	
		// If there is a post
		if ( is_single() || ( is_home() && !is_front_page() ) || ( is_page() && !is_front_page() ) ) {
			$title = single_post_title( '', false );
		}
	
		// If there's a post type archive
		if ( is_post_type_archive() ) {
			$post_type = get_query_var( 'post_type' );
			if ( is_array( $post_type ) )
				$post_type = reset( $post_type );
			$post_type_object = get_post_type_object( $post_type );
			if ( ! $post_type_object->has_archive )
				$title = post_type_archive_title( '', false );
		}
	
		// If there's a category or tag
		if ( is_category() || is_tag() ) {
			$title = single_term_title( '', false );
		}
	
		// If there's a taxonomy
		if ( is_tax() ) {
			$term = get_queried_object();
			if ( $term ) {
				$tax = get_taxonomy( $term->taxonomy );
				$title = single_term_title( $tax->labels->name . $t_sep, false );
			}
		}
	
		// If there's an author
		if ( is_author() ) {
			$author = get_queried_object();
			if ( $author )
				$title = $author->display_name;
		}
	
		// Post type archives with has_archive should override terms.
		if ( is_post_type_archive() && $post_type_object->has_archive )
			$title = post_type_archive_title( '', false );
	
		// If there's a month
		if ( is_archive() && !empty($m) ) {
			$my_year = substr($m, 0, 4);
			$my_month = $wp_locale->get_month(substr($m, 4, 2));
			$my_day = intval(substr($m, 6, 2));
			$title = $my_year . ( $my_month ? $t_sep . $my_month : '' ) . ( $my_day ? $t_sep . $my_day : '' );
		}
	
		// If there's a year
		if ( is_archive() && !empty($year) ) {
			$title = $year;
			if ( !empty($monthnum) )
				$title .= $t_sep . $wp_locale->get_month($monthnum);
			if ( !empty($day) )
				$title .= $t_sep . zeroise($day, 2);
		}
	
		// If it's a search
		if ( is_search() ) {
			/* translators: 1: separator, 2: search phrase */
			$title = sprintf(__('Search Results %1$s %2$s'), $t_sep, strip_tags($search));
		}
	
		// If it's a 404 page
		if ( is_404() ) {
			$title = __('Page not found');
		}
	
		$prefix = '';
		if ( !empty($title) )
			$prefix = " $sep ";
	
		// Determines position of the separator and direction of the breadcrumb
		if ( 'right' == $seplocation ) { // sep on right, so reverse the order
			$title_array = explode( $t_sep, $title );
			$title_array = array_reverse( $title_array );
			$title = implode( " $sep ", $title_array ) ;
		} else {
			$title_array = explode( $t_sep, $title );
			$title = implode( " $sep ", $title_array );
		}
	
		return $title;
	}
	
	function showForm($objectType = null){
		if($objectType == 'post'){
			$this->dpc->parseSettingsByXml($this->settingsFile, 'manager', false, true);
		}
	}
	
	function managerUpdate(){
		$formdata = $_REQUEST['dpc']['basic_metadata'];
		if(isset($formdata['title'])){
			wp_update_post(array('ID' => $formdata['object_id'], 'post_title' => $formdata['title']));
		}
		if(isset($formdata['keyword'])){
			update_post_meta($formdata['object_id'], 'dpc_keyword', $formdata['keyword']);
		}
		if(isset($formdata['description'])){
			update_post_meta($formdata['object_id'], 'dpc-textopt-description', $formdata['description']);
		}
		update_option('dpc-suite-updated-'.md5($formdata['object_id']), true);
	}
	
	function the_metadescription(){
		$lang = (defined('ICL_LANGUAGE_CODE') && ICL_LANGUAGE_CODE != 'all' ? ICL_LANGUAGE_CODE : $this->getLang(0));
		if(is_singular()){
			$id 	= get_queried_object_id();
			$desc	= get_post_meta($id, 'dpc-textopt-description', true);
			
			if(!$desc){
				if(isset($this->settings[$lang]['desc']) && !empty($this->settings[$lang]['desc'])){
					$desc = $this->settings[$lang]['desc'];			
				} else {
					$desc = wp_trim_excerpt(get_queried_object()->post_content);
				}
			}			
		}elseif(is_category()){
			global $cat;
			$cat = get_option('category_'.$cat);
			$lang = $this->getLang();
			if(isset($cat['dpc-description']) && isset($cat['dpc-description_'.$lang])){
				$desc = $cat['dpc-description_'.$lang];
			}
		}
		
		return $desc;
	}
	
	function dpc_metadescription(){
	    return  $this->the_metadescription();
	}
}

if(!function_exists('dpc_metadescription')){
	function dpc_metadescription(){
		if(shortcode_exists('dpc_metadescription')){
			return do_shortcode('[dpc_metadescription]');
		}
	}
}
