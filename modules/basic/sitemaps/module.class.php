<?php 

class DPC_Module_Basic_Sitemaps {
	
	var $dpc				= null;
	var $isSubmodule		= true;
	var $moduleDirectory 	= 'basic/';
	var $moduleTitle 		= '';
	var $optionsHook		= 'dpc-basic-sitemaps';
	var $settingsFile		= false;
	var $settings 			= array();
	
	function __construct(&$dpc){
		$this->dpc 			= $dpc;
		$this->moduleTitle	= $this->dpc->getText('Sitemaps');
		$this->settingsFile = dirname(__FILE__) . '/settings.xml';
		$this->settings 	= $this->dpc->getModuleSettings('basic_sitemaps');
	}

	function adminSettingsHead(){
		wp_enqueue_style('dpc-basic-sitemaps-settings', plugins_url( 'assets/css/settings.css', __FILE__ ));
		wp_enqueue_script('dpc-basic-sitemaps-settings', plugins_url('assets/js/settings.js', __FILE__));
	}
	
	function adminSettings(){
		$this->dpc->parseSettingsByXml($this->settingsFile, 'general');
	}
	
	function adminHead(){		
		//wp_enqueue_style ('wp-jquery-ui-dialog');		
		//wp_enqueue_script('jquery-ui-dialog');
	}
	
	function executeBackendActions(){
		$this->dpc->registerAjaxAction('dpc_basic_sitemap_notify', array($this, 'ajax_dpc_basic_sitemap_notify'));
	}
	
	function ajax_dpc_basic_sitemap_notify(){
		$notify 		= $_REQUEST['notify'];
		$type			= $_REQUEST['type'];
		$url 			= '';
		$index  		= $this->getSitemapIndex();
		$error_message 	= '';
		switch ($type){
			case 'default':
				if (isset($index['default'])){
					$si = array( 'url' => get_home_url().'/sitemap.xml');
				}
				break;
			case 'image':
				if (isset($index['images'])){
					$si = $index['images'];
				}
				break;
			case 'video':
				if (isset($index['videos'])){
					$si = $index['videos'];
				}
				break;
			case 'news':
				if (isset($index['news'])){
					$si = $index['news'];
				}
				break;
		}

		foreach ($si as $item){
			switch ($notify){
				case 'google':
					$url = 'http://www.google.com/webmasters/tools/ping?sitemap='. (is_array($item) && isset($item['url']) ? urlencode($item['url']) : urlencode($item));
					break;
				case 'bing':
					$url = 'http://www.bing.com/ping?sitemap='. (is_array($item) && isset($item['url']) ? urlencode($item['url']) : urlencode($item));
					break;
			}
			
			$result = wp_remote_get($url);
			if ( is_wp_error( $result )){
				$error_message .= $result->get_error_message();
			} elseif ( $result['response']['code'] != 200 ){
				$error_message .= " $notify Response Code: " .$result['response']['code'];
			}
		}
		
		if (!empty($error_message)){
			echo $this->dpc->getText('Error') . ': ' . $error_message;
		}else{
			foreach($result['headers'] as $key=>$header){
				if (!is_array($header)) header("$key: $header");
			}
			echo $result['body'];
		}

		die(0);
	}
	
