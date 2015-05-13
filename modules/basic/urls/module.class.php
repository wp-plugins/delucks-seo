<?php 

class DPC_Module_Basic_Urls implements DPC_Module_Interface{
	
	var $dpc				= null;
	var $isSubmodule		= true;
	var $moduleDirectory 	= 'basic/';
	var $moduleTitle 		= '';
	var $optionsHook		= 'dpc-basic-urls';
	var $settingsFile		= false;
	var $settings			= array();
	var $lang				= '';
	
	function registerWidgets(){ }
	function adminHead(){ }
	
	
	function __construct(&$dpc){
		$this->dpc 			= $dpc;
		$this->moduleTitle	= $this->dpc->getText('URL optimization');
		$this->settingsFile = dirname(__FILE__) . '/settings.xml';
		$this->settings 	= $this->dpc->getModuleSettings('basic_urls');
		$this->setup();
	}

	function adminSettings(){
		$this->dpc->parseSettingsByXml($this->settingsFile, 'general');
	}
	
	function adminSettingsHead(){
		wp_enqueue_style('dpc-basic-urls-settings', plugins_url( 'assets/css/settings.css', __FILE__ ));		 
	}
	
	
	function executeBackendActions(){ 		
		if (isset($this->settings['stopwords']) && isset($this->settings['stopwords']) == 'on'){	
			#add_filter('wp_insert_post_data', array($this, 'applyStopWords'), 1000, 2);
			add_filter( 'wp_unique_post_slug', array($this, 'customUniquePostSlug'), 1000, 4 );
		}
	}
	
