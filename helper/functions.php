<?php 

class DPC_Functions {
	
	var $dpc = null;
	
	function __construct(DPC &$dpc){
		$this->dpc = $dpc;
	}
	
	function getObejctId(){
		return $this->dpc->objectId;
	}
	
	function settingsSectionExists($sectionName = ''){
		return $this->dpc->parseSettingsByXml($this->dpc->lastSettingsFile, $sectionName, false, false, true);
	}
	
	/*
	function showModuleSettingsSection($moduleName, $sectionName){
		$parts = explode('_', $moduleName);
		$module = isset($parts[1]) ? $this->dpc->getModuleInstance($parts[0], $parts[1]) : $this->dpc->getModuleInstance($parts[0]);
		echo "<pre>";
		print_r($module);
		echo "</pre>";
	}
	*/
	
	function getObejctType(){
		return $this->dpc->objectType;
	}
	
	function getPostHits($postId, $average = false){
		$count	= get_post_meta($postId, 'dpc_hits', true);
		if($average){
			if(is_object($post = get_post($postId))){
				$days = round(abs(time()-strtotime($post->post_date))/86400);
				$count = ($count / $days);
				return round($count, 2);
				
			}
			return 0;
		}
		
		return ($count ? $count : 0);
	}
	 
	function getCustomPostTypes($skip = ''){
		$skip = explode(',', $skip);
		$data = array();
		foreach(get_post_types(array('public' => true))  as $postType){
			if(in_array($postType, $skip)){ continue; }
			$data[] = array('name' => $postType, 'label' => get_post_type_object($postType)->label, 'value' => $postType);
		}
		return $data;
	}
	