	function executeFrontendActions(){
		add_action('init', 			array($this, 'rewriteRules'), 1000);
		add_filter('robots_txt', 	array($this, 'filterRobots'));
	}
	
	
	function filterRobots($output){
		$index = $this->getSitemapIndex();
		echo "\n";
		if (isset($this->settings['default']['status']) && $this->settings['default']['status'] == 'on'){
			echo "\nSitemap: " . get_home_url() . "/sitemap.xml";
			$output .= "\nAllow: */sitemap.xml";
			$output .= "\nAllow: */sitemap-*.xml";
		}
		
		if (isset($this->settings['images']['status']) && $this->settings['images']['status'] == 'on'){
			if (isset($index['images'])){
				foreach ($index['images'] as $item){
					echo "\nSitemap: " . $item['url'];
				}
			}
			$output .= "\nAllow: */image-sitemap.xml";
			$output .= "\nAllow: */image-sitemap-*.xml";
		}
		
		if (isset($this->settings['videos']['status']) && $this->settings['videos']['status'] == 'on'){
			if (isset($index['videos'])){
				foreach ($index['videos'] as $item){
					echo "\nSitemap: " . $item['url'];
				}
			}
			$output .= "\nAllow: */video-sitemap.xml";
			$output .= "\nAllow: */video-sitemap-*.xml";
		}
		
		if (isset($this->settings['googlenews']['status']) && $this->settings['googlenews']['status'] == 'on'){
			if (isset($index['news'])){
				foreach ($index['news'] as $item){
					echo "\nSitemap: " . $item['url'];
				}
			}
			$output .= "\nAllow: */news-sitemap.xml";
			$output .= "\nAllow: */news-sitemap-*.xml";
		}
		
		echo "\n";
		return $output;
	}
	
	function rewriteRules(){
		if (isset($this->settings['default']['status']) && $this->settings['default']['status'] = 'on'){
			//index sitemap
			add_rewrite_rule(
				preg_quote('sitemap.xml'),
				'index.php?feed=sitemap',
				'top'
			);
			add_feed('sitemap', array($this, 'load_template_sitemap'), 10, 1);
			
			//  posttype
			foreach($this->getSitemapPostTypes() as $name){
				add_rewrite_rule(
					preg_quote('sitemap-posttype-'.$name . '.xml'),
					'index.php?feed=sitemap-posttype-'.$name .'&s=1',
					'top'
				);
				add_rewrite_rule(
					preg_quote('sitemap-posttype-'.$name) . '\-([0-9]+)?\.xml',
					'index.php?feed=sitemap-posttype-'.$name .'&s=$matches[1]',
					'top'
				);
				add_feed('sitemap-posttype-'.$name, array($this, 'load_template_sitemap'), 10, 1);
			}
		}
		
		if (isset($this->settings['images']['status']) && $this->settings['images']['status'] = 'on'){
			add_rewrite_rule(
				preg_quote('image-sitemap.xml'),
				'index.php?feed=sitemap-image',
				'top'
			);
			add_rewrite_rule(
				preg_quote('image-sitemap') . '\-([0-9]+)?\.xml',
				'index.php?feed=sitemap-image&s=$matches[1]',
				'top'
			);
			add_feed('sitemap-image', array($this, 'load_template_sitemap'), 10, 1);
		}
		
		if (isset($this->settings['videos']['status']) && $this->settings['videos']['status'] = 'on'){
			add_rewrite_rule(
				preg_quote('video-sitemap.xml'),
				'index.php?feed=sitemap-video',
				'top'
			);
			add_rewrite_rule(
				preg_quote('video-sitemap') . '\-([0-9]+)?\.xml',
				'index.php?feed=sitemap-video&s=$matches[1]',
				'top'
			);
			add_feed('sitemap-video', array($this, 'load_template_sitemap'), 10, 1);
		}
		
		if (isset($this->settings['googlenews']['status']) && $this->settings['googlenews']['status'] = 'on'){
			add_rewrite_rule(
				preg_quote('news-sitemap.xml'),
				'index.php?feed=sitemap-news',
				'top'
			);
			add_rewrite_rule(
				preg_quote('news-sitemap') . '\-([0-9]+)?\.xml',
				'index.php?feed=sitemap-news&s=$matches[1]',
				'top'
			);
			add_feed('sitemap-news', array($this, 'load_template_sitemap'), 10, 1);
		}
		
		flush_rewrite_rules();
	}
	
	
	function load_template_sitemap()
	{
		global $wp_query, $wp_rewrite;
		$feed = get_query_var( 'feed' );		
		switch($feed){
			case 'sitemap':
				load_template( dirname(__FILE__) . '/inc/feed-sitemap.php' );
				break;
			case 'sitemap-image':				
				load_template( dirname(__FILE__) . '/inc/feed-sitemap-image.php' );
				break;
			case 'sitemap-video':
				load_template( dirname(__FILE__) . '/inc/feed-sitemap-video.php' );
				break;
			case 'sitemap-news':
				load_template( dirname(__FILE__) . '/inc/feed-sitemap-news.php' );
				break;
			default:
				if(is_object($wp_query) && isset($wp_query->query['feed']) && strpos($wp_query->query['feed'], 'sitemap-posttype-') == 0) {
					load_template( dirname(__FILE__) . '/inc/feed-sitemap-posttype.php' );
				}
		}
	}
	
