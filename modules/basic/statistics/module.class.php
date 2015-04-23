<?php 

class DPC_Module_Basic_Statistics implements DPC_Module_Interface {
	
	var $dpc				= null;
	var $isSubmodule		= true;
	var $moduleDirectory 	= 'basic/';
	var $moduleTitle 		= '';
	var $optionsHook		= 'dpc-basic-statistics';
	var $settingsFile		= false;
	var $settings			= array();
	var $helpLink			= '';
	
	function adminSettingsHead() { }
	
	function __construct(&$dpc){
		$this->dpc 			= $dpc;
		$this->moduleTitle	= $this->dpc->getText('Statistics');
		$this->settingsFile = dirname(__FILE__) . '/settings.xml';
		$this->settings 	= $this->dpc->getModuleSettings('basic_statistics');
	}
	
	function gethelpLink(){
		return htmlspecialchars('https://support.google.com/analytics/answer/1008080?hl=de&utm_medium=et&utm_campaign=en_us&utm_source=SetupChecklist', ENT_QUOTES);
	}
	
	function adminSettings(){
		$this->dpc->parseSettingsByXml($this->settingsFile, 'general');
	}
	
	function adminHead(){
		wp_enqueue_style('dpc-basic-statistics-backend', plugins_url( 'assets/css/backend.css', __FILE__ ));
		wp_enqueue_script('dpc-basic-statistics-text', plugins_url( 'assets/js/backend.js', __FILE__ ), array('jquery'));
		add_action('admin_enqueue_scripts', array(&$this, 'hook_admin_enqueue_scripts'));
	}
	
	function hook_admin_enqueue_scripts(){
		echo '<script type="text/javascript">'."\n";
		echo '	var dpc_basic_statistics_settings = ' . json_encode($this->dpc->getModuleInstance('basic_statistics')->settings) . ";\n";
		echo '</script>'."\n";
	}
	
	function executeBackendActions(){
		$this->dpc->registerAjaxAction('dpc_basic_statistics_diagramm', array($this, 'ajaxSaveStatisticsInterval'));
	}

	function executeFrontendActions(){
		$this->statisticsCreateDB();
		add_action('wp_head',				array($this, 'outputTrackingCodes'));
		add_action('init',					array($this, 'writeStatistics'));
	}
	
	function ajaxSaveStatisticsInterval(){
		if(isset($_REQUEST['dpc_statistics_interval'])){
			update_option('dpc_basic_statistics_interval', $_REQUEST['dpc_statistics_interval']);
		}
		require_once( 'widgets/dashboard.php' );
			$obj = new DelucksStatistic($this->dpc);
			$obj->ajax_dpc_basic_statistics_diagramm();
		die();
	}
	
	function statisticsCreateDB(){
		global $wpdb;
		$wpdb->show_errors();
		//$wpdb->query('DROP TABLE IF EXISTS `'.$wpdb->prefix.'dpc_statistics`');
		$sql = 'CREATE TABLE  IF NOT EXISTS  `' . $wpdb->prefix . 'dpc_statistics`(
				  `ID` int(11) NOT NULL AUTO_INCREMENT,
				  `timestamp` bigint(20) DEFAULT NULL,
				  `referrer` text,
				  `host` varchar(255) DEFAULT NULL,
				  PRIMARY KEY (`ID`),
				  KEY `ix_dpc_statistics_host` (`host`),
				  KEY `ix_dpc_statistics_timestamp` (`timestamp`)
				) DEFAULT CHARSET=utf8;';
		$wpdb->query($sql);
		$wpdb->hide_errors();
	}
	
	function outputTrackingCodes(){
		//if($_SERVER['REMOTE_ADDR'] !== '139.174.192.210'){ return false; }
		if (isset($this->settings['trackingCodes'])){
			echo  $this->settings['trackingCodes'] ;
			echo '<script type="text/javascript">'."\n";
			echo '	var dpc_basic_statistics_settings = ' . json_encode($this->settings) . ";\n";
			echo '	var dpc_basic_statistics_hostname = \'' . $_SERVER['SERVER_NAME'] . "';\n";
			echo '</script>'."\n";
			wp_enqueue_script('dpc-basic-statistics-google-analytics-option', plugins_url( 'assets/js/ganalyticsoption.js', __FILE__ ), array('jquery'));
		}
	}
	
	function writeStatistics(){
		global $current_user,$wpdb;
		$user_roles = $current_user->roles;
		$user_role 	= array_shift($user_roles);
		
		if(isset($this->settings['trackUserroles']) && is_array($this->settings['trackUserroles']) && ($user_role == NULL || !in_array($user_role, $this->settings['trackUserroles'])) && strpos($_SERVER['HTTP_REFERER'], $_SERVER['HTTP_HOST']) === false){
			$host = parse_url($_SERVER['HTTP_REFERER'],PHP_URL_HOST);
			$sql = "INSERT INTO {$wpdb->prefix}dpc_statistics (timestamp, referrer, host) VALUES ('".time()."', '".$_SERVER['HTTP_REFERER']."', '".$host."')";
			$wpdb->query($sql);
			//echo $sql;
		}
		return;
	}
	
	function registerWidgets(){
		if(is_admin()){
			add_action('wp_dashboard_setup', array(&$this, 'hook_wp_dashboard_setup'));
		}
	}
	
	function hook_wp_dashboard_setup(){
		$screen = get_current_screen();
		if(is_object($screen)){
			if($screen->base != 'dashboard'){
				return false;
			}
		}
		
		require_once('widgets/dashboard.php');
		wp_add_dashboard_widget(
			'dpc_basic_statistics_dashboard',
			$this->dpc->getText('Hits'),
			array(new DelucksStatistic($this->dpc), 'dashboard_widget')
		);
	}
	
}