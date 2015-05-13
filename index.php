<?php
/*
Plugin Name: DELUCKS SEO
Description: Easy SEO for noobs and experts: The plugin is your helping hand in WordPress on page search engine optimization.
Plugin URI: http://delucks.com
Version: 1.1.7
Author: DELUCKS GmbH
Author URI: http://delucks.com
*/
?><?php

defined('DPC_VERSION') 					or define('DPC_VERSION', '1.1.7');
defined('DPC_FILE') 					or define('DPC_FILE', __FILE__); 
defined('DPC_HOOK') 					or define('DPC_HOOK', 'DPC');
defined('DPC_PLUGIN_FILE') 				or define('DPC_PLUGIN_FILE', __FILE__);
defined('DPC_PLUGIN_DIR') 				or define('DPC_PLUGIN_DIR', plugin_dir_path( __FILE__ ));
defined('DPC_PLUGIN_URL') 				or define('DPC_PLUGIN_URL', plugin_dir_url( __FILE__ ));
defined('DPC_PLUGIN_LANG_DIR') 			or define('DPC_PLUGIN_LANG_DIR', DPC_PLUGIN_DIR . 'lang/');
defined('DPC_PLUGIN_MODULES_DIR') 		or define('DPC_PLUGIN_MODULES_DIR', DPC_PLUGIN_DIR . 'modules/');
defined('DPC_PLUGIN_HELPER_DIR') 		or define('DPC_PLUGIN_HELPER_DIR', DPC_PLUGIN_DIR . 'helper/');
defined('DPC_PLUGIN_UPLOAD_DIRNAME') 	or define('DPC_PLUGIN_UPLOAD_DIRNAME', '/dpc-data/');

class DPC {

	var $version				= '1.1.7';
	var $license				= '';
	var $author					= 'DELUCKS GmbH';
	var $moduleList 			= array();
	var $moduleInstances 		= array();
	var $moduleSettings			= array();
	var $guiHelper				= null;
	var $uploadDir				= null;
	var $uploadUrl				= null;
	var $oFunctions				= null;
	var $oLicense				= null;
	var $log					= null;
	var $objectType				= null;
	var $objectId				= null;
	var $messages				= array();
	var $translatorJs			= array();
	var $cc						= false;

    /**
     * The constructor automatically kicks of the initialization of all the modules, registering in the navigation and
     * triggering FrontendActions if called from the WP frontend. As long as the dpc plugin is activated this happens
     * automatically thanks to the instantiation of this class after the class implementation.
     */
    function __construct(){
    	ini_set('display_errors', 'off');
    	error_reporting(0);

		$wpUploadDir		= wp_upload_dir();
		$this->uploadDir	= $wpUploadDir['basedir'] . DPC_PLUGIN_UPLOAD_DIRNAME;
		$this->uploadUrl	= $wpUploadDir['baseurl'] . DPC_PLUGIN_UPLOAD_DIRNAME;
		$this->objectType	= (isset($_REQUEST['object_type']) ? $_REQUEST['object_type'] : null);
		$this->objectId		= (isset($_REQUEST['object_id']) ? $_REQUEST['object_id'] : null);
		
		add_action('init', array($this, 'hook_init'), -1);

		require_once(DPC_PLUGIN_HELPER_DIR . 'functions.php');
		$this->oFunctions = new DPC_Functions($this);
		add_action('wp_enqueue_scripts', array($this, 'printScripts'));
		
		$this->initModules();
		if(is_admin()){
			$this->registerAjaxAction('dpc_save_toggle_state', array($this, 'saveToggleState'));
			$this->saveSettings();
			$this->installDefaultSettingsByXml();
		}
				
		$this->initModules();
		
		if(is_admin()){
			add_action('save_post', array(&$this, 'check'));
			require_once(DPC_PLUGIN_HELPER_DIR . 'license.class.php');
			$this->oLicense = new DPC_Helper_License($this);
			$this->oLicense->updateCheck();
			
			add_action('admin_notices', array($this, 'adminNotices'), 20);
			
			$this->translatorJs = array(
				'cancel' 							=> $this->getText('Cancel'),
				'install_defaults' 					=> $this->getText('Install Defaults'),
				'are_you_sure'						=> $this->getText('Are you sure'),
				'install_defaults_modal_head'		=> $this->getText('Are you sure you want to install the default settings'),
				'install_defaults_modal_content'	=> $this->getText('If the default settings are being installed all your settings and changes within this module will be deleted'),
			);
			 
			add_action('admin_init', array(&$this, 'hook_admin_init'));
			
			require_once(DPC_PLUGIN_HELPER_DIR . 'log.class.php');
			$this->log = new DPC_Helper_Log($this);
			add_action('admin_head', array(&$this, 'adminHead'));

			foreach($this->moduleInstances as $moduleName => $module){
				if(isset($_REQUEST['page']) && is_array($page = explode('-', $_REQUEST['page']))){
					if(isset($page[1]) && key_exists($page[1], $this->moduleList) && preg_match('/^'.$page[1].'/', $moduleName)){
						@$this->triggerModuleMethod($module, 'adminSettingsHead');
					}
				}

				if($this->moduleIsActive($moduleName)){
					@$this->triggerModuleMethod($module, 'adminHead');
					$this->triggerModuleMethod($module, 'executeBackendActions');
				}
			}
			
			add_action('admin_menu', array(&$this, 'adminInit' ), 998);
			$this->executeBackendActions();
		} else {
			foreach($this->moduleInstances as $moduleName => $module){
				if($this->moduleIsActive($moduleName)){
					@$this->triggerModuleMethod($module, 'executeFrontendActions');
				}
			}
			$this->executeFrontendActions();
		}
		foreach($this->moduleInstances as $moduleName => $module){
			if($this->moduleIsActive($moduleName)){
				$this->triggerModuleMethod($module, 'registerWidgets');
			}
		}
	}
	