	function getSitemapIndex(){
		global $wpdb;
		$indexs		 = array();
		
		$splictCount = $this->getSplitCount();
		$items		 = array();
		if (isset($this->settings['default']['status']) && $this->settings['default']['status'] = 'on'){
			foreach ($this->getSitemapPostTypes() as $name){
				$item  = array ();
				$count = wp_count_posts ( $name );
				$count = isset ( $count->publish ) ? $count->publish : 0;
				
				if ($splictCount == -1 || $count <= $splictCount){
					$date 			 = $wpdb->get_var("SELECT post_modified_gmt FROM $wpdb->posts WHERE post_type = '$name' AND post_status = 'publish'  ORDER BY $wpdb->posts.post_modified_gmt DESC LIMIT 1");
					$item['url'] 	 = untrailingslashit(get_home_url()). '/sitemap-posttype-'.$name.'.xml';
					$item['lastmod'] = mysql2date('Y-m-d\TH:i:s+00:00', $date, false); //mysql2date('Y-m-d\TH:i:s+00:00', $this->get_lastmodified( 'gmt', $name), false);
					$item['type']	 = $name;
					$items[] 		 = $item;
				}else{
					$paged = $count / $splictCount + ($count % $splictCount > 0 ? 1 : 0);
					for($i = 1; $i <= $paged; $i++){
						$offset 		 = ($i -1) * $splictCount;
						$date 			 = $wpdb->get_var("SELECT post_modified_gmt FROM $wpdb->posts WHERE post_type = '$name' AND post_status = 'publish'  ORDER BY $wpdb->posts.post_modified_gmt DESC LIMIT $offset, 1");
						$item['url'] 	 = untrailingslashit(get_home_url()). '/sitemap-posttype-'.$name.'-' . $i. '.xml';
						$item['lastmod'] = mysql2date('Y-m-d\TH:i:s+00:00', $date, false);
						$item['type']	 = $name;
						$items[] 		 = $item;
					}				
				}
			}
			$indexs['default'] = $items;
		}
		//--- images
		$splictCount 	= $this->getSplitCount();
		$item 			= array();
		$items		 	= array();
		if (isset($this->settings['images']['status']) && $this->settings['images']['status'] = 'on'){
			$count = $wpdb->get_var("SELECT COUNT(ID) FROM $wpdb->posts WHERE post_type = 'attachment' AND post_mime_type LIKE 'image%' AND post_status = 'inherit'");
			$count = intval($count);
			if ($splictCount == -1 || $count <= $splictCount){
				$item['url'] 	 = untrailingslashit(get_home_url()). '/image-sitemap.xml';
				$item['type']	 = 'image';
				$items[] 		 = $item;
			}else{
				$paged = $count / $splictCount + ($count % $splictCount > 0 ? 1 : 0);
				for($i = 1; $i <= $paged; $i++){
					$offset 		 = ($i -1) * $splictCount;
					$item['url'] 	 = untrailingslashit(get_home_url()). '/image-sitemap-' . $i. '.xml';
					$item['type']	 = 'image';
					$items[] 		 = $item;
				}
			}
			$indexs['images'] = $items;
		}
		// -- videos
		$splictCount 	= $this->getSplitCount();
		$item 			= array();
		$items			= array();
		if (isset($this->settings['videos']['status']) && $this->settings['videos']['status'] = 'on'){
			$count = $wpdb->get_var("SELECT COUNT(ID) FROM $wpdb->posts WHERE post_type = 'attachment' AND post_mime_type LIKE 'video%' AND post_status = 'inherit'");
			$count = intval($count);
			if ($splictCount == -1 || $count <= $splictCount){
				$item['url'] 	 = untrailingslashit(get_home_url()). '/video-sitemap.xml';
				$item['type']	 = 'video';
				$items[] 		 = $item;
			}else{
				$paged = $count / $splictCount + ($count % $splictCount > 0 ? 1 : 0);
				for($i = 1; $i <= $paged; $i++){
					$offset 		 = ($i -1) * $splictCount;
					$item['url'] 	 = untrailingslashit(get_home_url()). '/video-sitemap-' . $i. '.xml';
					$item['type']	 = 'video';
					$items[] 		 = $item;
				}
			}
			$indexs['videos'] = $items;
		}
		
		// -- news
		$splictCount 	= $this->getSplitCount();
		$item 			= array();
		$items			= array();
		if (isset($this->settings['googlenews']['status']) && $this->settings['googlenews']['status'] = 'on'){
			$count = $this->getNewsCount(); //10000;//$wpdb->get_var("SELECT COUNT(ID) FROM $wpdb->posts WHERE post_type = 'attachment' AND post_mime_type LIKE 'video%' AND post_status = 'inherit'");
			$count = intval($count);
			if ($splictCount == -1 || $count <= $splictCount){
				$item['url'] 	 = untrailingslashit(get_home_url()). '/news-sitemap.xml';
				$item['type']	 = 'googlenews';
				$items[] 		 = $item;
			}else{
				$paged = $count / $splictCount + ($count % $splictCount > 0 ? 1 : 0);
				for($i = 1; $i <= $paged; $i++){
					$offset 		 = ($i -1) * $splictCount;
					$item['url'] 	 = untrailingslashit(get_home_url()). '/news-sitemap-' . $i. '.xml';
					$item['type']	 = 'googlenews';
					$items[] 		 = $item;
				}
			}
			$indexs['news'] = $items;
		}
		
		return $indexs;
	}
	