	function plist($list){
		$data = array();
		foreach(explode(',',$list) as $v){
			$data[] = array('label' => trim($v), 'name' => trim(strtolower($v)));
		}
		return $data;
	}
	
	
	function getCountries(){
		$data = array();
		$countries = array ('AF'=> 'Afghanistan','AL'=> 'Albania','DZ'=> 'Algeria','AD'=> 'Andorra','AO'=> 'Angola','AI'=> 'Anguilla','AQ'=> 'Antarctica','AR'=> 'Argentina','AM'=> 'Armenia','AW'=> 'Aruba','AU'=> 'Australia','AT'=> 'Austria','AZ'=> 'Azerbaijan','BS'=> 'Bahamas','BH'=> 'Bahrain','BD'=> 'Bangladesh','BB'=> 'Barbados','BY'=> 'Belarus','BE'=> 'Belgium','BZ'=> 'Belize','BJ'=> 'Benin','BM'=> 'Bermuda','BT'=> 'Bhutan','BO'=> 'Bolivia','BA'=> 'Bosnia and Herzegovina','BW'=> 'Botswana','BV'=> 'Bouvet Island','BR'=> 'Brazil','BQ'=> 'British Antarctic Territory','IO'=> 'British Indian Ocean Territory','VG'=> 'British Virgin Islands','BN'=> 'Brunei','BG'=> 'Bulgaria','BF'=> 'Burkina Faso','BI'=> 'Burundi','KH'=> 'Cambodia','CM'=> 'Cameroon','CA'=> 'Canada','CT'=> 'Canton and Enderbury Islands','CV'=> 'Cape Verde','KY'=> 'Cayman Islands','CF'=> 'Central African Republic','TD'=> 'Chad','CL'=> 'Chile','CN'=> 'China','CX'=> 'Christmas Island','CC'=> 'Cocos [Keeling] Islands','CO'=> 'Colombia','KM'=> 'Comoros','CG'=> 'Congo - Brazzaville','CD'=> 'Congo - Kinshasa','CK'=> 'Cook Islands','CR'=> 'Costa Rica','HR'=> 'Croatia','CU'=> 'Cuba','CY'=> 'Cyprus','CZ'=> 'Czech Republic','CI'=> 'Côte d’Ivoire','DK'=> 'Denmark','DJ'=> 'Djibouti','DM'=> 'Dominica','DO'=> 'Dominican Republic','NQ'=> 'Dronning Maud Land','DD'=> 'East Germany','EC'=> 'Ecuador','EG'=> 'Egypt','SV'=> 'El Salvador','GQ'=> 'Equatorial Guinea','ER'=> 'Eritrea','EE'=> 'Estonia','ET'=> 'Ethiopia','FK'=> 'Falkland Islands','FO'=> 'Faroe Islands','FJ'=> 'Fiji','FI'=> 'Finland','FR'=> 'France','GF'=> 'French Guiana','PF'=> 'French Polynesia','TF'=> 'French Southern Territories','FQ'=> 'French Southern and Antarctic Territories','GA'=> 'Gabon','GM'=> 'Gambia','GE'=> 'Georgia','DE'=> 'Germany','GH'=> 'Ghana','GI'=> 'Gibraltar','GR'=> 'Greece','GL'=> 'Greenland','GD'=> 'Grenada','GP'=> 'Guadeloupe','GU'=> 'Guam','GT'=> 'Guatemala','GG'=> 'Guernsey','GN'=> 'Guinea','GW'=> 'Guinea-Bissau','GY'=> 'Guyana','HT'=> 'Haiti','HM'=> 'Heard Island and McDonald Islands','HN'=> 'Honduras','HK'=> 'Hong Kong SAR China','HU'=> 'Hungary','IS'=> 'Iceland','IN'=> 'India','ID'=> 'Indonesia','IR'=> 'Iran','IQ'=> 'Iraq','IE'=> 'Ireland','IM'=> 'Isle of Man','IL'=> 'Israel','IT'=> 'Italy','JM'=> 'Jamaica','JP'=> 'Japan','JE'=> 'Jersey','JT'=> 'Johnston Island','JO'=> 'Jordan','KZ'=> 'Kazakhstan','KE'=> 'Kenya','KI'=> 'Kiribati','KW'=> 'Kuwait','KG'=> 'Kyrgyzstan','LA'=> 'Laos','LV'=> 'Latvia','LB'=> 'Lebanon','LS'=> 'Lesotho','LR'=> 'Liberia','LY'=> 'Libya','LI'=> 'Liechtenstein','LT'=> 'Lithuania','LU'=> 'Luxembourg','MO'=> 'Macau SAR China','MK'=> 'Macedonia','MG'=> 'Madagascar','MW'=> 'Malawi','MY'=> 'Malaysia','MV'=> 'Maldives','ML'=> 'Mali','MT'=> 'Malta','MH'=> 'Marshall Islands','MQ'=> 'Martinique','MR'=> 'Mauritania','MU'=> 'Mauritius','YT'=> 'Mayotte','FX'=> 'Metropolitan France','MX'=> 'Mexico','FM'=> 'Micronesia','MI'=> 'Midway Islands','MD'=> 'Moldova','MC'=> 'Monaco','MN'=> 'Mongolia','ME'=> 'Montenegro','MS'=> 'Montserrat','MA'=> 'Morocco','MZ'=> 'Mozambique','MM'=> 'Myanmar [Burma]','NA'=> 'Namibia','NR'=> 'Nauru','NP'=> 'Nepal','NL'=> 'Netherlands','AN'=> 'Netherlands Antilles','NT'=> 'Neutral Zone','NC'=> 'New Caledonia','NZ'=> 'New Zealand','NI'=> 'Nicaragua','NE'=> 'Niger','NG'=> 'Nigeria','NU'=> 'Niue','NF'=> 'Norfolk Island','KP'=> 'North Korea','VD'=> 'North Vietnam','MP'=> 'Northern Mariana Islands','NO'=> 'Norway','OM'=> 'Oman','PC'=> 'Pacific Islands Trust Territory','PK'=> 'Pakistan','PW'=> 'Palau','PS'=> 'Palestinian Territories','PA'=> 'Panama','PZ'=> 'Panama Canal Zone','PG'=> 'Papua New Guinea','PY'=> 'Paraguay','YD'=> 'People\'s Democratic Republic of Yemen','PE'=> 'Peru','PH'=> 'Philippines','PN'=> 'Pitcairn Islands','PL'=> 'Poland','PT'=> 'Portugal','PR'=> 'Puerto Rico','QA'=> 'Qatar','RO'=> 'Romania','RU'=> 'Russia','RW'=> 'Rwanda','RE'=> 'Réunion','BL'=> 'Saint Barthélemy','SH'=> 'Saint Helena','KN'=> 'Saint Kitts and Nevis','LC'=> 'Saint Lucia','MF'=> 'Saint Martin','PM'=> 'Saint Pierre and Miquelon','VC'=> 'Saint Vincent and the Grenadines','WS'=> 'Samoa','SM'=> 'San Marino','SA'=> 'Saudi Arabia','SN'=> 'Senegal','RS'=> 'Serbia','CS'=> 'Serbia and Montenegro','SC'=> 'Seychelles','SL'=> 'Sierra Leone','SG'=> 'Singapore','SK'=> 'Slovakia','SI'=> 'Slovenia','SB'=> 'Solomon Islands','SO'=> 'Somalia','ZA'=> 'South Africa','GS'=> 'South Georgia and the South Sandwich Islands','KR'=> 'South Korea','ES'=> 'Spain','LK'=> 'Sri Lanka','SD'=> 'Sudan','SR'=> 'Suriname','SJ'=> 'Svalbard and Jan Mayen','SZ'=> 'Swaziland','SE'=> 'Sweden','CH'=> 'Switzerland','SY'=> 'Syria','ST'=> 'São Tomé and Príncipe','TW'=> 'Taiwan','TJ'=> 'Tajikistan','TZ'=> 'Tanzania','TH'=> 'Thailand','TL'=> 'Timor-Leste','TG'=> 'Togo','TK'=> 'Tokelau','TO'=> 'Tonga','TT'=> 'Trinidad and Tobago','TN'=> 'Tunisia','TR'=> 'Turkey','TM'=> 'Turkmenistan','TC'=> 'Turks and Caicos Islands','TV'=> 'Tuvalu','UM'=> 'U.S. Minor Outlying Islands','PU'=> 'U.S. Miscellaneous Pacific Islands','VI'=> 'U.S. Virgin Islands','UG'=> 'Uganda','UA'=> 'Ukraine','SU'=> 'Union of Soviet Socialist Republics','AE'=> 'United Arab Emirates','GB'=> 'United Kingdom','US'=> 'United States','UY'=> 'Uruguay','UZ'=> 'Uzbekistan','VA'=> 'Vatican City','VE'=> 'Venezuela','VN'=> 'Vietnam','WK'=> 'Wake Island','WF'=> 'Wallis and Futuna','EH'=> 'Western Sahara','YE'=> 'Yemen','ZM'=> 'Zambia','ZW'=> 'Zimbabwe','AX'=> 'Åland Islands');
		
		foreach($countries as $k => $v){
			$data[] = array('name' => $v, 'label' => $v, 'value' => $k);
		}
		return $data;
	}
	
