<?php 

/*
 * Licence Check for EDD
* */
class DPC_Helper_License {
	
	var $dpc 			= null;
	var $licenseServer 	= 'https://delucks.com';
	var $license 		= '';
	var $oldLicense 	= '';
	var $products		= array('suite' => array('name' => 'DELUCKS SEO Plugin for WordPress Suite'), 'professional' => array('name' => 'DELUCKS SEO Plugin for WordPress Professional'), 'basic' => array('name' => 'DELUCKS SEO Plugin for WordPress FREE'));
	var $details		= '';
	var $upgrade		= false;

	function __construct(&$dpc){
		$this->dpc = $dpc;
		$this->updateLicense();
		$this->license = $this->getLicense();
		if(is_admin()){
			if(strlen($this->license)){
				$this->checkLicense();
			}
		}
		add_action('admin_enqueue_scripts', array(&$this, 'hook_admin_enqueue_scripts'));
		add_action('admin_init', array(&$this, 'hook_admin_init'));
	}
	
	function hook_admin_init(){
		wp_enqueue_style('dpc-general', plugins_url( 'assets/dpc/css/general.css', DPC_FILE ));
		wp_enqueue_script('dpc-general', plugins_url( 'assets/dpc/js/general.js', DPC_FILE ), array('jquery'));
	}
	
	function hook_admin_enqueue_scripts(){
		echo '<script type="text/javascript">'."\n";
		echo '	var dpc_license_server_url	= "' . $this->licenseServer . '"' . ";\n";
		echo '	var dpc_license_key			= "' . $this->license . '"' . ";\n";
		echo '	var dpc_license_type		= "' . (isset($this->details->item_name) ? $this->details->item_name : '') . '"' . ";\n";
		echo '	var dpc_hostname			= "' . 'http://'.str_replace(array('http://', 'https://'), '', $_SERVER['HTTP_HOST']) . '"' . ";\n";
		echo '</script>'."\n";
	}
	
	function updateLicense(){
		if(isset($_POST['dpcLicenseKey'])){
			$this->oldLicense = $this->getLicense();
			update_option('dpc_license_key', $_POST['dpcLicenseKey']);
			$this->activateLicense();
		}
	}
	
	function getLicense(){
		return get_option('dpc_license_key');
	}
	
	function activateLicense(){
		foreach($this->products as $key => $product){
			$api_params = array(
					'edd_action' 	=> 'activate_license',
					'license' 		=> $_POST['dpcLicenseKey'],
					'item_name' 	=> urlencode($product['name'])
			);
				
			$response = wp_remote_get( add_query_arg( $api_params, $this->licenseServer ), array( 'timeout' => 15, 'sslverify' => false ) );
			if (!is_wp_error($response)){
				if(is_object($license_data = json_decode(wp_remote_retrieve_body($response)))){
					if($license_data->license == 'valid'){
						update_option('dpc_license_product', $product['name']);
						if($_POST['dpcLicenseKey'] !== $this->oldLicense){
							array_push($this->dpc->messages, array('type' => 'success', 'text' => $this->dpc->getText('License key has been updated').'!'));
						}
						return true;
						break;
					} else {
						update_option('dpc_license_product', $this->products['basic']['name']);
					}
				}
			}
		}
		array_push($this->dpc->messages, array('type' => 'error', 'text' => $this->dpc->getText('License key seems to be wrong or invalid').'!'));
	}
	
	function checkLicense() {
		foreach($this->products as $key => $product){
			$api_params = array(
					'edd_action' => 'check_license',
					'license' => $this->license,
					'item_name' => urlencode($product['name'])
			);
			

			
			$response = wp_remote_get( add_query_arg( $api_params, $this->licenseServer ), array( 'timeout' => 15, 'sslverify' => false ) );
			if (is_wp_error($response)){
				return false;
			}

			if(is_object($license_data = json_decode(wp_remote_retrieve_body($response)))){
				$this->details = $license_data;
				if($license_data->license == 'valid'){
					if($key == 'suite'){
						$this->products['suite']['status']			= true;
						$this->products['professional']['status']	= true;
						break;
					} else {
						$this->products[$key]['status']	= true;
						break;
					}
				}
			}			
		}		
	}
	
	function checkProduct($key){
		if(isset($this->products[$key]) && isset($this->products[$key]['status'])){
			return $this->products[$key]['status'];
		}
		return false;
	}
	
	function checkModule($moduleName){
		$parts = explode('_', $moduleName);
		if(in_array($parts[0], array('basic', 'dpc'))){
			return true;
		}
		if(is_array($parts)){
			return $this->checkProduct($parts[0]);
		}
		return false;	
	}
	
	function printStatus(){
		echo "<pre>";
		print_r($this->license);
		echo "<br/><br/>";
		print_r($this->products);
		echo "<br/><br/>";
		print_r($this->details);
		echo "</pre>";
	}
	
	function updateCheck(){
		$productName = strlen(get_option('dpc_license_product')) ? get_option('dpc_license_product') : $this->products['basic']['name'];
		if($productName == $this->products['basic']['name']){
			return false;
		} elseif($this->dpc->cc == true){
			add_filter('site_transient_update_plugins', array($this, 'remove_update_notification'));
			return false;
		} else {
			if(!class_exists('EDD_SL_Plugin_Updater')){
				include(dirname(DPC_FILE) . '/helper/EDD_SL_Plugin_Updater.php');
			}
		}

		foreach($this->products as $key => $val){
			if($key !== 'basic'){
				if(!is_readable(DPC_PLUGIN_MODULES_DIR . $key) && (strpos(strtoupper($this->details->item_name), strtoupper($key)) !== false)){
					$this->upgrade = true;
					$version = 'upgrade';
				} else {
					$version = $this->dpc->version;
				}
	
				if(isset($val['status']) && $val['status']){
					$edd_updater = new EDD_SL_Plugin_Updater( $this->licenseServer, DPC_FILE, array(
							'version' 	=> $version,
							'license' 	=> $this->getLicense(),
							'item_name' => $val['name'],
							'author' 	=> $this->dpc->author
					));
					break;
				}
			}
		}

	}
	
	function remove_update_notification($value) {
		unset($value->response[plugin_basename(DPC_FILE)]);
		return $value;
	}
	
}