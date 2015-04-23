<?php 

class DPC_Module_Dpc_Dashboard {
	
	var $dpc				= null;
	var $isSubmodule		= true;
	var $moduleDirectory 	= 'dashboard/';
	var $moduleTitle 		= '';
	var $optionsHook		= 'dpc-dpc-dashboard';
	var $settingsFile		= false;
	var $translatorJs		= array();
	
	function __construct(&$dpc){
		$this->settingsFile = dirname(__FILE__) . '/settings.xml';
		$this->dpc 			= $dpc;
		$this->moduleTitle	= $this->dpc->getText('Start');
		$this->translatorJs = array(
				'unlock' 	=> $this->dpc->getText('Unlock')		
		);
	}

	function adminSettings(){
		$this->dpc->parseSettingsByXml($this->settingsFile, 'general');
	}
	
	function adminSettingsHead(){
		wp_enqueue_script('dpc-dashboard-settings', plugins_url( 'assets/js/settings.js', __FILE__ ), array('jquery'));
		wp_localize_script('dpc-dashboard-settings', 'dpc_dashboard_translator', $this->translatorJs);
		wp_enqueue_script('knob', plugins_url( 'assets/js/jquery.knob.js', __FILE__ ), array('jquery'));
		wp_enqueue_script('raphael', plugins_url( 'assets/js/raphael-min.js', __FILE__ ), array('jquery'));
		wp_enqueue_script('morris', plugins_url( 'assets/js/morris-0.5.1.min.js', __FILE__ ), array('jquery'));
		wp_enqueue_style('dpc-dashboard-settings', plugins_url( 'assets/css/settings.css', __FILE__ ));
	}
	
	function registerWidgets(){ }
	function adminHead(){ }
	function executeFrontendActions(){ }
}