	function getUserLang(){
		if(defined('ICL_LANGUAGE_CODE')){
			return ICL_LANGUAGE_CODE;
		} else{
			$lang = get_locale();
		}
		$lang = substr($lang, 0, strpos($lang, '_'));
		
		return $lang;
	}
	
	function getMultilanguageHomeUrl(){
		if(function_exists('icl_get_home_url')){
			return icl_get_home_url();
		}
		return '/';
	}
	
	function getLanguages($skip = ''){
		$skip = explode(',', $skip);
		$data = array();

		if(function_exists('icl_get_languages')){
			$langs = icl_get_languages('skip_missing=N&orderby=KEY&order=DIR&link_empty_to=str');
			foreach($langs as $lang){
				$data[] = array('label' => strtoupper($lang['language_code']), 'lang_key' => $lang['language_code'], 'name' => $lang['translated_name'], 'icon_url' => $lang['country_flag_url'], 'url' => $lang['url']);
			}
		}
		
		if(!count($data)){
			//get default
			$data[] = array('label' => strtoupper(substr(get_bloginfo ( 'language' ), 0, 2)), 'lang_key' => substr(get_bloginfo ( 'language' ), 0, 2), 'name' => strtoupper(substr(get_bloginfo ( 'language' ), 0, 2)), 'icon_url' => plugins_url().'/dpc/assets/img/'.substr(get_bloginfo ( 'language' ), 0, 2).'.jpg', 'url' => '');
		}
		return $data;
	}
	
	function getModulesIncSubmodules($skip = ''){
		$skip = explode(',', $skip);
		$data = array();
		foreach($this->dpc->moduleList as $moduleName => $subModules){
			if(strpos($moduleName,'_') === 0 || in_array($moduleName, array('dpc','suite'))){ continue; }
			foreach($subModules as $subModuleName){
				$moduleKey = $moduleName.'_'.$subModuleName;
				if(strpos($subModuleName,'_') === 0 || in_array($moduleKey, array())){ continue; }
				$data[] = array('key' => $moduleKey, 'label' => $this->dpc->moduleInstances[$moduleName]->moduleTitle . ': ' . $this->dpc->getText($this->dpc->moduleInstances[$moduleKey]->moduleTitle));
			}
		}
		return $data;
	}
	