	function getSitemapPostTypes(){
		$postTypes = get_post_types(array('public' => true), 'names');
		
		foreach($postTypes as $key=>$val){
			if (!isset($this->settings['default']['cpt'][$val]['status']) || $this->settings['default']['cpt'][$val]['status'] != 'on'){
				unset($postTypes[$key]);
			}
		}
		return $postTypes;
	}

	function getPosts($posttype){
		$s 			= intval(get_query_var( 's' ));
		$args 		= array(
				'post_type' 	=> $posttype,
				'post_status' 	=> 'publish',
				'orderby'		=> 'modified',
				'posts_per_page'=> $this->getSplitCount(),
				'paged'			=> $s,
				'suppress_filters' => true
		);
		$query 		= new WP_Query($args);
		return $query;
	}
	
	function getImages(){
		$s 					= intval(get_query_var( 's' ));
		$query_images_args 	= array('post_type' => 'attachment', 'post_mime_type' =>'image', 'post_status' => 'inherit', 'posts_per_page' => $this->getSplitCount(), 'paged' => $s, 'suppress_filters' => true);
		$query_images 	   	= new WP_Query($query_images_args);
		return $query_images;
	}
	
	function getVideos(){
		$s 					= intval(get_query_var( 's' ));
		$query_video_args 	= array('post_type' => 'attachment', 'post_mime_type' =>'video', 'post_status' => 'inherit', 'posts_per_page' => $this->getSplitCount(), 'paged' => $s, 'suppress_filters' => true);
		$query_video 		= new WP_Query($query_video_args);
		return $query_video;
	}
	