	function adminNotices(){
		if(current_user_can('manage_options')){
			if(version_compare($this->version, get_option('dpc_version', 999)) > 0){
				echo '<div id="message" class="updated"><p><b>DELUCKS SEO Plugin</b> has been updated.</p>';
				if($this->oLicense->products['professional']['status'] == true){
					echo '<p>Social sharing settings needs an update. Please activate the network buttons for the certain devices. </p>';
					echo '<p class="submit">
							<a href="' . wp_nonce_url(admin_url('admin.php?page=dpc-professional'), 'dpc_admin_notice_update_nonce') . '" class="button-primary">Go to settings page</a> 
						  </p>';
				}
				if($this->oLicense->products['suite']['status'] == true){

				}
				echo '</div>';
			}
		}
		update_option('dpc_version', $this->version);
	}

    /**
     * getModuleList() returns an array with a list of all valid modules including their subModules
     * in the modules directory.
     *
     * @return array
     */
    function getModuleList(){
		$moduleNames = array();
		foreach(scandir(DPC_PLUGIN_MODULES_DIR) as $filename){
			$dirName = DPC_PLUGIN_MODULES_DIR . $filename;
			if(is_dir($dirName) && is_readable($dirName) && file_exists($dirName . '/module.class.php') && !in_array($filename, array('.', '..'))){
				$moduleNames[$filename] = array();
				foreach(scandir($dirName) as $subModuleName){
					if(is_dir($dirName . '/' . $subModuleName) && is_readable($dirName . '/' . $subModuleName) && file_exists($dirName . '/' . $subModuleName . '/module.class.php') && !in_array($subModuleName, array('.', '..'))){
						if(!preg_match('/^_(.*)/', $subModuleName)){
							$moduleNames[$filename][] = $subModuleName;
						}
					}
				}
			}
		}
		return $moduleNames;
	}

