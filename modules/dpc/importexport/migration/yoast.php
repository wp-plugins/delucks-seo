<?php 

class DPC_Module_Dpc_Importexport_Migration_Yoast {

	var $adapterKey		= 'yoast';
	var $adapterName	= 'Yoast SEO Plugin';
	var $adapterVersion	= null;
	var $dpc			= null;
	var $optionSettings	= array();
	var $migrationCount	= array();
	var $srcValueState	= null;
	
	function __construct(&$dpc){
		$this->dpc = $dpc;
		$this->getFields();
	}
	
	function showWizard($step = 'wizard'){
		$this->dpc->parseSettingsByXml(dirname(__FILE__) . '/'.$this->adapterKey.'.xml', $step, false, true);
	}
	
	function getFields($index = false){
		$cpt = $this->dpc->oFunctions->getCustomPostTypes('attachment');
				
		if(!count($this->optionSettings)){
			/**
			 * Post Types
			 * @todo: Books CPT fehlt
			 */
			foreach($cpt as $k => $v){
				$this->optionSettings['basic_sitemaps'][] 			= array('module_name' => $this->dpc->getText('Sitemaps'), 'module' => 'basic_sitemaps', 'src_key' => 'wpseo_xml', 'src_field' => 'post_types-'.$v['name'].'-not_in_sitemap', 'dest_field' => 'default][cpt]['.$v['name'].'][status', 'label' =>  $this->dpc->getText('Include type').': '.$this->dpc->getText($v['label']));
			}
			
			$this->optionSettings['basic_metadata'][] 				= array('module_name' => $this->dpc->getText('Metadata'), 'module' => 'basic_metadata', 'src_key' => 'wpseo', 'src_field' => 'alexaverify', 'dest_field' => 'verify][alexa', 'label' => $this->dpc->getText('Verify website').': Alexa');
			$this->optionSettings['basic_metadata'][] 				= array('module_name' => $this->dpc->getText('Metadata'), 'module' => 'basic_metadata', 'src_key' => 'wpseo', 'src_field' => 'msverify', 'dest_field' => 'verify][bing', 'label' => $this->dpc->getText('Verify website').': Bing');
			$this->optionSettings['basic_metadata'][] 				= array('module_name' => $this->dpc->getText('Metadata'), 'module' => 'basic_metadata', 'src_key' => 'wpseo', 'src_field' => 'googleverify', 'dest_field' => 'verify][google', 'label' => $this->dpc->getText('Verify website').': Google+');
			$this->optionSettings['basic_metadata'][] 				= array('module_name' => $this->dpc->getText('Metadata'), 'module' => 'basic_metadata', 'src_key' => 'wpseo', 'src_field' => 'pinterestverify', 'dest_field' => 'verify][pinterest', 'label' => $this->dpc->getText('Verify website').': Pinterest');
			$this->optionSettings['basic_urls'][] 					= array('module_name' => $this->dpc->getText('URL optimization'), 'module' => 'basic_urls', 'src_key' => 'wpseo_permalinks', 	'src_field' => 'cleanslugs', 'dest_field' => 'stopwords', 'label' => $this->dpc->getText('Remove stopwords from urls'));
			$this->optionSettings['basic_urls'][] 					= array('module_name' => $this->dpc->getText('URL optimization'), 'module' => 'basic_urls', 'src_key' => 'wpseo_permalinks', 	'src_field' => 'force_transport', 'dest_field' => 'forceSSL', 'label' => $this->dpc->getText('Force encrypted connection'));
			$this->optionSettings['professional_microdata'][] 		= array('module_name' => $this->dpc->getText('Microdata'), 'module' => 'professional_microdata', 'src_key' => 'wpseo_social', 'src_field' => 'facebook_site', 'dest_field' => 'facebookUrl', 'label' => $this->dpc->getText('Social metatag').': Facebook');
			$this->optionSettings['professional_microdata'][] 		= array('module_name' => $this->dpc->getText('Microdata'), 'module' => 'professional_microdata', 'src_key' => 'wpseo_social', 'src_field' => 'plus-publisher',	'dest_field' => 'googleUrl', 'label' => $this->dpc->getText('Social metatag').': Google+');
			$this->optionSettings['professional_microdata'][] 		= array('module_name' => $this->dpc->getText('Microdata'), 'module' => 'professional_microdata', 'src_key' => 'wpseo_social', 'src_field' => 'twitter_site', 'dest_field' => 'twittername', 'label' => $this->dpc->getText('Social metatag').': Twitter');
			$this->optionSettings['professional_breadcrumbs'][] 	= array('module_name' => $this->dpc->getText('Breadcrumbs'), 'module' => 'professional_breadcrumbs', 'src_key' => 'wpseo_internallinks', 'src_field' => 'breadcrumbs-sep', 'dest_field' => 'de][seperator', 'label' => $this->dpc->getText('Delimiter'));
			$this->optionSettings['professional_breadcrumbs'][] 	= array('module_name' => $this->dpc->getText('Breadcrumbs'), 'module' => 'professional_breadcrumbs', 'src_key' => 'wpseo_internallinks', 'src_field' => 'breadcrumbs-home', 'dest_field' => 'de][homeText', 'label' => $this->dpc->getText('Frontpage text'));
			$this->optionSettings['professional_breadcrumbs'][] 	= array('module_name' => $this->dpc->getText('Breadcrumbs'), 'module' => 'professional_breadcrumbs', 'src_key' => 'wpseo_internallinks', 'src_field' => 'breadcrumbs-prefix', 'dest_field' => 'de][prefixBefore',	'label' => $this->dpc->getText('Prefix').': '.$this->dpc->getText('Before breadcrumbs'));
			$this->optionSettings['professional_breadcrumbs'][] 	= array('module_name' => $this->dpc->getText('Breadcrumbs'), 'module' => 'professional_breadcrumbs', 'src_key' => 'wpseo_internallinks', 'src_field' => 'breadcrumbs-archiveprefix', 'dest_field' => 'de][prefixArchive', 'label' => $this->dpc->getText('Prefix').': '.$this->dpc->getText('Before archive'));
			$this->optionSettings['professional_breadcrumbs'][] 	= array('module_name' => $this->dpc->getText('Breadcrumbs'), 'module' => 'professional_breadcrumbs', 'src_key' => 'wpseo_internallinks', 'src_field' => 'breadcrumbs-searchprefix', 'dest_field' => 'de][prefixSearch', 'label' => $this->dpc->getText('Prefix').': '.$this->dpc->getText('Search result pages'));
			$this->optionSettings['professional_breadcrumbs'][] 	= array('module_name' => $this->dpc->getText('Breadcrumbs'), 'module' => 'professional_breadcrumbs', 'src_key' => 'wpseo_internallinks', 'src_field' => 'breadcrumbs-404crumb', 'dest_field' => 'de][prefixNotFound', 'label' => $this->dpc->getText('Prefix').': '.$this->dpc->getText('404 pages'));
			$this->optionSettings['professional_breadcrumbs'][] 	= array('module_name' => $this->dpc->getText('Breadcrumbs'), 'module' => 'professional_breadcrumbs', 'src_key' => 'wpseo_internallinks', 'src_field' => 'breadcrumbs-boldlast', 'dest_field' => 'lastBold', 'label' => $this->dpc->getText('Show last page in bold'));
		}
		
		if($index){
			return $this->optionSettings[$index];
		} else {
			$data = array();
			foreach($this->optionSettings as $module => $sdata){
				foreach($sdata as $k => $field){
					$sdata[$k]['module'] = $module;
				}
				$data = array_merge($data, $sdata);
			}
			
			return $data;
		}
	}
	
