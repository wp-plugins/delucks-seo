<?php 

class DPC_Module_Dpc_Ccrate {
	
	var $dpc				= null;
	var $isSubmodule		= true;
	var $moduleDirectory 	= 'ccrate/';
	var $moduleTitle 		= '';
	var $optionsHook		= 'dpc-dpc-ccrate';
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
		if($this->dpc->cc == true){
			$this->dpc->parseSettingsByXml($this->settingsFile, 'rateus_cc');
		} else {
			$this->dpc->parseSettingsByXml($this->settingsFile, 'rateus_wp');
		}
	}
	
	function adminSettingsHead(){
		wp_enqueue_script('dpc-ccrate-settings', plugins_url( 'assets/js/settings.js', __FILE__ ), array('jquery'));
		wp_localize_script('dpc-ccrate-settings', 'dpc_dashboard_translator', $this->translatorJs);
		wp_enqueue_style('dpc-ccrate-settings', plugins_url( 'assets/css/settings.css', __FILE__ ));
	}
	
	function registerWidgets(){ }
	function adminHead(){ }
	function executeFrontendActions(){ }
}