	function setup(){
		global $wpdb;
		$sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}dpc_404_redirects` (
				  `url` varchar(255) CHARACTER SET utf8 NOT NULL,
				  `referer` varchar(255) CHARACTER SET utf8 NOT NULL,
				  `target_url` varchar(255) CHARACTER SET utf8 NOT NULL,
				  `type` varchar(255) CHARACTER SET utf8 NOT NULL,
				  `post_id` bigint(20) NOT NULL,
				  `visits` bigint(20) NOT NULL,
				  `status` tinyint(1) NOT NULL
				)";
		$wpdb->query($sql);
	}
	
	function getCount404Entries($params = array()){
		global $wpdb;
		$sql = "SELECT COUNT(*) as `count` FROM `{$wpdb->prefix}dpc_404_redirects` WHERE 1";
		foreach($params as $k => $v){
			if(is_array($v) && isset($v['operator'])){
				$sql .= " AND `{$k}` {$v['operator']} '{$v['value']}'";
			} else {
				$sql .= " AND `{$k}`='{$v}'";
			}
		}
		return $wpdb->get_var($sql);
	}
	
	function getRedirectData($params = array()){
		global $wpdb;
		$sql = "SELECT * FROM `{$wpdb->prefix}dpc_404_redirects` WHERE 1";
			foreach($params as $k => $v){
			if(is_array($v) && isset($v['operator'])){
				$sql .= " AND `{$k}` {$v['operator']} '{$v['value']}'";
			} else {
				$sql .= " AND `{$k}`='{$v}'";
			}
		}
		return $wpdb->get_results($sql, ARRAY_A);
	}
	
	function getRedirectEntryData($url, $field){
		$data = $this->getRedirectData(array('url' => $url));
		if(isset($data[0][$field])){
			return $data[0][$field];
		}
		return '';
	}
	
	function updateRedirectData($url, $params){
		global $wpdb;
		$sql = "UPDATE`{$wpdb->prefix}dpc_404_redirects` SET";
		foreach($params as $k => $v){
			$sql .= " `{$k}`='{$v}',";
		}
		$sql = substr($sql, 0, -1); 
		$sql .= " WHERE `url`='{$url}'";
		$wpdb->query($sql);
	}

	function addRedirectData($url){
		global $wpdb;
		$sql = "INSERT INTO `{$wpdb->prefix}dpc_404_redirects` (`url`, `referer`, `target_url`, `type`, `post_id`, `visits`, `status`) VALUES ('{$url}', '".$_SERVER["HTTP_REFERER"]."', '', '', '', 1, 0)";
		$wpdb->query($sql);
	}
	
	function executeFrontendActions(){
		if(!is_admin() && isset($this->settings['forceSSL'])){
			if(!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] != 'on'){
				$permanent = true;
				$url = 'https://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
				header('Location: ' . $url, true, $permanent ? 301 : 302);
			}
		}
		add_action('wp', array($this, 'on404'));
	}
	
	function deleteNonRedirected(){
		global $wpdb;
		$sql = "DELETE FROM `{$wpdb->prefix}dpc_404_redirects` WHERE `target_url`='' AND `post_id`=''";
		$wpdb->query($sql);
	}
	
	function on404(){
		if(is_404()){
			$urlPath = parse_url($_SERVER['REQUEST_URI']);
			$urlPath = $urlPath['path'];
			if($data = $this->getRedirectData(array('url' => $urlPath))){
				$data = $data[0];
				//UPDATE HITS
				$this->updateRedirectData($urlPath, array('visits' => $data['visits']+1));
				if(strlen($data['post_id']) && $data['post_id'] > 0){
					$url = get_permalink($data['post_id']);
					if(!strlen($url)){
						//maybe get translated object
					}
				}elseif(strlen($data['target_url'])){
					$url = $data['target_url'];
				} else {
					$this->execute404FallbackRedirect(false);
				}
			} else {
				
				$this->execute404FallbackRedirect(true);
			}
			
			if(isset($url)){
				wp_redirect($url);
			}
		}
	}
	
	function execute404FallbackRedirect($log = false){
		if(isset($this->settings['404page']) && isset($this->settings[$this->settings['404page']])){
			$urlPath = parse_url($_SERVER['REQUEST_URI']);
			$urlPath = $urlPath['path'];
			$type 	= $this->settings['404page'];
			$id 	= $this->settings[$type];
			if(is_array($id)){
				$id = array_shift($id);
			}
			$url = get_permalink($id);
			if($log){
				$this->addRedirectData($urlPath);
			}
			wp_redirect($url);
		}
	}
	
	function applyStopWords($data, $postarr){
		$language = isset($postarr['icl_post_language']) ? $postarr['icl_post_language'] : '';
		$postname = $data['post_name'];
		$post_ID  = isset($_POST['post_ID']) ? $_POST['post_ID'] : '0';

		$names = explode('-', $postname); 
		$names = preg_replace($this->getStopWordsPattern($language), '', $names);
		$names = array_filter($names);

		$postname = implode('-', $names);
		$postname = wp_unique_post_slug($postname, $post_ID, $data['post_status'], $data['post_type'], $data['post_parent']);
		
		$data['post_name'] = $postname;
		
		return $data;
	}
	
	function customUniquePostSlug($slug, $post_ID, $post_status, $post_type){
		if(in_array($post_type, array('attachment', 'image'))){
			return $slug;
		}
	
		if (defined('ICL_LANGUAGE_CODE')){
			$language = wpml_get_language_information($post_ID);
			$language = substr(get_locale(), 0, strpos($language['locale'], '_'));
		} else {
			$language = $this->getLang();
		}
		
		$names = explode('-', $slug);
		$names = preg_replace($this->getStopWordsPattern($language), '', $names);
		$names = array_filter($names);
		
		$slug = implode('-', $names);
		return $slug;
	}

	function getStopWordsPattern($language = ''){
		if ($language == ''){
			$language = $this->getLang();
		}
		$stopWords 	= $this->getStopWords($language);
		foreach($stopWords as &$item){
			$item = '|^'.remove_accents($item).'$|i';
		}
		return $stopWords;
	}

	function getLang(){
		if (defined('ICL_LANGUAGE_CODE')){ // notice: not 100% 
			$lang = ICL_LANGUAGE_CODE;
		}else {
			$lang = substr(get_locale(), 0, strpos(get_locale(), '_'));
		}
	
		return $lang;
	}
	
	function getStopWords($lang){
		if (isset($this->settings[$lang]['stopwordlist'])){
			return explode(',', $this->settings[$lang]['stopwordlist']);
		}
		
		return array();
	}

	function filterSanitizeTitle($title, $raw_title, $context){
		if ($context != 'save') return $title;

		$titles	= explode('-', $title);
		$titles = preg_replace($this->stopWordsPattern, '', $titles);
		for($i = 0; $i < count($titles); $i++){
			if (empty($titles[$i])){
				unset($titles[$i]);
			}
		}
		
		return implode('-', $titles);
	}
	
	function showForm($objectType = null){
		if($objectType == 'url'){
			$this->dpc->parseSettingsByXml($this->settingsFile, 'manager');
		}
	}
	
	function managerUpdate(){
		$formdata		= $_REQUEST['dpc']['basic_urls'];
		$targetPostId	= $formdata[$formdata['404page']];
		if(get_post($targetPostId)){
			update_option('dpc-suite-updated-'.md5($_REQUEST['object_id']), true);
			$this->updateRedirectData($_REQUEST['object_id'], array('post_id' => $targetPostId, 'status' => 1, 'type' => $formdata['404page']));
		}
		die();
	}
	
	
}