    /**
     * getModuleInstance() builds the correct classname from the moduleName and subModuleName, instantiates it,
     * saves the instance into an attribute and returns it.
     *
     * @param $moduleName The name of the module to instantiate
     * @param bool $subModuleName The name of the submodule to instantiate
     * @return bool|object Instance of the module object or false if the module class doesn't exist
     */
    function getModuleInstance($moduleName, $subModuleName = false){
		$moduleName = strtolower($moduleName);
		if($subModuleName !== false){
			$subModuleName = strtolower($subModuleName);
			if(isset($this->moduleInstances[$moduleName.'_'.$subModuleName])){
				return $this->moduleInstances[$moduleName.'_'.$subModuleName];
			}
			$moduleClassName = get_class() . '_Module_' . ucfirst($moduleName) . '_' . ucfirst($subModuleName);
			$moduleClassFile = DPC_PLUGIN_MODULES_DIR . str_replace('_', '/', strtolower($moduleName . '/' . $subModuleName . '/module.class.php'));
			if(file_exists($moduleClassFile) && is_readable($moduleClassFile)){
				include_once(DPC_PLUGIN_MODULES_DIR . 'interface.php');
				require_once($moduleClassFile);
				if(class_exists($moduleClassName)){
					$this->moduleInstances[$moduleName.'_'.$subModuleName] = new $moduleClassName($this);
					return $this->moduleInstances[$moduleName.'_'.$subModuleName];
				}
			}
		} else {
			if(isset($this->moduleInstances[$moduleName])){
				return $this->moduleInstances[$moduleName];
			}
			$moduleClassName = get_class() . '_Module_' . ucfirst($moduleName);
			$moduleClassFile = DPC_PLUGIN_MODULES_DIR . str_replace('_', '/', strtolower($moduleName . '/module.class.php'));
			if(file_exists($moduleClassFile) && is_readable($moduleClassFile)){
				require_once($moduleClassFile);
				if(class_exists($moduleClassName)){
					$this->moduleInstances[$moduleName] = new $moduleClassName($this);
					return $this->moduleInstances[$moduleName];
				}
			}
		}
		return false;
	}

    /**
     * triggerModuleMethod() calls the given method of the given module with the given parameters and returns
     * the return value of it.
     *
     * @param $module Modulename or Instance to trigger the method on
     * @param $method Name of the method to trigger
     * @param null $params Optional params to pass to the method
     * @return bool|mixed Returns false if the method doesn't exist or the return value of the method itself
     */
    function triggerModuleMethod($module, $method, $params = null){
		if(!is_object($module) && is_string($module)){
			$module = $this->getModuleInstance($module);
		}

		if(is_object($module)){
			if(method_exists($module, $method)){
				$params = (is_null($params) ? array() : $params);
				return call_user_func_array(array($module, $method), $params);
			}
		}
		return false;
	}

    /**
     * initModules() initializes all valid modules and submodules saving them in attributes for later use.
     */
    function initModules(){
		$this->moduleList = $this->getModuleList();
		foreach($this->moduleList as $moduleName => $subModuleNames){
			if(is_object($module = $this->getModuleInstance($moduleName))){
				foreach($subModuleNames as $subModuleName){
					if(is_object($subModule = $this->getModuleInstance($moduleName, $subModuleName))){
						$this->moduleInstances[$moduleName.'_'.$subModuleName] = $subModule;
					}
				}
			}
		}
	}

    /**
     * setupPluginDirectory() creates a directory with the given chmod rights
     *
     * @param $dir Path of the directory to create
     * @param int $chmod Userrights of the directory to be created
     * @return bool Returns true if the directory already exists or the result of the mkdir function
     */
    function setupPluginDirectory($dir, $chmod = 0755){
		if(!file_exists($dir)){
			return mkdir($dir, $chmod, true);
		}
		return true;
	}