	function getNews(){
		$s 		= intval(get_query_var( 's' ));
		if (isset($this->settings['googlenews']['category'])){
			foreach ($this->settings['googlenews']['category'] as $catName => $item){
				$cats[] = $catName;
			}
		}
		$cats 	= implode(',', $cats);
		
		$args 	= array(
				'post_type' 	=> 'post',
				'post_status' 	=> 'publish',
				'orderby'		=> 'modified',
				'category_name' => $cats,
				'posts_per_page'=> $this->getSplitCount(),
				'paged'			=> $s,
				'suppress_filters' => true
		);
		add_filter('posts_where', array(&$this, 'filter_posts_where'), 10, 1);
		$query 		= new WP_Query($args);
		
		return $query;
	}
	
	function filter_posts_where($where = ''){
		return $where . " AND post_modified >= '" . date('Y-m-d H:i:s', strtotime('-48 hours')) . "' ";
	}
	
	function getNewsCount(){
		global $wpdb;
		$cats = array();
		if (isset($this->settings['googlenews']['category'])){
			foreach ($this->settings['googlenews']['category'] as $catName => $item){
				$cat 	= get_category_by_slug($catName);
				if(is_object($cat)){
					$cats[] = $cat->term_id;
				}
			}
		}
		if (count($cats) > 0){
			$sql = "SELECT   COUNT(DISTINCT {$wpdb->posts}.ID) FROM {$wpdb->posts}  
					INNER JOIN {$wpdb->term_relationships}  ON ({$wpdb->posts}.ID = {$wpdb->term_relationships}.object_id) 
					WHERE ( {$wpdb->term_relationships}.term_taxonomy_id IN (".implode(',', $cats).") ) 
					 AND {$wpdb->posts}.post_type = 'post' AND (({$wpdb->posts}.post_status = 'publish')) 
					 AND post_modified >= '".date('Y-m-d H:i:s', strtotime('-48 hours'))."'  
					 GROUP BY {$wpdb->posts}.ID";
			return $wpdb->get_var($sql);
		}else{
			return 0;
		}
	}
	
	function getNewsData(){
		global $post;
		
		$data 		= array();
		$access		= array();
		$genre 		= array();
		$keywods 	= array();
		$images 	= array();
		$cats 		= get_the_category($post->ID);
		
		foreach ($cats as $cat){
			if (isset($this->settings['googlenews']['category'][$cat->slug]['status']) 
				&& isset($this->settings['googlenews']['category'][$cat->slug]['access'])){
				$val = $this->settings['googlenews']['category'][$cat->slug]['access'];
				$access = array_merge($access, array( $val => 1));
			}
			
			if (isset($this->settings['googlenews']['category'][$cat->slug]['genre'])){
				$val = $this->settings['googlenews']['category'][$cat->slug]['genre'];
				foreach($val as $itemval){
					if (!in_array($itemval, $genre)){
						$genre[] = $itemval;
					}
				}
			}
			
			$keywods[] = $cat->name;
		}
		
		if (isset($this->settings['googlenews']['image_type'])){
			switch ($this->settings['googlenews']['image_type']){
				case 'post': //thumbnail
					$thumbnail 	= get_the_post_thumbnail($post->ID);
					if (preg_match('|\ssrc="(.*?)"|i', $thumbnail, $matches)){
						$images[] = $matches[1];
					}
					break;
				case 'content':					
					if ($count = preg_match_all('|<img.*?src="(.*?)"|i', $post->post_content, $matches)){
						for($i = 0; $i < $count; $i++){
							$images[] = $matches[1][$i];
						}						
					}
					break;
			}
		}
		
		$data['access'] 	= $access;
		$data['genre']  	= $genre;
		$data['keywords']  	= $keywods;
		$data['images'] 	= $images;
		return $data;
	}
		
	function getSplitCount(){
		return (isset($module->settings['split'])) ? intval($module->settings['split']) : -1;
	}
	
	/*
	 * Manager
	 */
	 
	function showForm($objectType = null){
		if($objectType == 'post'){
			$this->dpc->parseSettingsByXml($this->settingsFile, 'manager', false, true);
		}
	}
}