<?php 

class DPC_Module_Dpc_Importexport {
	
	var $dpc				= null;
	var $isSubmodule		= true;
	var $moduleTitle 		= '';
	var $moduleDirectory 	= 'importexport/';
	var $optionsHook		= 'dpc-dpc-importexport';
	var $settingsFile		= false;
	var $translatorJs		= array();
	var $settings			= false;
	var $doAction		 	= false;
	var $saveComment 		= '';
	var $files				= array();
	var $migrationAdapters	= array();
	
	function __construct(&$dpc){
		$this->settingsFile = dirname(__FILE__) . '/settings.xml'; 
		$this->dpc 			= $dpc;
		$this->moduleTitle	= $this->dpc->getText('Backup and migration');
		$this->settings 	= $this->dpc->getModuleSettings('dpc_importexport');
		$this->translatorJs = array(
				'save' 											=> $this->dpc->getText('Save'),
				'cancel' 										=> $this->dpc->getText('Cancel'),
				'close' 										=> $this->dpc->getText('Close'),
				'Migration wizard'								=> $this->dpc->getText('Migration wizard'),
				'Please select at least one option.'			=> $this->dpc->getText('Please select at least one option.'),
				'Yes, continue'									=> $this->dpc->getText('Yes, continue'),
				'Attention'										=> $this->dpc->getText('Attention'),
				'With the completion of the migration wizard, all data previously selected will be overwritten. Are you sure you want to perform this step?'	=>	$this->dpc->getText('With the completion of the migration wizard, all data previously selected will be overwritten. Are you sure you want to perform this step?'),
		);
		$this->getMigrationAdapters();
	}
	
	function getMigrationAdapter($name){
		if(isset($this->migrationAdapters[$name])){
			return $this->migrationAdapters[$name];
		}
		return null;
	}
	
	function getMigrationAdapters(){
		if(!count($this->migrationAdapters)){
			foreach(scandir(dirname(__FILE__) . '/migration/') as $filename){
				if(!preg_match('/\.php$/', $filename)) continue;

				$adapterClassName = get_class() . '_Migration_' . ucfirst(preg_replace('/\.php$/', '', $filename));
				$adapterClassFile = dirname(__FILE__) . '/migration/' . $filename;
				if(is_dir($adapterClassFile) || !is_readable($adapterClassFile)) continue;

				require_once($adapterClassFile);
				$adapter = new $adapterClassName($this->dpc);
				$this->migrationAdapters[$adapter->adapterKey] = $adapter;
			}
		}

		$adapters = array();
		if(count($this->migrationAdapters)){
			foreach($this->migrationAdapters as $adapterName => $adapter){
				$adapters[] = array('adapter' => $adapter->adapterKey, 'label' => $adapter->adapterName, 'version' => $adapter->adapterVersion);
			}
		}

		return $adapters;
	}
	
	function migrationStart(){
		return $this->executeMigrationAdapterMethod($_REQUEST['adapter'], 'migrate');
	}
	
	function executeMigrationAdapterMethod($adapter, $method, $param = ''){
		$adapter = $this->getMigrationAdapter($adapter);
		if(is_object($adapter) && method_exists($adapter, $method)){
			if(strpos($param, '#') !== false){
				return call_user_func_array(array($adapter, $method), explode('#', $param));
			} else {
				return $adapter->$method($param);
			}
		}
		return false;
	}
	
	function migrationWizard(){
		if(is_object($adapter = $this->getMigrationAdapter($_REQUEST['adapter']))){
			echo '<form method="POST" id="migrationWizard">';
			echo '	<input type="hidden" name="adapter" value="'.$_REQUEST['adapter'].'" />';
			echo '	<input type="hidden" name="current_step" value="'.(isset($_REQUEST['step']) ? $_REQUEST['step'] : '').'" />';
			$adapter->showWizard();
			echo '</form>';
		}
		die();
	}

	function adminSettings(){
		$this->dpc->parseSettingsByXml($this->settingsFile, 'general');
	}
	
	function adminSettingsHead(){
		wp_enqueue_style('dpc-dpc-importexport-settings', plugins_url( 'assets/css/settings.css', __FILE__ ));
		wp_enqueue_script('dpc-dpc-importexport-settings', plugins_url( 'assets/js/settings.js', __FILE__ ), array('jquery'));
		wp_localize_script('dpc-dpc-importexport-settings', 'dpc_dpc_importexport_translator', $this->translatorJs);
		wp_enqueue_script('dpc-dpc-importexport-wizard', plugins_url( 'assets/bootstrap-wizard/jquery.bootstrap.wizard.js', __FILE__ ), array('jquery'));
	}
	
	function adminHead(){ }
	function executeFrontendActions(){ }
	
	function executeBackendActions(){
		if(isset($_GET['action']) && $_GET['action'] == 'restore'){
			$this->restore();
		}
		$this->dpc->registerAjaxAction('dpc_importexport_download', array($this, 'download'));
		$this->dpc->registerAjaxAction('dpc_importexport_migration_wizard', array($this, 'migrationWizard'));
		$this->dpc->registerAjaxAction('dpc_importexport_migration_execute', array($this, 'migrationStart'));
	}
	