    /**
     * parseSettingsByXml() takes a XML settings file, loads the given section and instantiates an object of the
     * GUI Helper class to render the section in the WP backend. Sections in the XML file describe the backend forms,
     * pages etc
     *
     * @param $file Path to the XML settings file
     * @param $section Name of the section to load from the file (name attribute of a section tag)
     * @param $inEach if true, no new gui object will be created to hold loop variables
     * @return bool Returns true on successful display of the section and false if there was an error
     */
    function parseSettingsByXml($file, $section, $inEach = false, $skipWrapper = false, $checkExists = false){
		$this->lastSettingsFile = $file;
		if(is_readable($file)){
			$options 	= simplexml_load_file($file, 'SimpleXMLElement', LIBXML_NOCDATA);
			$module 	= $options['module'];
			
			foreach($options->xpath('//defaults') as $xml_defaults){
				$defaults[] = $xml_defaults;
			}

			foreach($options->xpath('//section') as $xml_section){
				if((string)$xml_section['name'] == (string)$section){
					if($checkExists){ return true; }
					$fields = $xml_section;
					break;
				}
			}
			
			if(!isset($fields) || !count($fields)){ return false; }
			
			
			require_once(DPC_PLUGIN_HELPER_DIR . 'gui.class.php');
			$gui 					= (!$inEach ? new DPC_Helper_Gui($this) : $this->guiHelper);
			$gui->module 			= $module;
			$gui->defaults			= (isset($defaults) && count($defaults) ? $defaults : false);
			$gui->settings 			= $this->getModuleSettings($module);
			$gui->sectionAttributes = $gui->replaceXmlAttributes($fields);
			$this->guiHelper 		= $gui;
			$gui->showSection($fields, true, $skipWrapper);
			return true;
		}
		return false;
	}
	
	/**
	 * installDefaultSettingsByXml() takes a XML settings file, loads the given default values and saves them to the database
	 *
	 * @return bool Returns true on successful install default module settings and false if there was an error
	 */
	function installDefaultSettingsByXml(){
		if(!isset($_POST['dpc']['install_defaults'])){
			return false;
		}

		foreach($_POST['dpc']['install_defaults'] as $moduleName => $file){
			$this->lastSettingsFile = $file;
			if(is_readable($file)){
				$options 	= simplexml_load_file($file, 'SimpleXMLElement', LIBXML_NOCDATA)->xpath('//defaults');
				$options	= $options[0];
				$settings	= array();
			
				if(!count($options)){ return false; }
				foreach($options as $var){
					if(property_exists($var->attributes(), 'function')){
						switch($var->attributes()->function->__toString()){
							case 'explode':
								$settings[$var->attributes()->name->__toString()] = explode(',', $var->attributes()->value->__toString());
								break;
						}
					} else {
						$settings[$var->attributes()->name->__toString()] = $var->attributes()->value->__toString();
					}
				}

				$settings['dpc_status_'.$moduleName] = $_POST['dpc'][$moduleName]['dpc_status_'.$moduleName];
				update_option('dpc_'.$moduleName, $settings);
				update_option('dpc_status_' . $moduleName, $_POST['dpc'][$moduleName]['dpc_status_'.$moduleName]);
					
				if(isset($_POST['dpc'][$moduleName])){
					unset($_POST['dpc'][$moduleName]);
				}
				return true;
			}
		}
		return false;
	}

    /**
     * adminHead() adds style- and script files to the page that will be used in the backend templates later.
     * Gets called on admin_head trigger.
     *
     * @return bool Returns false if this is not the right screen to add the scripts and styles
     */
    function adminHead(){
		$screen = get_current_screen();
		if($screen->id !== 'toplevel_page_dpc' && !preg_match('/^seo_page_dpc/', $screen->id)){
			return false;
		}
		
		if(function_exists('wp_enqueue_media')){
	         wp_enqueue_media();
		} else { // older WP < 3.5
	         wp_enqueue_script('media-upload');
	         wp_enqueue_script('thickbox');
	         wp_enqueue_style('thickbox');
		}

		wp_enqueue_style('dpc-bootstrap', plugins_url( 'assets/bootstrap/css/bootstrap.css', __FILE__ ));
		wp_enqueue_script('dpc-bootstrap', plugins_url( 'assets/bootstrap/js/bootstrap.js', __FILE__ ), array('jquery'), false, false );
		wp_enqueue_style('dpc', plugins_url( 'assets/dpc/css/style.css', __FILE__ ));
		wp_enqueue_style('dpc-responsive', plugins_url( 'assets/dpc/css/style-responsive.css', __FILE__ ));
		wp_enqueue_script('dpc', plugins_url( 'assets/dpc/js/functions.js', __FILE__ ), array('jquery'));
		wp_localize_script('dpc', 'dpc_main_translator', $this->translatorJs);
		wp_enqueue_style('dpc-font-awesome', plugins_url( 'assets/font-awesome/css/font-awesome.min.css', __FILE__ ));
		wp_enqueue_script('dpc-jquery-ui', plugins_url( 'assets/jquery-ui/jquery-ui.min.js', __FILE__ ), array('jquery'));
	}

