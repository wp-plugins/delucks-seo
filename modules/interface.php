<?php 

interface DPC_Module_Interface {
	
	/**
	 * The constructor simply saves the reference to the Master-DPC object into an attribute.
	 *
	 * @param $dpc The DPC object that instantiated this module
	 */
	public function __construct(&$dpc);
	
	/**
	 * adminHead() attach stylesheets and/or javascript to the head when the backend is displayed.
	 */
	public function adminHead();
	
	/**
	 * adminSettings() gets called when the admin page of the parent module is loaded and starts the population of
	 * the data described in the settingsFile. Based on this data a backend form is created and displayed.
	 */
	public function adminSettings();
	
	/**
	 * adminSettingsHead() attach stylesheets and/or javascript to the head when the admin page of the parent module is
	 * currently displayed.
	 */
	public function adminSettingsHead();
	
	/**
	 * executeBackendActions() is a hook that gets triggered every time a backend page is loaded.
	 */
	public function executeBackendActions();
	
	/**
	 * executeFrontendActions() is a hook that gets triggered every time a frontend page is loaded. Depending
	 * on the settings this registers actions on a global level (to alter all the content displayed) or just while the
	 * main content or the excerpt are shown.
	 */
	public function executeFrontendActions();
	
	/**
	 * registerWidgets() is a hook to register a widget.
	 */
	public function registerWidgets();

}