	function getFormdata(){
		if(isset($_REQUEST['dpc']['dpc_importexport_migration_'.$this->adapterKey])){
			return $_REQUEST['dpc']['dpc_importexport_migration_'.$this->adapterKey];
		}
		return false;
	}
			
	function migrate(){
		//echo '<h3>'.$this->dpc->getText('Migration status').'</h3>';
		if(is_array($formdata = $this->getFormdata())){
			if(isset($formdata['settings'])){ //settings
				foreach($this->getFields() as $k => $data){
					$migrate = false;
					if(!isset($formdata[$data['module']])){
						continue;
					}
					
					if(!strpos($data['dest_field'], '][')){
						if(isset($formdata[$data['module']]) && isset($formdata[$data['module']][$data['dest_field']])) {
							$migrate = true;
						}
					} else {
						$temp = &$formdata[$data['module']];
						foreach($parts = explode('][', $data['dest_field']) as $i => $key) {
							if(!isset($temp[$key])){
								continue;
							} else {
								$temp = &$temp[$key];
								if($i+1 == count($parts)){
									$migrate = true;
								}
							}
						}
					}
					
					if(!$migrate) continue;
					if(!isset($this->migrationCount[$this->dpc->getText($data['module_name'])])){
						$this->migrationCount[$this->dpc->getText($data['module_name'])] = 0;
					}
					$this->migrationCount[$this->dpc->getText($data['module_name'])] = $this->migrationCount[$this->dpc->getText($data['module_name'])] +1; //count for success area
					$destSettings 	= $this->dpc->getModuleSettings($data['module']);
					$srcValue		= $this->modifyValue($data['dest_field'], $this->getSrcValue($data['src_field'], $data['src_key']));
					$destSettings	= $this->setValueToDestSettings($destSettings, $data['dest_field'], $srcValue);
					update_option('dpc_'.$data['module'], $destSettings);
					
				}
			}
			
			if(isset($formdata['metadata'])){ //metadata
				$this->migrationCount[$this->dpc->getText('Metadata fields')] = 0;
				global $wpdb;
				$sql = "SELECT `ID` FROM $wpdb->posts WHERE `post_type` IN('".join("','",get_post_types(array('public' => true)))."') AND `post_type` NOT IN('".join("','",array('attachment', 'revision'))."') AND `post_status` NOT IN('".join("','",array('auto-draft', 'trash'))."')";
				$posts = $wpdb->get_results($sql, ARRAY_A);
				
				foreach($posts as $id){
					if(isset($formdata['metadata']['focus_keyword'])){
						$focusKeyword = get_post_meta($id['ID'], '_yoast_wpseo_focuskw', true);
						if((isset($formdata['metadata']['focus_keyword']) && !empty($focusKeyword)) || !isset($formdata['metadata']['skip_empty'])){
							update_post_meta($id['ID'], 'dpc_keyword', $focusKeyword);
							$this->migrationCount[$this->dpc->getText('Metadata fields')] = $this->migrationCount[$this->dpc->getText('Metadata fields')] +1; //count for success area
						}
					}
					
					if(isset($formdata['metadata']['title'])){
						$title = get_post_meta($id['ID'], '_yoast_wpseo_title', true);
						if((isset($formdata['metadata']['title']) && !empty($title)) || !isset($formdata['metadata']['skip_empty'])){
							#update_post_meta($id['ID'], 'dpc_keyword', $title);
						}
					}
					
					if(isset($formdata['metadata']['meta_description'])){
						$metaDescription = get_post_meta($id['ID'], '_yoast_wpseo_metadesc', true);
						if((isset($formdata['metadata']['meta_description']) && !empty($metaDescription)) || !isset($formdata['metadata']['skip_empty'])){
							update_post_meta($id['ID'], 'dpc-textopt-description', $metaDescription);
							$this->migrationCount[$this->dpc->getText('Metadata fields')] = $this->migrationCount[$this->dpc->getText('Metadata fields')] +1; //count for success area
						}
					}
				}
			}
			
			$this->dpc->parseSettingsByXml(dirname(__FILE__) . '/'.$this->adapterKey.'.xml', 'success', false, true);
			
		}
		die();
	}
	
	function modifyValue($destField, $value){
		switch($destField){
			case 'forceSSL':
				if($value == 'https'){
					$value = 'on';
				} else {
					$value = null;
				}
				break;
			case 'default][cpt][post][status':
			case 'default][cpt][page][status':
				if($value == 1){
					$value = null;
				} else {
					$value = 'on';
				}
				
				break;
		}
		return $value;
	}
	
	function setValueToDestSettings(array $dest, $destField, $value){
		if(strpos($destField, '][') !== false){
			$temp = &$dest;
			foreach(explode('][', $destField) as $key) {
			    $temp = &$temp[$key];
			}
			$temp = $value;

			unset($temp);
			return $dest;
		}
		$dest[$destField] = $value;
		
		if($value == null){
			unset($dest[$destField]);
		}

		return $dest;
	}

	function getSrcValue($optionField, $optionKey = false){
		if($optionKey){
			$data = get_option($optionKey);
			return $data[$optionField];
		}
		return get_option($optionField);
	}
	
	function getMigrationCount(){
		$data = array();
		foreach($this->migrationCount as $module => $count){
			$data[] = array('module' => $module, 'count' => $count);
		}
		return $data;
	}

}