    /**
     * adminInit() adds the DELUCKS navigation point and cycles through every module to trigger the methods
     * for registering the module in the navigation
     */
    function adminInit(){
		$hook = add_menu_page(strtolower(DPC_HOOK), 'SEO', 'manage_options', strtolower(DPC_HOOK), array($this, 'adminSettings'), plugins_url( 'assets/img/dllogo.png', __FILE__ ), 98);
		foreach($this->moduleInstances as $moduleName => $module){
			if($this->oLicense->checkModule($moduleName)){
				$this->triggerModuleMethod($module, 'registerInAdminMenu');
			}
		}
	}

    /**
     * saveSettings() takes the data the user entered into the backend forms and saves them to the database.
     * Before and after the save-process hooks onSaveActionBefore and onSaveActionAfter will be triggered on each module.
     * If data is configured to have realnames in the settings XML file it will be saved with that name, otherwise the
     * option name includes the moduleName.
     * For every submodule of the active module the status will be set to true or false if an appropriate variable is
     * set in the data array to activate or deactivate that submodule.
     *
     * @return bool Returns false if POST value dpc_save_settings isn't set
     */
    function saveSettings(){
		if(!isset($_POST['dpc_save_settings']) || isset($_POST['dpc']['install_defaults'])){
			return false;
		}

		foreach($this->moduleInstances as $moduleName => $module){
			if($this->moduleIsActive($moduleName)){
				$this->triggerModuleMethod($module, 'onSaveActionBefore');
			}
		}
		
		if(isset($_POST['dpc'])){
			if(isset($_POST['dpc']['realnames'])){
				foreach($_POST['dpc']['realnames'] as $k => $v){
					update_option($k, $v);
				}
				unset($_POST['dpc']['realnames']);
			}
			
			foreach($_POST['dpc'] as $moduleName => $moduleSettingFields){				
				update_option('dpc_'.$moduleName, $moduleSettingFields);
			}
		}

		if(isset($_REQUEST['page']) && is_array($page = explode('-', $_REQUEST['page']))){
			if(key_exists($page[1], $this->moduleList)){
				foreach($this->moduleList[$page[1]] as $subModuleName){
					$moduleName = $page[1] . '_' . $subModuleName;
					$optionStatusName = 'dpc_status_' . $moduleName;
					if(isset($_POST['dpc'][$moduleName]['dpc_status_'.$moduleName]) && $_POST['dpc'][$moduleName]['dpc_status_'.$moduleName] == '1'){
						update_option($optionStatusName, true);
					} else {
						update_option($optionStatusName, false);
					}
				}
			}
		}
		
		foreach($this->moduleInstances as $moduleName => $module){
			if($this->moduleIsActive($moduleName)){
				$this->triggerModuleMethod($module, 'onSaveActionAfter');
			}
		}
		
		array_push($this->messages, array('type' => 'success', 'text' => $this->getText('Settings have been updated') . '!'));
	}

    /**
     * getModuleSettings() returns the settings of the given module from the database.
     *
     * @param $moduleName The name of the module to read the settings from
     * @return mixed Returns the settings from the database or false if they aren't found
     */
    function getModuleSettings($moduleName){
		return get_option('dpc_'.$moduleName, array());
	}

    /**
     * moduleIsActive() checks the option for the active-status of the given module and returns the status
     * or a default of false.
     *
     * @param $moduleName Name of the module to check
     * @return bool Returns active state from the database for the given module. If no status is found, false is returned.
     */
    function moduleIsActive($moduleName){
		if((bool)get_option('dpc_status_'.$moduleName, false) === false){ 
			return false;
		}
		return true;
	}
	