	function getPages(){
		$data = array();
		$args = array(
			'sort_order' => 'ASC',
			'sort_column' => 'post_title',
			'post_type' => 'page',
			'post_status' => 'publish',
			'posts_per_page' => -1
		); 
		$pages = get_pages($args); 
		foreach($pages as $page){
			$data[] = array('name' => (!empty($page->post_title) ? $page->post_title : 'Post #'. $page->ID), 'label' => (!empty($page->post_title) ? $page->post_title : 'Post #'. $page->ID), 'value' => $page->ID);
		}
		return $data;
	}
	
	function getPosts(){
		$data = array();
		$args = array(
			'orderby'          => 'post_title',
			'order'            => 'ASC',
			'post_type'        => 'post',
			'post_status'      => 'publish',
			'suppress_filters' => true,
			'posts_per_page' => 100
		);
		$posts = get_posts($args); 
		foreach($posts as $post){
			$data[] = array('name' => (!empty($post->post_title) ? $post->post_title : 'Post #'. $post->ID), 'label' => (!empty($post->post_title) ? $post->post_title : 'Post #'. $post->ID), 'value' => $post->ID);
		}
		return $data;
	}
	
	function getPostCategories(){
		$data = array();
		$args = array(
			'orderby' 		=> 'name',
			'order' 		=> 'ASC',
			'type'			=> 'post',
			'hide_empty'	=> 0
		);
		$categories = get_categories( $args );
		foreach($categories as $category){
			$data[] = array('name' => $category->slug, 'label' => $category->name, 'value' => $category->slug);
		}
		return $data;
	}
	
	function getPostsForCpt($cpt){
		$data = array();
		$args = array(
			'orderby'          => 'post_title',
			'order'            => 'ASC',
			'post_type'        => $cpt,
			'post_status'      => 'publish',
			'suppress_filters' => true,
			'posts_per_page' => -1
		);
		$posts = get_posts($args); 

		foreach($posts as $post){
			$data[] = array('name' => $post->post_title, 'label' => $post->post_title, 'value' => $post->ID);
		}
		
		return $data;
	}
	
	function getUserGroups($skip = ''){
		global $wp_roles;
		$skip = explode(',', $skip);
		$data = array();
			
		foreach($wp_roles->roles as $k => $v){
			if(in_array($v['name'], $skip)){ continue; }
			$data[] = array('name' => $v['name'], 'label' => $v['name'], 'value' => $k);
		}
		return $data;
	}
	
	function getPurchaseStatus(){
		$data 		= array();
		$types 		= array('basic', 'professional', 'suite');
		$key		= $this->dpc->oLicense->getLicense();
		
		if(is_object($this->dpc->oLicense->details)){
			$expires = new DateTime($this->dpc->oLicense->details->expires);
		} else {
			$expires = '';
		}

		foreach($types as $type){
			switch($type){
				case 'basic':
					$data[] = array('label' => 'Basic', 'name' => 'basic', 'status' => 'active');
					break;
				case 'professional':
					$data[] = array('label' => 'Professional', 'name' => 'professional', 'status' => (isset($this->dpc->oLicense->products['professional']['status']) && $this->dpc->oLicense->products['professional']['status'] == 1 ? 'active' : 'inactive'), 'key' => $key, 'expires' => (is_object($expires) ? $expires->format('d.m.Y') : ''));
					break;
				case 'suite':
					$data[] = array('label' => 'Suite', 'name' => 'suite', 'status' => (isset($this->dpc->oLicense->products['suite']['status']) && $this->dpc->oLicense->products['suite']['status'] == 1 ? 'active' : 'inactive'), 'key' => $key, 'expires' => (is_object($expires) ? $expires->format('d.m.Y') : ''));
					break;	
			}	
		}
		return $data;
		
	}
	
	function object2array($obj) {
		if(is_object($obj)) $obj = (array) $obj;
		if(is_array($obj)) {
			$new = array();
			foreach($obj as $key => $val) {
				$new[$key] = $this->object2array($val);
			}
		} else {
			$new = $obj;
		}
		return $new; 
	}
	
	function getPostData($postId, $key, $isMeta = false){
		if($isMeta){
			return get_post_meta($postId, $key, true);
		}

		if(is_array($post = get_post($postId, ARRAY_A))){
			if(isset($post[$key])){
				return $post[$key];
			} else {
				return '';
			}
		}
	}
	
	function checkPrivacy(){
		$setting = get_settings('blog_public');
		$privacy = '';
		
		if($setting == 1){
			$privacy = 'index';
		}else if($setting == 0){
			$privacy = 'noindex';
		}
		return $privacy;
	}
	
}

?>