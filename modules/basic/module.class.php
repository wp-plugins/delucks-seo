<?php 

class DPC_Module_Basic {
	
	var $dpc				= null;
	var $isSubmodule		= false;
	var $moduleName		 	= 'basic';
	var $moduleTitle 		= 'Basic';
	var $optionsHook		= 'dpc-basic';

    /**
     * The constructor simply saves the reference to the Master-DPC object into an attribute.
     *
     * @param $dpc The DPC object that instantiated this module
     */
    function __construct(&$dpc){
		$this->dpc = $dpc;
	}

    /**
     * registerInAdminMenu() gets called while the admin navigation is built. Checks if this module is part of the license
     * and registers a navigation link if that's the case.
     *
     * @return bool Returns false if this module isn't part of the license
     */
    function registerInAdminMenu(){
		add_submenu_page( strtolower(DPC_HOOK), $this->moduleTitle, $this->moduleTitle, 'manage_options', $this->optionsHook, array($this, 'adminSettings'));
	}

    /**
     * adminSettings() gets called if you click on the navigation point of this module. This method builds the backend form
     * and populates it with data from all submodules that belong to the current module.
     */
    function adminSettings(){
		require_once(DPC_PLUGIN_HELPER_DIR . 'gui.class.php');
		$gui = new DPC_Helper_Gui($this->dpc);
		echo $gui->formStart();
		echo $gui->topMenu();
		foreach($this->dpc->moduleList['basic'] as $subModule){
			$this->dpc->triggerModuleMethod($this->dpc->moduleInstances['basic_'.$subModule], 'adminSettings');
		}
		echo $gui->formClose();
	}
	
	
}