	/**
	 * registerAjaxAction() registers an ajax-action which can be called from backend or frontend
	 *
	 * @param $action Name of the action
	 * @param $function callback function
	 * @param $nopriv Defines wether not logged in users hav privileges to execute the registered action
	 * @return void
	 */
	function registerAjaxAction($action, $function, $nopriv = false){
		if($nopriv === true){
			add_action('admin_post_nopriv_'.$action, $function);
		} else {
			add_action('admin_post_'.$action, $function);
		}
	}
	
	function registerAjaxFrontendAction($action, $function){
		add_action('wp_ajax_nopriv_' . $action, $function);
	}
	
	function executeFrontendActions(){
		if(!is_admin()){
			add_action('wp', array(&$this, 'hook_wp_frontend'));
		}
	}
	
	function saveToggleState(){
		if(get_current_user_id()){
			update_user_meta(get_current_user_id(), 'dpc_toggle_state_'.$_POST['module'], $_POST['status']);
		}
		die();
	}
	
	function executeBackendActions(){
		add_action('load-edit.php', array(&$this, 'hook_load_edit_php'));
	}
	
	function addColumns($columns){
		$columns['dpc-ampel'] = 'SEO';
		return $columns;
	}
	
	function ampelColumns($column, $postID){
		if ($column == 'dpc-ampel'){
			$count = $this->log->getWarningsById($postID, true);
			echo ( $count == 0) ? '<i class="light-ico good"></i> Optimal' : '<i class="light-ico warning"></i> ' . $count.' ' . ($count == 1 ? 'Hinweis' : 'Hinweise');
		}
	}
	
	function check($postId = false){		
		$objectId = $postId ? $postId : (!is_null($this->objectId) ? $this->objectId : false);
		if($objectId == false || get_post_type($objectId) == 'revision' || get_post_type($objectId) == 'auto-draft' || (defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE) || !is_object($this->log)){
			return false;
		}

		$this->log->clearPostLog($objectId);
		foreach($this->moduleInstances as $module){
			if(method_exists($module, 'check')){
				$module->check($objectId);
			}
		}
	}

	function getText($text){
		if (func_num_args() <= 1){
			return __($text, 'dpc');
		}
		
		$args = func_get_args();
		array_shift($args);
		if(is_array($args[0])){
			$args = $args[0];
		} elseif($args[0] === false){
			return __($text, 'dpc');
		}
		return vsprintf(__($text, 'dpc'), $args);
	}

	function printScripts(){
		echo '<script type="text/javascript">'."\n";
		echo '	var dpc_current_language = \'' . $this->oFunctions->getUserLang() . "';\n";
		echo '</script>'."\n";
	}
	
	function hook_init(){
		load_plugin_textdomain( 'dpc', false, dirname( plugin_basename( __FILE__ ) ) . '/lang/' );
	}

	function hook_wp_frontend(){
		global $post;
		if(is_object($post) && property_exists($post, 'ID') && get_post($post->ID)) {
			$count = get_post_meta($post->ID, 'dpc_hits', true);
			$newcount = $count + 1;
			update_post_meta($post->ID, 'dpc_hits', $newcount);
		}
	}
	
	function adminSettings(){ }
	
	function hook_admin_init(){
		global $pagenow;
		if($pagenow == 'admin.php'){
			if(isset($_GET['page']) && $_GET['page'] == 'dpc'){
				wp_redirect(admin_url('admin.php?page=dpc-dpc'), 302);
			}
		}
	}
	
	function hook_load_edit_php(){
		global $plugin_dpc;
		wp_enqueue_style('dpc-outer-style', plugins_url( 'assets/css/outer_dpc.css', __FILE__ ));
		add_filter( 'manage_posts_columns', 			array($plugin_dpc, 'addColumns'));
		add_action( 'manage_posts_custom_column', 		array($plugin_dpc, 'ampelColumns'), 10, 2 );
		add_filter( 'manage_page_posts_columns', 		array($plugin_dpc, 'addColumns'));
		add_action( 'manage_page_posts_custom_column', 	array($plugin_dpc, 'ampelColumns'), 10, 2 );
	}
	
}

$plugin_dpc = new DPC();