	function download(){
		if(!isset($_GET['file']) || !is_readable($file = $this->dpc->uploadDir . 'settings/' . $_GET['file'])){
			return false;
		}
		
		header('Content-Description: File Transfer');
		header('Content-Type: text/dpc');
		header('Content-Disposition: attachment; filename='.$_GET['file']);
		header('Content-Transfer-Encoding: binary');
		header('Expires: 0');
		header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
		header('Pragma: public');
		header('Content-Length: ' . filesize($file));
		ob_clean();
		flush();
		readfile($file);
		exit;
	}
	
	function restore(){
		if(!isset($_GET['file']) || !is_readable($this->dpc->uploadDir . 'settings/' . $_GET['file'])){
			return false;
		}
		
		require_once(DPC_PLUGIN_HELPER_DIR . 'functions.php');
		$dpcFunctions = new DPC_Functions($this->dpc);
		$fileData = $dpcFunctions->object2Array($this->readSettingsByFile($_GET['file']));

		if(is_array($fileData) && isset($fileData['settings'])){
			foreach($fileData['settings'] as $moduleName => $settings){
				update_option('dpc_'.$moduleName, $settings);
				if(isset($fileData['status']) && isset($fileData['status'][$moduleName])){
					update_option('dpc_status_' . $moduleName, $fileData['status'][$moduleName]);
				}
			}
		}
	}
	
	function delete(){
		if(isset($this->files)){
			foreach($this->files as $file => $v){
				if(!is_readable($file = $this->dpc->uploadDir . 'settings/' . $file)){
					continue;
				}
				unlink($file);
			}
		}
	}
	
	function upload(){
		if(isset($_FILES['settingsfile']) && !$_FILES['settingsfile']['error']){
			rename($_FILES['settingsfile']['tmp_name'], $file = $this->dpc->uploadDir . 'settings/' . $_FILES['settingsfile']['name']);
			unlink($_FILES['settingsfile']['tmp_name']);
		}
	}
	
	
	function onSaveActionBefore(){		
		if(isset($_POST['dpc']['dpc_importexport']['action'])){			
			$this->doAction 	= $_POST['dpc']['dpc_importexport']['action'];
			$this->saveComment	= $_POST['dpc']['dpc_importexport']['saveComment'];
			$this->files		= $_POST['dpc']['dpc_importexport']['file'];
			unset($_POST['dpc']['dpc_importexport']['action']);
			unset($_POST['dpc']['dpc_importexport']['saveComment']);
			unset($_POST['dpc']['dpc_importexport']['file']);
		}
	}
	
	function onSaveActionAfter(){
		switch($this->doAction){
			case 'save':
				$this->saveSettings();
				break;
			case 'delete':
				$this->delete();
				break;
			case 'upload':
				$this->upload();
				break;
		}
	}
	
	function saveSettings(){
		$postData = isset($_POST['dpc']['dpc_importexport']['save']) ? $_POST['dpc']['dpc_importexport']['save'] : array();
		if(!count($postData)){ return; }
		
		$settings = array();
		foreach($postData as $moduleKey => $value){
			//if(in_array($moduleKey, array('dpc_importexport'))){ continue; } //exclude from export
			if(count($moduleSettings = $this->dpc->getModuleSettings($moduleKey))){
				$settings['settings'][$moduleKey] = $moduleSettings;
			}
			$settings['status'][$moduleKey] = ($this->dpc->moduleIsActive($moduleKey) ? 1 : 0);
		}

		$settings['fileInfo']['comment']	= $this->saveComment;
		$settings['fileInfo']['timestamp']	= time();
		$settings_encoded 					= base64_encode(json_encode($settings));		
		$filename 							= $this->dpc->uploadDir . 'settings/settings-' . date('Y-m-d', $settings['fileInfo']['timestamp']) . '-' . strtoupper(substr(md5(time()), 0, 5)) .  '.dpc';
		
		$this->dpc->setupPluginDirectory($this->dpc->uploadDir . 'settings');
		$fh = fopen($filename,w);
		fwrite($fh,$settings_encoded);
		fclose($fh);
	}
	
	
	function restoreSettings(){
		#$settingsFile = json_decode(base64_decode($settings_encoded));
		#$upload_dir = wp_upload_dir();
		//'dpc_status_' . $moduleName;
	}
	
	function getFiles(){
		$data = array();
		if(is_readable($this->dpc->uploadDir . 'settings')){
			foreach(scandir($this->dpc->uploadDir . 'settings') as $file){
				if($file == '.' || $file == '..'){ continue; }
				$fileInfo = $this->getFileInfo($file);
				
				$urlRestore 	= '?page=' . $_GET['page'] . '&action=restore&file='.$file;
				$urlDownload 	= 'admin-post.php?&action=dpc_importexport_download&file='.$file;
				
				$data[] = array('id' => md5($file), 'filename' => $file, 'restore_url' => $urlRestore, 'download_url' => $urlDownload, 'comment' => $fileInfo['comment'], 'timestamp' => $fileInfo['timestamp'], 'date' => date('d.m.Y', $fileInfo['timestamp']), 'time' => date('H:i:s', $fileInfo['timestamp']));
			}
		}

		return $data;
	}
	
	function getFileInfo($filename){
		$settings = $this->readSettingsByFile($filename);
		if(is_object($settings) && property_exists($settings, 'fileInfo')){
			return (array)$settings->fileInfo;
		}
		return array();	
	}
	
	function readSettingsByFile($filename){
		if(!is_readable($file = $this->dpc->uploadDir . 'settings/' . $filename)){
			return array();
		}
		return json_decode(base64_decode(file_get_contents($file)));
	}

}