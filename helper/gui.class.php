<?php 

class DPC_Helper_Gui {
	
	var $dpc 				= null;
	var $module				= null;
	var $settings 			= null;
	var $defaults 			= null;
	var $field				= null;
	var $sectionAttributes 	= null;
	var $attributes 		= null;
	var $value 				= null;
	var $possibleValues		= null;
	var $childs				= null;
	var $isDraftLoop		= false;
	var $inLoop				= false;
	var $loopIndex			= 0;
	var $namespace			= array();
	var $namespaceLoopIndex	= array();
	var $vars				= array();
		
	function __construct(&$dpc){
		$this->dpc = $dpc;
	}
	
	function getInput($attributes){
		$this->attributes 	= $attributes;
		$this->field 		= $this->replaceXmlAttributes($this->field);
		$input = '';
		
		if((bool)$this->getAttr('hide', false)){
			return $this->getHide(true);
		}
		
		switch($this->getAttr('type')){
			case 'wrapper':
				$this->getWrapper();
				break;
			case 'section':
				$this->getSection();
				break;
			case 'collection':
				$this->getCollection();
				break;
			case 'tabs':
				$this->getTabs();
				break;
			case 'selectall':
				return $this->getSelectAll();
				break;
			case 'wizard':
				return $this->getWizard();
				break;
			case 'dpcLicense':
				$this->getLicense();
				break;
			case 'dpcOption':
				$this->getDpcOption();
				break;
			case 'var':
				$this->setVar($this->field);
				break;	
			case 'method':
				return $this->getMethod();
				break;
			case 'knob':
				return $this->getKnob();
				break;
			case 'donut':
				return $this->getDonut();
				break;
			case 'sharingDonut':
				return $this->getSharingDonut();
				break;
			case 'feed':
				return $this->getFeed();
				break;
			case 'moduleStateListing':
				return $this->getModuleStateListing();
				break;
			case 'moduleMessageIndicator':
				return $this->getModuleMessageIndicator();
				break;
			case 'each':
				$this->getEach();
				break;
			case 'heading':
				return $this->getHeading(); 
				break;
			case "modal":
				return $this->getModal();
				break;
			case 'image':
				return $this->getImage();
				break;
			//Table
			case 'table':
				return $this->getTable(); 
				break;
			case 'th':
				return $this->getTh(); 
				break;
			case 'td':
				return $this->getTd(); 
				break;
			case 'tr':
				return $this->getTr(); 
				break;
			case 'trStart':
				return $this->getTrStart();
				break;	
			case 'trEnd':
				return $this->getTrEnd();
				break;
			case 'thead':
				return $this->getThead();
				break;	
			case 'tbody':
				return $this->getTbody();
				break;	
			case 'tfoot':
				return $this->getTfoot();
				break;	
			case 'tdStart':
				return $this->getTdStart();
				break;	
			case 'tdEnd':
				return $this->getTdEnd();
				break;
			case 'trNext':
				return $this->getTrNext();
				break;
			// Table END
			case 'hidden':
				return $this->getHidden();
				break;
			case 'postAction':
				return $this->getPostAction();
				break;
			case 'button':
				return $this->getButton();
				break;
			case 'deleteButton':
				return $this->getDeleteButton();
				break;
			case 'toggleButton':
				return $this->getToggleButton();
				break;
			case 'hide':
				return $this->getHide();
				break;
			case 'text':
				return $this->getText();
				break;
			case 'spinner':
				return $this->getSpinner();
				break;
			case 'sortable':
				return $this->getSortable();
				break;
			case 'colorpicker':
				return $this->getColorpicker();
				break;
			case 'timepicker':
				return $this->getTimepicker();
				break;
			case 'copycode':
				return $this->getCopyCode();
				break;
			case 'checkbox':
				return $this->getCheckbox();
				break;
			case 'radio':
				return $this->getRadio();
				break;
			case 'multiRadio':
				return $this->getMultiRadio();
				break;
			case 'radioSwitch':
				return $this->getRadioSwitch();
				break;
			case 'select':
				return $this->getSelect();
				break;
			case 'selectImg':
				return $this->getSelectImg();
				break;
			case 'selectToggle':
				return $this->getSelectToggle();
				break;
			case 'textarea':
				return $this->getTextarea();
				break;
			case 'html':
				return $this->getHtml();
				break;
			case 'debug':
				return $this->debug();
				break;
			case 'mediaUploader':
				return $this->getMediaUploader();
				break;
			case 'file':
				return $this->getFile();
				break;
			case 'status':
				return $this->getStatus();
				break;
			case 'taglist':
				return $this->getTaglist();
				break;
			case 'htmlelement':
				return $this->getHtmlElements();
				break;
			case 'hinweis':
				return $this->getHinweis();
				break;
			case 'alert':
				return $this->getAlert();
				break;
			case 'paragraph':
				return $this->getParagraph();
				break;
			case 'icon':
				return $this->getIcon();
				break;
			case 'link':
				return $this->getLink();
				break;
			case 'info':
				return $this->getInfo();
				break;
			case 'if':
				return $this->getIf();
		}
		return $input;
	}

	function resetProperties(){
		$this->module	 	= null;
		$this->settings 	= null;
		$this->value 		= null;
		$this->attributes 	= null;
	}
	
	function getValuesBySource($field){
		$field 	= $this->replaceXmlAttributes($field);
		$values = array();
		
		if(isset($field['source'])){
			$sourceArray = explode(':', $field['source']);
			switch($sourceArray[0]){
				case '@method':
					$isModule 		= (count($sourceArray) == 3) ? true : false;
					$isSubModule 	= (count($sourceArray) == 4) ? true : false;
					
					if($isSubModule){
						$values = $this->dpc->triggerModuleMethod($sourceArray[1].'_'.$sourceArray[2], $sourceArray[3], strlen($field['sourceParams']) ? explode('|', $field['sourceParams']) : null);
					} elseif($isModule){
						$values = $this->dpc->triggerModuleMethod($sourceArray[1], $sourceArray[2], strlen($field['sourceParams']) ? explode('|', $field['sourceParams']) : null);
					} else {
						continue;
					}
					break;
				case '@function':
					if($this->dpc->oFunctions == null){
						require_once('functions.php');
						$this->dpc->oFunctions = new DPC_Functions($this->dpc);
					}
					if(is_object($this->dpc->oFunctions)){
						if(method_exists($this->dpc->oFunctions, $sourceArray[1])){
							$values = call_user_func_array(array($this->dpc->oFunctions, $sourceArray[1]), strlen($field['sourceParams']) ? (array)$field['sourceParams'] : array());
							#$values = call_user_method($sourceArray[1], $this->dpc->oFunctions, strlen($field['sourceParams']) ? explode('|', $field['sourceParams']) : null);
						}
					}
					break;
			}
		}

		return $values;
	}
	
	function setVar($field){
		$field 	= $this->replaceXmlAttributes($field);
		$values = array();

		if(isset($field['value'])){
			$sourceArray = explode(':', $field['value']);
			switch($sourceArray[0]){
				case '@method':
					$isModule 		= (count($sourceArray) == 3) ? true : false;
					$isSubModule 	= (count($sourceArray) == 4) ? true : false;

					if($isSubModule){
						$this->vars[(string)$field['key']] = $this->dpc->triggerModuleMethod($sourceArray[1].'_'.$sourceArray[2], $sourceArray[3], strlen($field['params']) ? explode('|', $field['params']) : null);
					} elseif($isModule){
						$this->vars[(string)$field['key']] = $this->dpc->triggerModuleMethod($sourceArray[1], $sourceArray[2], strlen($field['params']) ? explode('|', $field['params']) : null);
					} else {
						continue;
					}
					break;
				case '@function':
					if($this->dpc->oFunctions == null){
						require_once('functions.php');
						$this->dpc->oFunctions = new DPC_Functions($this->dpc);
					}
					if(is_object($this->dpc->oFunctions)){
						if(method_exists($this->dpc->oFunctions, $sourceArray[1])){
							$this->vars[(string)$field['key']] = call_user_func_array(array($this->dpc->oFunctions, $sourceArray[1]), strlen($field['params']) ? explode('|', $field['params']) : array());
						}
					}
					break;
			}
		}
	}
	
	function getValueRecursive($array, $parts = array()){
		if(count($parts)){
			$currentElement = array_shift($parts);
			if(isset($array[$currentElement])){
				if(is_array($array[$currentElement])){
					if(count($parts)){
						return $this->getValueRecursive($array[$currentElement], $parts);
					}
					return $array[$currentElement];
				} else {
					
					return $array[$currentElement];
				}
			}
		}
	}

	function getValue(){
		$realname = (string) $this->getAttr('realname');
		if(strlen($realname)){
			return get_option($realname);
		}

		$attributeName = (string)$this->attributes['name'];
		if(strpos($attributeName, '][') !== false){
			$this->value = $this->getValueRecursive($this->settings, explode('][', $attributeName));
		}

		if($this->inLoop != true){
			if(isset($this->settings[$attributeName])){
				return $this->settings[$attributeName];
			} elseif($this->getAttr('type') == "checkbox" && !count($this->settings)){
				return '';
			} else {
				return (!is_array($this->value) ? (string)$this->value : $this->value);
			}
		} elseif($this->isDraftLoop == false){
			if(isset($this->settings[(string)$this->sectionAttributes['name']][$this->loopIndex][$attributeName])){
				return $this->settings[(string)$this->sectionAttributes['name']][$this->loopIndex][$attributeName];
			} elseif($this->getAttr('type') == "checkbox" && isset($this->settings[(string)$this->sectionAttributes['name']])){
				return '';
			} else {
				return (!is_array($this->value) ? (string)$this->value : $this->value);
			}
		} else {
			return (!is_array($this->value) ? (string)$this->value : $this->value);
		}
	}

	function getAttr($key, $default = null){
		if(isset($this->attributes[$key])){
			return $this->attributes[$key];
		}
		if($default !== null){
			return $default;
		}
	}
	
	function getHtmlAttr($skip = array()){
		$htmlAttr = '';
		$attr = $this->attributes;
		if(isset($attr['addToDom'])){
			foreach(explode(',', $attr['addToDom']) as $useAttr){
				if(isset($attr[$useAttr]) && !in_array($useAttr, $skip)){ 
					$htmlAttr .= ' ' . $useAttr . '="' . $attr[$useAttr] .  '"';
				}
			}
		}
		return '' . $htmlAttr;
	}
	
	function getName($name = false, $realname = false){
		$name 		= ($name ? $name : $this->getAttr('name'));
		$realname 	= ($realname ? $realname : $this->getAttr('realname'));
		if($realname){
			return 'dpc[realnames][' . $realname . ']';
		}
		
		if($this->inLoop == true){
			return 'dpc[' . $this->module . '][' . $this->sectionAttributes['name'] . '][' . $this->loopIndex . '][' . $name . ']';
		} else {
			return 'dpc[' . $this->module . '][' . $name . ']';
		}
	}
	
	function getWrapper(){
		$this->initChilds();
		echo '<div'.($this->getAttr('id', false) ? ' id="'.$this->getAttr('id').'"' : '' ).' class="haswrap '.(strlen($this->getAttr('width')) ? 'col-md-'.$this->getAttr('width') : '').($this->getAttr('class', false) ? ' '.$this->getAttr('class') : '').'" '.$this->getAttr('data-toggle').' '.$this->getHtmlAttr().'>';
		if($this->childs !== null){
			$this->showFields($this->childs);
		}
		echo '</div>';
	}
	
	function getLicense(){
		if(is_object($this->dpc->oLicense->details)){
			$expires = new DateTime($this->dpc->oLicense->details->expires);
		} else {
			$expires = '';
		}
		
		echo '<div class="jumbotron dpc-license">
		 			<div class="row">';
		
		if(is_object($expires)){
			echo '		<div class="col-md-12"><h3>'.$this->dpc->getText('Active license').'</h3></div>
			 			<div class="col-md-7" id="">';
			 				if($this->dpc->oLicense->details->item_name == $this->dpc->oLicense->products['basic']['name'] || $this->dpc->oLicense->details->item_name == $this->dpc->oLicense->products['professional']['name']){
			 					echo '<p>'.$this->dpc->getText('Thank you for downloading <strong>%s</strong>. For best SEO results upgrade to Professional or Suite', $this->dpc->oLicense->details->item_name).'.</p>';
			 				}else{
			 					echo '<p>'.$this->dpc->getText('Your license key is valid for <strong>%s</strong> and expires on <strong>%s</strong>', $this->dpc->oLicense->details->item_name, $expires->format('d.m.Y')).'.</p>';
			 				}
							if($this->dpc->oLicense->upgrade == true){
							    echo 	'<p class="advice"><span class="hinweis"><i class="fa fa-info-circle"></i></span>
							    		'.$this->dpc->getText('You can upgrade to a higher version of this plugin to enable more features').'.
							    		 <a class="license" href="/wp-admin/update-core.php">'.$this->dpc->getText('Upgrade now').'!</a></p>
							    		<span>('.$this->dpc->getText('There may be a delay until the update appears').')</span>';
							}		
			echo 		'</div>';
		}

		echo ' 			<div class="col-md-5">
			 				<div class="row">
			 					<div class="col-md-8">
		 							<input type="text" class="form-control" name="dpcLicenseKey" value="'.$this->dpc->oLicense->license.'" id="licence-key" placeholder="Lizenz Key">
		 						</div>
								<div class="col-md-4">
		 							<button type="submit" class="btn btn-primary">'.(is_object($this->dpc->oLicense->details) && $this->dpc->oLicense->details->license == 'valid' ? $this->dpc->getText('Renew') : $this->dpc->getText('Unlock')).'</button>
		 						</div>
			 				</div>
			 			</div>
			 		</div>
		 		</div>';
	}
	
	function getDpcOption(){
		$this->initChilds();
		echo '<div '.($this->getAttr('id', false) ? ' id="'.$this->getAttr('id').'"' : '' ).' class="jumbotron dpc-option '.$this->getAttr('class').' '.$this->getAttr('name').' " '.$this->getHtmlAttr().'>';
		if($this->childs !== null){
			$this->showFields($this->childs);
		}
		echo '</div>';
	}
	
	function getMethod(){
		if(!$this->getAttr('module') || !$this->getAttr('function')){
			return false;
		}

		if(!is_null($params = $this->getAttr('params', null))){
			$params = explode(',', $params); 			
		}

		return $this->dpc->triggerModuleMethod((string)$this->getAttr('module'), (string)$this->getAttr('function'), $params);
	}

	function getDonut(){
		echo 	'<div class="chart-donut">
					<div id="donut"></div>
				</div>
				';
		echo '<script>
		jQuery(document).ready(function($) {
			Morris.Donut({
			  element: "donut",
			  data: [
			    {label: "'.$this->dpc->getText('Warnings').'", value: '.$this->dpc->log->count('warning').'},
			    {label: "'.$this->dpc->getText('Optimal').'", value: '.$this->dpc->log->getOptimus(true).'},
			    {label: "'.$this->dpc->getText('Errors').'", value: '.$this->dpc->log->count('error').'}
			  ],
			  resize: true,
			  colors: [
				"#EAB631",
				"#60B660",
				"#E44D42"
			   ],
			   backgroundColor: "#2F3033",
			   labelColor: "#efefef",
			   width: "140px"
			});
		});
	</script>';
	}

	function getSharingDonut(){
		$sharing = $this->dpc->getModuleInstance('professional_sharing');
		$networks = $sharing->getActiveNetworkCountByPost((int)$this->getAttr('id'));
		$input = 	'<div class="social-stats">
						<div class="social-stats-element">
							<h1>'.$this->getAttr('views').'</h1>
							<span class="social-title">'.$this->dpc->getText('Pageviews').'</span>
						</div>
						<div class="social-stats-element">
							<h1>'.$this->getAttr('average').'</h1>
							<span class="social-title">&#216; '.$this->dpc->getText('per day').'</span>
						</div>
						<div class="social-stats-element">
							<h1>'.$this->getAttr('shares').'</h1>
							<span class="social-title">'.$this->dpc->getText('Shares').'</span>
						</div>
					</div>';
					
		if($this->getAttr('shares') == '0'){
			$input .=	'<div class="social-empty state">
							<span>'.$this->dpc->getText('There are no shares available yet.').'</span>
						</div>';	
		}else{
			$input .=   '<div class="social-chart-donut" style="max-width:60%; float:right">
							<div id="donut"></div>
						</div>';
			
			$input .= 	'<script>
						jQuery(document).ready(function($) {
							Morris.Donut({
							  element: "donut",
							  data: [';
			foreach($networks as $network){
				$input .= '{label: "'.ucfirst($network['label']).'", value: '.$network['count'].'},';
			}
			$input .= 		 '],
						  	  resize: true,
						      colors: [';
			foreach($networks as $network){
				$input .= '"'.$network['color'].'",';
			}
			$input .=	 	'],
						     backgroundColor: "#fff",
						     labelColor: "#333",
						     width: "140px"
							});
						});
					</script>';	
		}
		return $input;
		
	}
	
	function getFeed(){
		return;
		
		/**
		 * Deactivated
		 */
		$lang		= defined('ICL_LANGUAGE_CODE') ? ICL_LANGUAGE_CODE : substr(get_locale(), 0, strpos(get_locale(), '_'));
		$rssfeed 	= ($lang == 'en' ? 'https://delucks.com/feed/' : 'https://delucks.com/'.$lang.'/feed/');

		
		if( !$xml = simplexml_load_file($rssfeed)) {
			echo $this->dpc->getText('No entries found') . '!';
			return false;
		}
		
		if(!isset($xml->channel[0]) || !property_exists($xml->channel, 'item')){
			echo $this->dpc->getText('No entries found') . '!';
			return false;
		}

		$out 	= array();
		$i 		= 3;
		 

		foreach($xml->channel[0]->item as $item) {
		    if( $i-- == 0 ) {
		        break;
		    }
		    $out[] = array(
		        'title'        => (string) $item->title,
		        'description'  => (string) $item->description,
		        'link'         => (string) $item->link,
		        'date'         => date('d.m.Y H:i', strtotime((string) $item->pubDate))
		    );
		}
		
		
		$item = '<ul class="blog-items bold-items">';
		foreach ($out as $value) {
			
			$item .= '<li class="blog-item col-sm-12 post type-post status-publish format-standard">';
			$item .= '	<div class="bold-item-wrap">';
			$item .= '		<h1 itemprop="name headline">
								<a target="_blank" href="'.$value['link'].'">'.$value['title'].'</a>
							</h1>';		
			$item .= '		<div class="blog-item-details">
								<time class="date">'.$value['date'].'</time>
							</div>';
			$item .= '	</div>
					  </li>';
		}
		$item .= '	<li style="float: left; width: 100%; text-align: center; padding: 15px 0px;">
						<div>
							<a href="'.($lang == 'en' ? 'https://delucks.com/google-seo-blog/' : 'https://delucks.com/'.$lang.'/google-seo-blog/').'" target="_blank" class="btn btn-default"> <i class="fa fa-arrow-right"></i> '.$this->dpc->getText('Show all news').'</a>
						</div>
					</li>';
		$item .= '</ul>';
		return $item;
	}
	
	function getModuleStateListing(){
		$modulesArray = array(	'basic' => array(
									'basic_metadata'	=> array('status' => ($this->dpc->moduleIsActive('basic_metadata') ? 'active' : 'inactive'), 'label' => 'Metadata', 'helptext' => 'Please activate the (invisible) metadata with all recommended settings to push your website for ideal search results.'),
									'basic_sitemaps'	=> array('status' => ($this->dpc->moduleIsActive('basic_sitemaps') ? 'active' : 'inactive'), 'label' => 'Sitemaps', 'helptext' => 'Activate the sitemaps with all the recommended settings and submit the sitemaps to Google and Bing so that the search engines can detect all content and prioritize it correctly.'),
									'basic_statistics'	=> array('status' => ($this->dpc->moduleIsActive('basic_statistics') ? 'active' : 'inactive'), 'label' => 'Statistics', 'helptext' => 'Activate statistics to see the current website access.'),
									'basic_textopt'		=> array('status' => ($this->dpc->moduleIsActive('basic_textopt') ? 'active' : 'inactive'), 'label' => 'Text optimization', 'helptext' => 'Activate the Text Optimization to see a keyword field in your editor. There, you get recommendations while filling in your focus keyword.'),
									'basic_urls'		=> array('status' => ($this->dpc->moduleIsActive('basic_urls') ? 'active' : 'inactive'), 'label' => 'URL optimization', 'helptext' => 'Activate the url optimization to remove stopwords from your urls. Redirect visitors from dead links and ensure a secure connection.'),
							), 
								'professional' => array(
									'professional_breadcrumbs' 		=> array('status' => ($this->dpc->moduleIsActive('professional_breadcrumbs') && $this->dpc->oLicense->products['professional']['status'] == 1 ? 'active' : 'inactive'), 'label' => 'Breadcrumbs', 'helptext' => 'Activate and embed breadcrumbs to help your visitors to find their way back to the home page of your website.'),
									'professional_externallinks'	=> array('status' => ($this->dpc->moduleIsActive('professional_externallinks') && $this->dpc->oLicense->products['professional']['status'] == 1 ? 'active' : 'inactive'), 'label' => 'External links', 'helptext' => 'Activate the link management module, to set up standard rules about how to treat external links in connection to your whole website.'),
									'professional_images' 			=> array('status' => ($this->dpc->moduleIsActive('professional_images') && $this->dpc->oLicense->products['professional']['status'] == 1 ? 'active' : 'inactive'), 'label' => 'Image optimization', 'helptext' => 'Activate the image optimization module to reduce the loading time of your website and lower your risk to infringe a copyright.'),
									'professional_microdata'		=> array('status' => ($this->dpc->moduleIsActive('professional_microdata') && $this->dpc->oLicense->products['professional']['status'] == 1 ? 'active' : 'inactive'), 'label' => 'Microdata', 'helptext' => 'With activated microdata you support Google, Facebook etc. to match your websites information easier.'),
									'professional_rating'			=> array('status' => ($this->dpc->moduleIsActive('professional_rating') && $this->dpc->oLicense->products['professional']['status'] == 1 ? 'active' : 'inactive'), 'label' => 'Rating', 'helptext' => 'Let your visitors rate and review your website’s contents and increase the possibility to appear in search results with the highlighted star ratings.'),
									'professional_sharing'			=> array('status' => ($this->dpc->moduleIsActive('professional_sharing') && $this->dpc->oLicense->products['professional']['status'] == 1 ? 'active' : 'inactive'), 'label' => 'Social sharing', 'helptext' => 'Make social sharing easier for your visitors. First you feed search engines and second you see how relevant your contents are.')
							));
		
		$modules 	= $modulesArray[(string)$this->getAttr('module')];
		$numTotal 	= count($modules);
		$numActive 	= 0;
		foreach($modules as $key) {
		    if ($key['status'] == 'active') 
		        $numActive++;          
		}
		$numPercent = (string)($numActive / $numTotal)*100;
		$input = 	'<div class="chart-knob">
						<input class="knob" readonly="readonly" value="'.$numPercent.'" data-fgColor="#60b660" data-bgColor="#e44d42" data-anglearc="250" data-angleoffset="-125" data-height="140" data-width="140" data-thickness="0.2" data-displayinput="false" data-animate="true">
						<h5><span style="margin-left: -26px;">'.$numActive.'/'.count($modules).'</span> '.$this->dpc->getText('modules are active').'</h5>
					 </div>
					';
		
		$input .= 	'<div class="module-list">';
		foreach($modules as $k => $v){			
			$input .= 		'<div class="single-module '.$v['status'].'">
								<span>'.$this->dpc->getText($v['label']).'</span>
								<span class="tooltip-toggle" data-toggle="tooltip" data-placement="right" data-original-title="'.$this->dpc->getText($v['helptext']).'"><i class="fa fa-info-circle"></i></span>
							</div>';				
		}	
		
		$input .=	'</div>';
		$input .= 	'<script>jQuery(function($){ $(".knob").knob(); }); </script>';
		return $input;
	}
	
	function getModuleMessageIndicator(){
		$totalMessages 	= (string)$this->dpc->log->count('error')+(string)$this->dpc->log->count('warning')+(string)$this->dpc->log->count('optimus');
		
		$input  = 	'<div class="module-indicator-list">';
		$input .= 		'<span class="single-indicator error">
							<p><span class="errors_count_total">'.$this->dpc->log->count('error').'</span> '.$this->dpc->getText('Errors').' (<span class="errors_count_new">'.$this->dpc->log->count('error', 0).'</span> '.$this->dpc->getText('new').')</span></p>
						</span>';
		$input .= 		'<span class="single-indicator warning">
							<p><span class="warnings_count_total">'.$this->dpc->log->count('warning').'</span> '.$this->dpc->getText('Warnings').' (<span class="warnings_count_new">'.$this->dpc->log->count('warning', 0).'</span> '.$this->dpc->getText('new').')</span></p>
						</span>';
		$input .= 		'<span class="single-indicator good">
							<p><span class="optimus_count_total">'.$this->dpc->log->getOptimus(true).'</span> '.$this->dpc->getText('Optimal').'</p>
						</span>';
		$input .=	'</div>';
	    $input .=	'<div class="module-indicator-total">
						<span>&sum; '.$totalMessages.' '.$this->dpc->getText('messages').'</span>
					</div>';

		return $input;
	}
	
	function getIf(){
		$this->initChilds();
		if($this->childs !== null){
			$success	= false;
			$condition	= (string)trim($this->getAttr('condition'));
			$operator	= (string)trim($this->getAttr('operator'));
			$value		= (string)trim($this->getAttr('value'));
			if(strlen($operator)){
				switch($operator){
					case '==':
						if($condition == $value){
							$success = true;
						}
						break;
					case '!=':
						if($condition != $value){
							$success = true;
						}
						break;
				}
			}
			
			if($success == true){
				$this->showFields($this->childs);
			}
		}
	}
	
	function getCollection(){
		$this->initChilds();
		echo '<div class="collection'.($this->getAttr('class', false) ? ' '.$this->getAttr('class') : '').'" '.$this->getHtmlAttr().'>';
		
		$newChilds = array(); 
		if($this->childs !== null){
			$ci = 0;
			
			if($this->getValue()){
				foreach($this->childs as $child){
					$vi = 0;
					foreach($this->getValue() as $vk => $vv){
						if(strpos($child['name'], $vk) !== false){
							$newChilds[$vi] = $child;
							$vi++;
							break;
						}
						$vi++;
					}
					$ci++;
				}
	
				ksort($newChilds);
				$this->showFields($newChilds);
			} else {
				$this->showFields($this->childs);
			}
		}
		echo '</div>';
	}
	
	function getSection($section = '', $file = false){
		$section = (strlen($section) ? $section : (string)$this->getAttr('section'));

		if(!$file){
			if($this->getAttr('file', false)){
				$file = DPC_PLUGIN_MODULES_DIR . (string)$this->getAttr('file');
			}
		}

		if(!strlen($section)){
			return '';
		}
		$this->dpc->parseSettingsByXml(($file ? $file : $this->dpc->lastSettingsFile), $section, $this->getAttr('inEach', false), ($this->getAttr('skipWrapper', false) ? true : false));
	}
	
	function getTabs(){
		$this->initChilds();
		if($this->childs !== null){
			echo '<ul class="nav nav-tabs dpc-tabs" role="tablist" id="tab_'.$this->module.'">';
			$i = 0;
			foreach($this->childs as $tab){
				echo '<li '.($i == 0 ? 'class="active"' : '').'>';
				echo '	<a href="#tab-'. $this->module .'_'.str_replace(array(' '), array('_'), $tab['title']).'" role="tab" data-toggle="tab">'.$tab['title'].'</a>';
				echo '</li>';
			$i++;
			}
			echo '</ul>';
			
			echo '<div class="tab-content">';
			$i = 0;
			foreach($this->childs as $tab){
				echo '<div class="tab-pane '.($i == 0 ? 'active' : '').'" id="tab-'. $this->module .'_'.str_replace(array(' '), array('_'), $tab['title']).'">';
				$this->showFields($tab->children());
				echo '</div>';
				$i++;
			}
			echo '</div>';
		}
	}
	
	function getSelectAll(){
		$output  = '<button id="'.$this->getAttr('id').'" class="btn '.$this->getAttr('btn-type').' btn-select-all" data-selector="'.$this->getAttr('selector').'" '.$this->getHtmlAttr('class,id').' data-unclicked="'.$this->getAttr('unclicked').'" data-clicked="'.$this->getAttr('clicked').'">'.$this->getAttr('unclicked').'</button>';
		$output .= '<script type="text/javascript">
					jQuery(document).ready(function($) {
						var checkAll 	= $("#'.$this->getAttr('id').'.btn-select-all"),
							checkboxes 	= checkAll.parents().closest("#'.$this->getAttr('selector').'").find(".icheck-checkbox");
							
						checkAll.on("click", function(ev){
							ev.preventDefault();
							
					        if ($(this).hasClass("clicked")) {
					            checkboxes.iCheck("uncheck");
								$(this).html($(this).data("unclicked")).removeClass("clicked");
					        }else{
					            checkboxes.iCheck("check");
								$(this).html($(this).data("clicked")).addClass("clicked");
					        }							
						});
						
						checkboxes.on("ifChanged", function(event){
					        if(checkboxes.filter(":checked").length == checkboxes.length) {
					           	checkAll.html(checkAll.data("clicked")).addClass("clicked");
					        } else {
					            checkAll.html(checkAll.data("unclicked")).removeClass("clicked");
					        }
					    });
					});
					</script>';
					
		return $output;
	}
	
	function getWizard(){
		$this->initChilds();
		if($this->childs !== null){
			
			echo '<div class="form-horizontal form-wizard" id="rootwizard">';
				echo '<div class="steps-progress"> <div class="progress-indicator"></div> </div>';
				
				echo '<ul>';
				$i = 0;
				foreach($this->childs as $step){
					echo '<li '.($i == 0 ? 'class="completed active"' : '').'>';
					echo '	<a href="#tab-'. $this->module .'_'.str_replace(array(' '), array('_'), $step['title']).'" role="tab" data-toggle="tab"><span>'.($i + 1).'</span>'.$step['title'].'</a>';
					echo '</li>';
				$i++;
				}
				echo '</ul>';
				
				echo '<div class="tab-content">';
				$i = 0;
				foreach($this->childs as $step){
					echo '<div class="tab-pane '.($i == 0 ? 'active' : '').'" id="tab-'. $this->module .'_'.str_replace(array(' '), array('_'), $step['title']).'">';
					if(isset($step['section'])){
						$this->getSection($step['section']);
					} else {
						$this->showFields($step->children());
					}
					echo '</div>';
					$i++;
				} 
				echo '<div class="dl-wizard-footer">';
					echo '<div class="alert alert-warning migrate-error" role="alert" style="display:none;width:100%;"></div><div class="clear"></div>';
					echo '<div class="pull-left"> <div class="btn btn-default dl-previous disabled"><i class="fa fa-chevron-left"></i> '.$this->dpc->getText('Back').'</div> </div>';
					echo '<div class="pull-right"> <div class="btn btn-primary dl-next">'.$this->dpc->getText('Next').' <i class="fa fa-chevron-right"></i></div> </div>';
					echo '<div class="pull-right"> <div class="btn btn-success dl-finish disabled" style="display:none;"><i class="fa fa-check"></i> '.$this->dpc->getText('Finish').'</div> </div>';
					echo '<div class="alert alert-warning wizard-warning double-opt" role="alert" style="display:none;"><div class="row"> </div></div>';
				echo '</div>';	
				echo '</div>';
			echo '</div>';
		}
	}

	function replaceXmlAttributes($xmlObject, $data = array(), $type = false){
		if($type){
			if(method_exists($xmlObject->{$type}, 'count')){
				for($i=0; $i<$xmlObject->{$type}->count(); $i++){
					foreach($xmlObject->{$type}[$i]->attributes() as $ak => $av){
						if(preg_match_all('/\{(@LANG|@TEXT):(.*)\}/Ui', $av, $matches)){
							$xmlObject[$ak] = (string)str_replace($matches[0][0], $this->dpc->getText($matches[2][0]), $av);
						} elseif(preg_match_all('/\{@VAR:(.*)\}/Ui', $av, $matches)){
							$parts 		= explode('|', $matches[1][0]);
							if(count($parts) && isset($this->vars[$parts[0]])){
								$xmlObject[$ak] = (string)str_replace($matches[0][0], $this->vars[$parts[0]], $av);
							}
						} elseif (preg_match_all('/\{@NS:(.*)\}/Ui', $av, $matches)){
							$parts 		= explode('|', $matches[1][0]);
							$namespace 	= array_shift($parts);
							$key	 	= array_shift($parts);
							if(isset($this->namespace[$namespace]) && isset($this->namespace[$namespace][$this->namespaceLoopIndex[$namespace]])){
								$xmlObject[$ak] = (string)str_replace($matches[0][0], $this->namespace[$namespace][$this->namespaceLoopIndex[$namespace]][$key], $av);
							}
						} elseif (preg_match_all('/\{(.*)\}/U', $av, $matches)){
							foreach($matches[1] as $mk => $mv){
								if(key_exists($mv, $data)){
									$string		=	(string)$xmlObject->{$type}[$i]->attributes()->$ak;
									$search		=	(string)$matches[0][$mk];
									$replace	=	(string)$data[$mv];
									$newString	=	(string)str_replace($search, $replace, $string);
									$xmlObject->{$type}[$i][$ak] = $newString;
								}
							}
						}
					}
				}
			}
		} else {
			foreach($xmlObject->attributes() as $ak => $av){
				if(preg_match_all('/\{(@LANG|@TEXT):(.*)\}/Ui', $av, $matches)){
					$xmlObject[$ak] = (string)str_replace($matches[0][0], $this->dpc->getText($matches[2][0]), $av);
				} elseif(preg_match_all('/\{@VAR:(.*)\}/Ui', $av, $matches)){
					$parts 		= explode('|', $matches[1][0]);
					if(count($parts) && isset($this->vars[$parts[0]])){
						$xmlObject[$ak] = (string)str_replace($matches[0][0], $this->vars[$parts[0]], $av);
					}
				} elseif (preg_match_all('/\{@NS:(.*)\}/Ui', $av, $matches)){
					$parts 		= explode('|', $matches[1][0]);
					$namespace 	= array_shift($parts);
					$key	 	= array_shift($parts);
					if(isset($this->namespace[$namespace]) && isset($this->namespace[$namespace][$this->namespaceLoopIndex[$namespace]])){
						$xmlObject[$ak] = (string)str_replace($matches[0][0], (isset($this->namespace[$namespace][$this->namespaceLoopIndex[$namespace]][$key]) ? $this->namespace[$namespace][$this->namespaceLoopIndex[$namespace]][$key] : ''), $av);
					}
				} elseif(preg_match_all('/\{(.*)\}/U', $av, $matches)){
					foreach($matches[1] as $mk => $mv){
						if(key_exists($mv, $data)){
							$string		=	(string)$xmlObject->attributes()->$ak;
							$search		=	(string)$matches[0][$mk];
							$replace	=	(string)$data[$mv];
							$newString	=	(string)str_replace($search, $replace, $string);
							$xmlObject[$ak] = $newString;
						}
					}
				}
			}
		}
		return $xmlObject;
	}

	function getEach(){
		$this->initChilds();
		$loopFields = $this->childs;
		$source 	= $this->getValuesBySource($this->field);

		$namespace	= false;
		if($this->getAttr('namespace', false) !== false){
			$namespace = (string)$this->getAttr('namespace');
			$this->namespace[$namespace] = $source;
		}	
		if($loopFields !== null && count($source)){
			if(is_array($source)){
				foreach($source as $sk => $sv){
					if($namespace !== false){
						$this->namespaceLoopIndex[$namespace] = $sk;
					}				
					$childFields = new SimpleXMLElement($loopFields->asXML());
					$childFields = $this->replaceXmlAttributes($childFields, $sv, 'option');
					$this->showFields($childFields);
				}
			}
		}
	}
	
	function getStatus(){
		/**
		 * Multiselect
		 */
		wp_enqueue_script('dpc-bootstrap-select', plugins_url( 'assets/select2/select2.js', DPC_FILE), array('jquery'));
		wp_enqueue_style('dpc-bootstrap-select', plugins_url( 'assets/select2/select2.css', DPC_FILE));
		wp_enqueue_script('dpc-bootstrap-checkbox', plugins_url( 'assets/bootstrap-multiselect/js/bootstrap-multiselect.js', DPC_FILE), array('jquery'));
		wp_enqueue_style('dpc-bootstrap-checkbox', plugins_url( 'assets/bootstrap-multiselect/css/bootstrap-multiselect.css', DPC_FILE));
				
		$input 	= '<span id="anchor-dpc-'.str_replace('_', '-', $this->module).'" class=""></span>';
		$input .= '<div class="row status '.($this->attributes['allowdisable'] == "false" ? 'dpc-visible' : '').'" data-status="'.(($this->dpc->moduleIsActive($this->module) && get_user_meta(get_current_user_id(), 'dpc_toggle_state_'.$this->module, true)) || $this->attributes['allowdisable'] == "false" ? 'active' : 'inactive').'">';
			$input .= '<div class="col-md-6 col-sm-6 col-xs-6">';
				$input .= '	<h2 class="module-title toggle-section '.(($this->dpc->moduleIsActive($this->module) && get_user_meta(get_current_user_id(), 'dpc_toggle_state_'.$this->module, true)) ? 'toggle-hide' : 'toggle-show').'" data-module="'.$this->module.'">' .$this->getAttr('title'). '</h2>';
				if(isset($this->attributes['description'])){
					$input .= '<div class="status description">';
						$input .= '<span class="description-intro">' .$this->attributes['description-intro']. ' </span>';
						$input .= '<span name="description-'.$this->getName().'" class="description-text">' .$this->attributes['description']. '</span>';
						$input .= '<span name="more-'.$this->getName().'" class="more" data-text-active="'.$this->dpc->getText('less').'" data-text-inactive="'.$this->dpc->getText('more').'">'.$this->dpc->getText('more').' <i class="fa fa-chevron-right" style="display: none;"></i></span>';
					$input .= '</div>';
				}
			$input .= '</div><div class="col-md-6 col-sm-6 col-xs-6 text-right">';
				$input .= '<span name="popover-'.$this->getName().'" class="btn btn-link help" data-toggle="popover" title="'.$this->dpc->getText('Help for').' '.$this->getAttr('title').'" data-content="'.$this->attributes['helptext'].'" data-placement="bottom"> <i class="fa fa-question-circle"></i></span>';
				if(isset($this->attributes['help-url-'.$this->dpc->oFunctions->getUserLang()])){
					$input .= '<a class="dpc-help-url" href="'.$this->attributes['help-url-'.$this->dpc->oFunctions->getUserLang()].'" target="_blank"><i class="fa fa-youtube-play"></i> <span> '.$this->dpc->getText('Tutorial').'</span></a>';
				}
				
				if((is_object($this->defaults) || is_array($this->defaults)) && count($this->defaults)){
					$input .=  '<button class="btn btn-info install-defaults" name="dpc[install_defaults]['.$this->module.']" value="'.$this->dpc->lastSettingsFile.'" data-module="'.$this->module.'" data-module_status="'.($this->dpc->moduleIsActive($this->module) ? '1' : '0').'">'.$this->dpc->getText('Install defaults').'</button>';
				}
				
				if($this->attributes['allowdisable'] != "false"){
					$input  .= '<select id="'.$this->getName().'" name="'.$this->getName().'">';
					
					if(is_array($this->possibleValues)){
						foreach($this->possibleValues as $val){
							$selected = false;
							if($this->getAttr('multiple') == 'multiple'){
								$selected = (in_array($val['value'], $this->getValue()) ? true : false);
							} else {
								$selected = ($val['value'] == $this->getValue() ? true : false);
							}
							$input .= '<option value="'.$val['value'].'"'.($selected ? ' selected="selected"' : '').'>'.$val['label'].'</option>';
						}
					}
					$input .= '</select>';	
				}else{
					$input  .= '<select id="'.$this->getName().'" name="'.$this->getName().'" style="display: none;">';
					$input  .= '<option selected="selected" value="1">'.$this->dpc->getText('Activated').'</option>';
					$input  .= '</select>';
				}
				
				$input .= '<button name="toggle-'.$this->getName().'" type="button" class="btn btn-default btn-sm fa toggle-section '.(($this->dpc->moduleIsActive($this->module) && get_user_meta(get_current_user_id(), 'dpc_toggle_state_'.$this->module, true)) || $this->attributes['allowdisable'] == "false" ? 'toggle-hide' : 'toggle-show').'" data-module="'.$this->module.'"></button>';
			$input .= '</div>';
		$input .= '</div>';
		$input .= 	'<script type="text/javascript">
					jQuery(document).ready(function($) {
						$(\'[name^="popover-'.$this->getName().'"]\').popover();';
		if($this->attributes['allowdisable'] != "false"){				
			$input .=	'	$(\'[name^="'.$this->getName().'"]\').multiselect({ buttonClass: \'btn btn-sm btn-blue\' });';
		}				
		$input .=	'	$(\'[name^="more-'.$this->getName().'"]\').click(function(){
							$(\'[name^="description-'.$this->getName().'"]\').toggleClass("active");
							$(this).toggleClass("active");
							if($(this).hasClass("active")){
								$(this).text($(this).data("text-active"));
							} else {
								$(this).text($(this).data("text-inactive"));
							}
						}); 
					});
					</script>';
		
		return $input;
	}
	
	
	function sectionStart($class = ''){
		if($this->sectionAttributes['hasWrap'] != 'yes'){
			return '<div class="'.($this->sectionAttributes['several'] == 'yes' ? '' : 'row').'" '.($this->sectionAttributes['hide'] == 'true' ? ' style="display:none"' : '').'><div class="'.($this->sectionAttributes['several'] == 'yes' ? '' : 'col-md-12').' dpc-section '.$this->module . ' ' . $this->sectionAttributes['name'].' ' . $class .' '. $this->sectionAttributes['class'].'" data-toggle="'. $this->sectionAttributes['data-toggle'].'" '.$this->getHtmlAttr().'>';
		}else{
			return '<div class="row dpc-section '.$this->module . ' ' . $this->sectionAttributes['name'].' ' . $class .' '. $this->sectionAttributes['class'].'" data-toggle="'. $this->sectionAttributes['data-toggle'].'" '.$this->getHtmlAttr().'>';
		}
	
	}

	function sectionClose(){
		if($this->sectionAttributes['hasWrap'] != 'yes'){
			return '</div></div>';
		}else{
			return '</div>';
		}
	}
	 
	function formButtons(){
		return '<button type="submit" class="dpc-submit btn btn-primary"><i class="fa fa-floppy-o"></i></button> <input type="button" class="dpc-submit btn btn-primary" value="'.$this->dpc->getText('Save all').'" />';
	}
	
	function formStart($name='', $upload = false){
		return '<div class="row"><div class="col-md-12"><form method="post"'.(strlen($name) ? ' name="'.$name.'"' : '').($upload ? ' enctype="multipart/form-data"' : '').'><input type="hidden" name="dpc_save_settings" />'; 
	}
	
	function formClose(){
		return '</form></div></div>';
	}
	
	function topMenu(){
		echo '<div id="nav" role="navigation" class="navbar navbar-default navbar-fixed-top">';
		echo '	<div class="container">';
		echo '		<div class="navbar-header">
		          		<button data-target=".navbar-collapse" data-toggle="collapse" class="navbar-toggle" type="button">
			            	<span class="sr-only">Toggle navigation</span>
				            <span class="icon-bar"></span>
				            <span class="icon-bar"></span>
				            <span class="icon-bar"></span>
		          		</button>
		          		<button type="submit" class="dpc-submit btn btn-primary nav-submit-xs"><i class="fa fa-floppy-o"></i>  '.$this->dpc->getText('Save all').'</button>
		       		 </div>';									
		echo '		<div class="navbar-collapse collapse">';
		echo '			<ul class="nav navbar-nav">';
		echo '				<li class="dropdown head">';
								foreach($this->dpc->moduleInstances as $module){
									if($module->isSubmodule !== true){
										echo '<a data-toggle="dropdown" class="dropdown-toggle '.($_GET['page'] == $module->optionsHook ? ' active' : 'hidden').'" href="#">'.$module->moduleTitle.' <span class="caret"></span></a>';
									}
								}
		echo '					<ul role="menu" class="dropdown-menu">';
								foreach($this->dpc->moduleInstances as $module){
									if($module->isSubmodule !== true){
										echo '<li '.($_GET['page'] == $module->optionsHook ? ' class="active"' : '').'><a href="?page='.$module->optionsHook.'">'.$module->moduleTitle.'</a></li>';
									}
								}
		echo '					</ul>';
		echo '				</li>';
							foreach($this->dpc->moduleInstances as $module){
								if($module->isSubmodule == true && strpos($module->optionsHook, $_GET['page']) === 0){
									echo '<li><a href="#" class="menu-anchor" data-scroll="anchor-'.$module->optionsHook.'">'.$module->moduleTitle.'</a></li>';
								}
							}     
		echo '			</ul>';
		echo '			<ul class="nav navbar-nav navbar-right">';
		echo '				<li>'.$this->formButtons().'</li>';
		echo '			</ul>';
		echo '		</div>';
		echo '	</div>';
		echo '</div>';
		echo '<div class="space-top-50"></div>';
		
		if(!empty($this->dpc->messages)){
			echo '<div class="dpc-messages">';
			foreach($this->dpc->messages as $msg){
				echo '<div class="alert alert-'.($msg['type'] != 'error' ? 'success' : 'danger').'" role="alert">'.$msg['text'] .'</div>';
			}
			echo '</div>';
		}
		
	}
	
	function topMenuSuite(){
		echo '<div role="navigation" class="navbar navbar-default navbar-fixed-top">';
		echo '	<div class="container">';
		echo '		<div class="navbar-header">
		          		<button data-target=".navbar-collapse" data-toggle="collapse" class="navbar-toggle" type="button">
			            	<span class="sr-only">Toggle navigation</span>
				            <span class="icon-bar"></span>
				            <span class="icon-bar"></span>
				            <span class="icon-bar"></span>
		          		</button>
		       		 </div>';									
		echo '		<div class="navbar-collapse collapse">';
		echo '			<ul class="nav navbar-nav dpc_messages" data-currentview="'.(isset($_REQUEST['type']) && strlen($_REQUEST['type']) ? $_REQUEST['type'] : 'errors').'">';
		echo '				<li class="dropdown head">';
								foreach($this->dpc->moduleInstances as $module){
									if($module->isSubmodule !== true){
										echo '<a data-toggle="dropdown" class="dropdown-toggle '.($_GET['page'] == $module->optionsHook ? ' active' : 'hidden').'" href="#">'.$module->moduleTitle.' <span class="caret"></span></a>';
									}
								}
		echo '					<ul role="menu" class="dropdown-menu">';
									foreach($this->dpc->moduleInstances as $module){
										if($module->isSubmodule !== true){
											echo '<li '.($_GET['page'] == $module->optionsHook ? ' class="active"' : '').'><a href="?page='.$module->optionsHook.'">'.$module->moduleTitle.'</a></li>';
										}
									}
		echo '					</ul>';  
		echo '				</li>
							<li><a href="?page=dpc-suite&type=errors" class="error"><i class="light-ico error"></i><span class="errors_count_total">'.$this->dpc->log->count('error').'</span> '.$this->dpc->getText('Errors').' (<span class="errors_count_new">'.$this->dpc->log->count('error', 0).'</span> '.$this->dpc->getText('new').')</span></a></li>
							<li><a href="?page=dpc-suite&type=warnings" class="warning"><i class="light-ico warning"></i><span class="warnings_count_total">'.$this->dpc->log->count('warning').'</span> '.$this->dpc->getText('Warnings').' (<span class="warnings_count_new">'.$this->dpc->log->count('warning', 0).'</span> '.$this->dpc->getText('new').')</span></a></li>
							<li><a href="?page=dpc-suite&type=optimus" class="good"><i class="light-ico good"></i><span class="optimus_count_total">'.$this->dpc->log->getOptimus(true).'</span> '.$this->dpc->getText('Optimal').'</a></li>';
		echo '			</ul>';
		echo '			<ul class="nav navbar-nav navbar-right"><li><button class="dpc-suite-analyse btn btn-primary"><i class="fa fa-refresh"></i> '.$this->dpc->getText('Perform analysis').'</button></li></ul>';
		echo '		</div>';
		echo '	</div>';
		echo '</div>';
		echo '<div class="space-top-110"></div>';
	}
	
	function getTooltip(){
		if(strlen($this->getAttr('tooltip-content'))){
			return ' <span class="tooltip-toggle" data-toggle="tooltip" data-placement="right" data-original-title="'.$this->getAttr('tooltip-content').'"><i class="fa fa-question-circle"></i></span>';
		}
		return '';
	}
	
	function getHeading(){
		$input  = '<h'.$this->getAttr('size').' '.$this->getHtmlAttr().'>'.$this->getValue();
		$input .= $this->getTooltip();
		$input .= '</h'.$this->getAttr('size').'>'; 
		
		return $input;
	}
	
	function getTable(){
		$this->initChilds();
		$rows	= $this->getAttr('rows');
	
		if($this->childs !== null){
			echo '<table class="haswrap '.(strlen($this->getAttr('width')) ? 'col-md-'.$this->getAttr('width') : '').' '.$this->getAttr('class').'" '.$this->getAttr('data-toggle').' '.$this->getHtmlAttr().'>';
			$this->showFields($this->field->children());
			echo '</table>';
		}
	}
	
	function getTr(){
		if($this->childs !== null){
			echo '<tr '.$this->getHtmlAttr().'>';
			$this->showFields($this->field->children());
			echo '</tr>';
		}
	}
	
	function getTd(){
		echo '<td '.$this->getHtmlAttr().'>';
		echo $this->getAttr('label');
		$this->showFields($this->field->children());
		echo '</td>';
	}
	
	function getThead(){
		if($this->childs !== null){
			echo '<thead '.$this->getHtmlAttr().'>';
			$this->showFields($this->field->children());
			echo '</thead>';
		}
	}
	
	function getTbody(){
		if($this->childs !== null){
			echo '<tbody '.$this->getHtmlAttr().'>';
			$this->showFields($this->field->children());
			echo '</tbody>';
		}
	}

	function getTfoot(){
		if($this->childs !== null){
			echo '<tfoot '.$this->getHtmlAttr().'>';
			$this->showFields($this->field->children());
			echo '</tfoot>';
		}
	}


	function getTrStart(){
		echo '<tr '.$this->getHtmlAttr().'>';
	}
	
	function getTrEnd(){
		echo '</tr>';
	}
	
	function getTrNext(){
		echo '</tr><tr '.$this->getHtmlAttr().'>';
	}
	
	function getTdStart(){
		echo '<td '.$this->getHtmlAttr().'>';
	}
	
	function getTdEnd(){
		echo '</td>';
	}
	
	function getTh(){
		echo '<th '.$this->getHtmlAttr().'>';
		echo $this->getAttr('label');
		echo '</th>';
	}
	
	function getHidden(){
		return '<input type="hidden" name="'.$this->getName().'" value="'.$this->value.'" '.$this->getHtmlAttr().'/>';
	}
	
	function getPostAction(){
		return '<input type="hidden" name="dpcActions['.$this->getAttr('module').']" value="'.$this->getAttr('action').'" />';
	}
	
	function getButton(){
		return '<button name="'.$this->getName().'" value="'.$this->value.'" '.$this->getHtmlAttr().'>'.(strlen($this->getAttr('icon-class')) ? '<i class=" '.$this->getAttr('icon-class').'"></i>' : '').' '.$this->getAttr('label').' </button>';
	}
	
	function getToggleButton(){
		return '<button type="button" name="'.$this->getName().'" '.$this->getHtmlAttr().'><i id="toggle-icon" class="fa fa-'.(strlen($this->getAttr('icon-class')) ? $this->getAttr('icon-class') : 'plus').'"></i></button>';
	}
	
	function getDeleteButton(){
		return '<div class="btn btn-danger btn-delete pull-right '.$this->getAttr('class').'" '.$this->getHtmlAttr().'><i class="row-option-elem del-row fa fa-trash-o"></i> <span class="del-option" style="display:none;"><a href="#" class="delete">'.$this->dpc->getText('delete').'</a></span><div>';
	}
	function getHide($onElement = false){
		$valueSet 		= (isset($this->settings[(string)$this->getAttr('displayElement')]) ? $this->settings[(string)$this->getAttr('displayElement')] : '');
		$valueRequired 	= $this->getAttr('displayValue');
		
		echo '<div style="display:';
		if((is_array($this->settings[(string)$this->getAttr('displayElement')]) && in_array($valueRequired, $this->settings[(string)$this->getAttr('displayElement')])) || $valueSet == $valueRequired){
		 	echo $this->getAttr('displayType', 'inline-block'); 
		}else {
			echo 'none';
		}
		echo ';" class="hideControls '.$this->getAttr('class').'" id="'.$this->getAttr('id').'" data-display-element="'.$this->getName($this->getAttr('displayElement')).'" '.($this->getAttr('displayValue', false) ? 'data-display-value="'.$this->getAttr('displayValue').'"' : '').'  '.($this->getAttr('displaySearchValue', false) ? 'data-display-searchvalue="'.$this->getAttr('displaySearchValue').'"' : '').' data-display-type="'.$this->getAttr('displayType').'" '.$this->getHtmlAttr().'>';
		if($onElement){
			unset($this->attributes['hide']); //unset hide attribute to avoid endless loop		
			echo $this->getInput($this->field);
		} else {
			$this->showFields($this->field->children());
		}
		echo '</div>';
	}
	
	function getText(){
		$input  =	'<div class="form-group">';
		$input .=		'<div class="input-group">';
		$input .= 			(strlen($this->getAttr('label')) ? '<span class="input-group-addon" style="'.$this->getAttr('label-style').'">'.$this->getAttr('label').'</span>' : (strlen($this->getAttr('icon')) ? '<span class="input-group-addon" style="'.$this->getAttr('label-style').'"><i class="fa '.$this->getAttr('icon').'"></i></span>' : ''));
		$input .=	'		<input type="text" placeholder="'.$this->getAttr('placeholder').'" id="'.$this->getName().'" name="'.$this->getName().'" value="'.$this->getValue().'" '.$this->getHtmlAttr(array('value', 'placeholder', 'icon')).' '.(strlen($this->getAttr('tooltip-content')) ? 'style="width:80%;"' : '').' />';
		$input .=			$this->getTooltip();
		$input .=			(strlen($this->getAttr('description')) ? '<span class="description">'.$this->getAttr('description').'</span>' : '');
		$input .=	'	</div>';
		$input .=	'</div>';
		return $input;
	}
	
	
	function getSpinner(){
		$input  = '<div class="input-group">
				  	<div class="input-group spinner" id="'.$this->getAttr('spinner-id').'">
						<div class="input-group-btn-vertical">
				      		<button class="btn btn-default btn-spinner minus"><i class="fa fa-minus"></i></button>
				    	</div>';
		$input .=		'<input type="text" placeholder="'.$this->getAttr('placeholder').'" id="'.$this->getName().'" name="'.$this->getName().'" value="'.$this->getValue().'" '.$this->getHtmlAttr(array('value', 'placeholder', 'icon')).'/>';
		$input .=    	'<div class="input-group-btn-vertical">
				      		<button class="btn btn-default btn-spinner plus"><i class="fa fa-plus"></i></button>
				    	</div>
					</div>
					'.(strlen($this->getAttr('description')) ? '<div class="sublabel"><span>'.$this->getAttr('description').'</span></div>' : '').'
				</div>';
				
		$input .= '<script type="text/javascript">
						(function ($) {
						  $("#'.$this->getAttr('spinner-id').' .plus").on("click", function() {
						    $("#'.$this->getAttr('spinner-id').' input[name^=\''.$this->getName().'\']").val( parseInt($("#'.$this->getAttr('spinner-id').' input[name^=\''.$this->getName().'\']").val(), 10) + 1);
							return false;
						  });
						  $("#'.$this->getAttr('spinner-id').' .minus").on("click", function() {
						    $("#'.$this->getAttr('spinner-id').' input[name^=\''.$this->getName().'\']").val( parseInt($("#'.$this->getAttr('spinner-id').' input[name^=\''.$this->getName().'\']").val(), 10) - 1);
							return false;
						  });
						  $("#'.$this->getAttr('spinner-id').' input[name^=\''.$this->getName().'\']").change(function(){
						  	if( $(this).val() < "0"){
							  	$(this).val("0");
							  }
						  })
						})(jQuery);
					</script>';
					
		return $input;
					
	}
	
	function getSortable(){
		$input  =	'<div class="form-group sortable">';
		$input .=		'<div class="input-group">';
		$input .= 			(strlen($this->getAttr('label')) ? '<span class="input-group-addon" style="'.$this->getAttr('label-style').'">'.$this->getAttr('label').'</span>' : (strlen($this->getAttr('icon')) ? '<span class="input-group-addon" style="'.$this->getAttr('label-style').'"><i class="fa '.$this->getAttr('icon').'"></i></span>' : ''));
		$input .=	'		<input type="text" placeholder="'.$this->getAttr('placeholder').'" id="'.$this->getName().'" name="'.$this->getName().'" value="'.$this->getValue().'" '.$this->getHtmlAttr(array('value', 'placeholder', 'icon')).'/>';
		$input .=			(strlen($this->getAttr('description')) ? '<span class="description">'.$this->getAttr('description').'</span>' : '');
		$input .=	'	</div>';
		$input .=	'</div>';
		
		return $input;
	}
	
	function getColorpicker(){
		/**
		 * Enqueue colorpicker
		 */
		wp_enqueue_script('dpc-color-picker', plugins_url( 'assets/colorpicker/js/bootstrap-colorpicker.js', DPC_FILE), array('jquery'));
		wp_enqueue_style('dpc-color-picker-css', plugins_url( 'assets/colorpicker/css/bootstrap-colorpicker.css', DPC_FILE));
		
		$input  =	'<div class="form-group '.$this->getAttr('group-class').'">';
		$input .=		'<div class="input-group color-picker">';
		$input .= 			(strlen($this->getAttr('label')) ? '<span class="input-group-addon" style="'.$this->getAttr('label-style').'">'.$this->getAttr('label').'</span>' : (strlen($this->getAttr('icon')) ? '<span class="input-group-addon" style="'.$this->getAttr('label-style').'"><i class="fa '.$this->getAttr('icon').'"></i></span>' : ''));
		$input .=	'		<input type="text" placeholder="'.$this->getAttr('placeholder').'" name="'.$this->getName().'" value="'.$this->getValue().'" '.$this->getHtmlAttr(array('value', 'placeholder', 'icon')).'/>';
		$input .=			(strlen($this->getAttr('description')) ? '<span class="description">'.$this->getAttr('description').'</span>' : '');
		$input .=	'	</div>';
		$input .=	'</div>';

		return $input;
	}

	function getTimepicker(){
		/**
		 * Enqeue timepicker
		 */
		wp_enqueue_script('dpc-timepicker', plugins_url( 'assets/timepicker/js/bootstrap-timepicker.js', DPC_FILE), array('jquery'));
		wp_enqueue_style('dpc-timepicker-css', plugins_url( 'assets/timepicker/css/bootstrap-timepicker.css', DPC_FILE));
		$input  =	'<div class="form-group timepicker" style="max-width: 115px;">';
		$input .=		'<div class="input-group" >';
		$input .= 			'<span class="input-group-addon"><i class="fa fa-clock-o"></i></span>';
		$input .=	'		<input type="text" placeholder="'.$this->getAttr('placeholder').'" name="'.$this->getName().'" value="'.$this->getValue().'" '.$this->getHtmlAttr(array('value', 'placeholder', 'icon')).'/>';
		$input .=			(strlen($this->getAttr('description')) ? '<span class="time-description">'.$this->getAttr('description').'</span>' : '');
		$input .=	'	</div>';
		$input .=	'</div>';
		
			
		$input .= '<script type="text/javascript">
					jQuery(document).ready(function($){
						$(\'[name^="'.$this->getName().'"]\').timepicker({
							template: "dropdown",
							minuteStep: 5,
							showInputs: false,
							disableFocus: true,
							defaultTime: "'.$this->getAttr('defaultTime').'"
						});
					});
					</script>';
		return $input;
	}
	
	function getCopyCode(){
		/**
		 * Enqeue Zclip
		 */
		wp_enqueue_script('dpc-zclip', plugins_url( 'assets/Zclip/dist/ZeroClipboard.js', DPC_FILE), array('jquery'));
		
		$url = plugins_url();
		$input  = '	<div class="copyCode" '.$this->getHtmlAttr().'>';
		$input .= '<h5>'.(strlen($this->getAttr('name')) ? $this->getAttr('name') : $this->dpc->getText('Shortcode')).': '.$this->getTooltip().' <span class="copy"><span class="success blue hidden" id="success-'.$this->getAttr('id').'"><i class="fa fa-check"></i> '.$this->dpc->getText('copied').'</span><a id="copy'.$this->getAttr('id').'" data-clipboard-text="'.$this->getAttr('text').'" href="javascript:;"><i class="fa fa-paperclip"></i> '.$this->dpc->getText('copy').'</a></span></h5>';
		$input .= '<span id="'.$this->getAttr('id').'" class="shortcode">'.$this->getAttr('text').'</span>';
		$input .= '</div>';
		$input .= '<script type="text/javascript">
					jQuery(document).ready(function($){
						var clip = new ZeroClipboard($("#copy'.$this->getAttr('id').'"));
						clip.on( "aftercopy", function( event ) {
							$("#copy'.$this->getAttr('id').'").hide();
							$("#success-'.$this->getAttr('id').'").toggleClass("hidden");
							setTimeout(function(){
								$("#copy'.$this->getAttr('id').'").show();
								$("#success-'.$this->getAttr('id').'").toggleClass("hidden");
							}, 5000)
							 
						  });
					});
					</script>';
		return $input;
	}
	function getTaglist(){ 
		$input =	'<div class="input-group">';
		$input .=	(strlen($this->getAttr('label')) ? '<span class="input-group-addon">'.$this->getAttr('label').'</span>' : (strlen($this->getAttr('icon')) ? '<span class="input-group-addon"><i class="fa '.$this->getAttr('icon').'"></i></span>' : ''));
		$input .=	'	<input type="text" id="'.$this->getName().'" name="'.$this->getName().'" value="'.$this->getValue().'" '.$this->getHtmlAttr().'/>';
		$input .= $this->getTooltip();
		$input .=	'</div>';	
		$input .= 	'<script type="text/javascript">
					jQuery(document).ready(function($) {
						$(\'[name^="'.$this->getName().'"]\').select2({
							tags:["'.str_replace(',','","',$this->getAttr('preselection')).'"],
							tokenSeparators: [",", " "]
						});';
		if($this->getAttr('sortable') == 'true'){
			$input .=	'$(\'[name^="'.$this->getName().'"]\').select2("container").find("ul.select2-choices").sortable({
							containment: "parent",
							start: function() { $(\'[name^="'.$this->getName().'"]\').select2("onSortStart"); },
							update: function() { $(\'[name^="'.$this->getName().'"]\').select2("onSortEnd"); }
						 });';
		}
		$input .= '});</script>';
		return $input;
	}
	
	function getHtmlElements(){
		switch($this->getAttr('element')){
			case 'hr':
				return '<div class="clear"></div><hr '.$this->getHtmlAttr().'/>';
				break;
			case 'br':
				return '<br/>';
				break;
			case 'border':
				return '<div class="'.$this->getAttr('class').'" '.$this->getHtmlAttr().'></div>';
				break;
			case 'span':
				return '<span '.$this->getHtmlAttr().'>'.$this->getAttr('text').'</span>';
				break;
			case 'clear':
				return '<div class="clear"></div>';
		}
		
		
	}
	
	function getHinweis(){
		return '<p class="advice '.$this->getAttr('class').'"><span class="hinweis"><i class="fa fa-info-circle"></i> '.$this->dpc->getText('Notice').'</span> <span>'.$this->getAttr('text').'&nbsp;'.(strlen($this->getAttr('link')) ? '<a href="'.$this->getAttr('link').'" target="_blank">'.$this->getAttr('link-text').'</a> '.$this->getAttr('text-after-link') : '').'</span></p>';
	}
	
	function getInfo(){
		return '<p class="advice"><span class="info" id="'.$this->getAttr('id').'"><i class="fa fa-info-circle"></i> '.$this->dpc->getText('Info').'</span> <span>'.$this->getAttr('text').'&nbsp;'.(strlen($this->getAttr('link')) ? '<a href="'.$this->getAttr('link').'" target="_blank">'.$this->getAttr('link-text').'</a> '.$this->getAttr('text-after-link') : '').'</span></p>';
	}
	
	function getAlert(){
		$input  = '	<div class="alert alert-'.$this->getAttr('alert-type').' '.$this->getAttr('class').'" role="alert" style="width: 100%;">
						<div class="row"><div class="col-md-12">';
		$input .= 			(strlen($this->getAttr('bold-text')) ? '<strong>'.$this->getAttr('bold-text').'</strong>' : '').' '.$this->getAttr('text');
		
		if(strlen($this->getAttr('link'))){
			$input .= ' <a href="'.$this->getAttr('link').'" class="'.$this->getAttr('link-class').'" '.(strlen($this->getAttr('link-target')) ? 'target="'.$this->getAttr('link-target').'"' : '').'>'.$this->getAttr('link-text').'</a>';
		}
		
		$input .= '</div></div></div>';
					
		return $input;
	}
	
	function getParagraph(){
		$input  = '<div id="'.$this->getAttr('id').'" class="form-group"><div class="input-group ">';
		$input .= '<p class="'.$this->getAttr('class').'" '.$this->getHtmlAttr(array('class,id')).'>';
		if(strlen($this->getAttr('icon-class'))){
			$input .= '<i class="'.$this->getAttr('icon-class').'"></i>';
		}
		
		$input .= $this->getAttr('text');
		if(strlen($this->getAttr('link'))){
			$input .= '<a href="'.$this->getAttr('link').'" class="'.$this->getAttr('link-class').'">'.$this->getAttr('link-text').'</a>';
		}
		$input .= $this->getTooltip();
		$input .= '</p>';
		$input .= '</div>';
		$input .= '</div>';
		return $input;
	}
	
	function getIcon(){
		$input  = '<div id="'.$this->getAttr('id').'" class="form-group"><div class="input-group ">';
		if(strlen($this->getAttr('tooltip'))){
			$input .= '<span class="tooltip-toggle" data-original-title="'.$this->getAttr('tooltip').'" data-placement="'.(strlen($this->getAttr('tooltip-placement')) ? $this->getAttr('tooltip-placement') : 'top').'" data-toggle="tooltip">';
		}
		$input .= '<i class="'.$this->getAttr('class').'" '.$this->getHtmlAttr(array('id')).'></i>';
		if(strlen($this->getAttr('tooltip'))){
			$input .= '</span>';
		}
		$input .= '</div></div>';
		
		return $input;
	}
	
	function getLink(){
		$input  = '<div id="'.$this->getAttr('id').'" class="form-group"><div class="input-group ">';
		$input .= (strlen($this->getAttr('text-before')) ? '<p class="text-before">'.$this->getAttr('text-before').'' : '');
		$input .= '<a target="'.$this->getAttr('target').'" href="'.$this->getAttr('link').'" class="'.$this->getAttr('class').'" '.$this->getHtmlAttr(array('class,id')).'>';
		if(strlen($this->getAttr('icon-class'))){
			$input .= '<i class="'.$this->getAttr('icon-class').'"></i>';
		}
		$input .= $this->getAttr('text').'</a>';
		$input .= (strlen($this->getAttr('text-before')) ? '</p>' : '');
		$input .= '</div></div>';
		
		return $input;
	}
	
	function getModal(){
		$input  = '<div class="modal fade" id="'.$this->getAttr('target').'" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
		//Head
  		$input .= '<div class="modal-dialog"><div class="modal-content"><div class="modal-header">';
        $input .= '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">'.$this->dpc->getText('Close').'</span></button>';
        $input .= '<h4 class="modal-title" id="myModalLabel">'.$this->getAttr('title').'</h4>';
        //Head End - Body Start
     	$input .= '</div><div class="modal-body">';
        $input .= '<p>'.$this->getAttr('content').'</p>'.(strlen($this->getAttr('extra-content')) ? '<p class="'.$this->getAttr('extra-content-type').'">'.$this->getAttr('extra-content').'</p>' : '');
      	$input .= '</div>';
		//Body End - Footer Start
      	$input .= '<div class="modal-footer">';
        $input .= '<button type="button" class="btn btn-danger pull-left" data-dismiss="modal">'.$this->getAttr('abort').'</button>';
        $input .= '<button type="button" class="btn btn-success pull-right">'.$this->getAttr('continue').'</button>';
		//Modal End
      	$input .= '</div></div></div></div>';
		
		return $input;
	}
	
	function getImage(){
		$url = ($this->getAttr('absolute', false) ? $this->getAttr('image') : plugins_url().'/dpc/assets/img/'.$this->getAttr('image'));
		$input  = '<div class="form-group"><div class="input-group ">';
		$input .= (strlen($this->getAttr('text-before')) ? '<p class="lang-before">'.$this->getAttr('text-before').'</p>' : '');
		$input .= '<img src="'.$url.'" alt="'.$this->getName().'" '.$this->getHtmlAttr().' />';
		$input .= (strlen($this->getAttr('text-after')) ? '<p class="lang-after">'.$this->getAttr('text-after').'</p>' : '');
		$input .= $this->getTooltip();
		$input .= '</div></div>';
		
		return $input;
	}
	function getCheckbox(){
		/**
		 * Enqeue icheck 
		 */
		wp_enqueue_script('dpc-icheck', plugins_url( 'assets/iCheck/icheck.js', DPC_FILE), array('jquery'));
		wp_enqueue_style('dpc-icheckBlue', plugins_url( 'assets/iCheck/blue.css', DPC_FILE));
		wp_enqueue_style('dpc-icheckGreen', plugins_url( 'assets/iCheck/green.css', DPC_FILE));
		
		$input = 	'<ul class="form-group '.(strlen($this->getAttr('ul-class')) ? $this->getAttr('ul-class') : '').'"><li>';
		$input .=	'<input id="'.$this->getAttr('id').'" type="checkbox" class="icheck-checkbox '.$this->getAttr('class').'" name="'.$this->getName().'" '.($this->getValue() == 'on' ? ' checked="checked"' : '').' '.$this->getHtmlAttr(array('checked,class')).'/>' ;
		$input .=	'<label>'.$this->getAttr('label').'</label>';
		if(strlen($this->getAttr('tooltip-content'))){
			$input .= '  <span class="tooltip-toggle" data-toggle="tooltip" data-placement="'.$this->getAttr('tooltip-placement').'" data-original-title="'.$this->getAttr('tooltip-content').'"><i class="fa fa-question-circle"></i></span>';	
		}
		$input .=	'</li></ul>';
		$input .= 	'<script type="text/javascript">
					jQuery(document).ready(function($) {
						$("#'.$this->getAttr('id').'").iCheck({
					    	checkboxClass: "icheckbox_square-'.(strlen($this->getAttr('color')) ? $this->getAttr('color') : 'blue').'", 
					  	});
				  	});
					</script>';
		return $input;
	}
	
	function getRadio(){
		$input =	'<div class="radio"><label>';
		foreach($this->possibleValues as $val){
			$input  .= '<input type="radio" id="'.$this->getName().'" name="'.$this->getName().'" value="'.$val['value'].'"'.($val['value'] == $this->getValue() ? ' checked="checked"' : '').' '.$this->getHtmlAttr().'/>'.$this->getAttr('label');
		}
		$input .=	'</label></div>';	
		
		return $input;
	}

	function getRadioSwitch(){
		/**
		 * Multiselect
		 */
		wp_enqueue_script('dpc-bootstrap-select', plugins_url( 'assets/select2/select2.js', DPC_FILE), array('jquery'));
		wp_enqueue_style('dpc-bootstrap-select', plugins_url( 'assets/select2/select2.css', DPC_FILE));
		wp_enqueue_script('dpc-bootstrap-checkbox', plugins_url( 'assets/bootstrap-multiselect/js/bootstrap-multiselect.js', DPC_FILE), array('jquery'));
		wp_enqueue_style('dpc-bootstrap-checkbox', plugins_url( 'assets/bootstrap-multiselect/css/bootstrap-multiselect.css', DPC_FILE)); 
		
		$input =	'<div class="btn-group btn-toggle" data-toggle="buttons">';
		foreach($this->possibleValues as $val){$input  .= '<label class="'.$val['class'].' '.($val['value'] == $this->getValue() ? ' active' : '').'">';
			$input  .= '<input type="radio" id="'.$this->getName().'" name="'.$this->getName().'" value="'.$val['value'].'"'.($val['value'] == $this->getValue() ? ' checked="checked"' : '').' '.$this->getHtmlAttr().'/>'.$val['label'];
			$input 	.= '</label>';
			if(isset($val['toggle'])){
			}
		}
		$input .=	'</div>';	
		
		return $input;
	}
	
	function getSelect(){
		/**
		 * Multiselect
		 */
		wp_enqueue_script('dpc-bootstrap-select', plugins_url( 'assets/select2/select2.js', DPC_FILE), array('jquery'));
		wp_enqueue_style('dpc-bootstrap-select', plugins_url( 'assets/select2/select2.css', DPC_FILE));
		wp_enqueue_script('dpc-bootstrap-checkbox', plugins_url( 'assets/bootstrap-multiselect/js/bootstrap-multiselect.js', DPC_FILE), array('jquery'));
		wp_enqueue_style('dpc-bootstrap-checkbox', plugins_url( 'assets/bootstrap-multiselect/css/bootstrap-multiselect.css', DPC_FILE));
		
		$input 	 = '<div id="'.$this->getAttr('id').'" class="input-group '.($this->getAttr('hidden') == 'true' ? 'hidden' : '').'">'.(strlen($this->getAttr('label')) ? '<span class="input-group-addon" style="width:'.$this->getAttr('label-width').'px;">'.$this->getAttr('label').'</span>' : '' );
		$input  .= '<select id="'.$this->getName(). '" name="'.$this->getName().($this->getAttr('multiple') == 'multiple' ? '[]' : '').'" '.$this->getHtmlAttr().($this->getAttr('fullheight') == 'true' ? ' size="'.count($this->possibleValues).'"' : '' ).'>';
		if(is_array($this->possibleValues)){
			foreach($this->possibleValues as $val){
				$selected = false;
				if($this->getAttr('multiple') == 'multiple'){
					$selected = (is_array($this->getValue()) && in_array($val['value'], $this->getValue()) ? true : false);
				} else {
					$selected = (($val['value'] == $this->getValue() || (string)$val['value'] == (string)$this->getAttr('value', false)) ? true : false);	
				}
				$input .= '<option value="'.$val['value'].'"'.($selected ? ' selected="selected"' : '').'>'.$val['label'].'</option>';
			}
		}
		$input .= '</select>';
		$input .= $this->getTooltip();
		$input .= '</div>';
		$input .= 	'<script type="text/javascript">
					jQuery(document).ready(function($) {
						$(\'[name^="'.$this->getName().'"]\').multiselect({
							nonSelectedText: "'.(strlen($this->getAttr('nonSelectedText')) ? $this->getAttr('nonSelectedText') : $this->dpc->getText('None selected')).'",
							nSelectedText: "'.$this->dpc->getText('selected').'",
							buttonClass: \'btn btn-blue '.$this->getAttr('btn-class').'\''.
							(strlen($this->getAttr('numberDisplayed')) ? ', numberDisplayed: '.$this->getAttr('numberDisplayed') : '').
							(strlen($this->getAttr('onChange')) ? ', onChange: '.$this->getAttr('onChange') : '');
		if($this->getAttr('templates') == 'true'){
		$input .=				', templates: {'.
									(strlen($this->getAttr('button')) ? 'button: "<'.$this->getAttr('button').'></button>"' : '')
								.'}';
		}
		$input .=		'});
					});
					</script>';
		

		return $input;
	}

	function getSelectImg(){
		$options = explode(',', $this->getAttr('items'));
				
		$input  = '<div id="'.$this->getAttr('id').'" class="select-img">';
			foreach($options as $option){
				$input .= '<span id="'.$option.'" class="img-option" data-value="'.$option.'"><i class="fa fa-'.$option.'"></i></span>';
			}
		$input .= '<input type="hidden" value="'.$this->getValue().'" name="'.$this->getName().'"/>';	
		$input .= '</div>';
		
		$input .= 	'<script type="text/javascript">
					jQuery(document).ready(function($) {
						if($(\'input[name^="'.$this->getName().'"]\').val()){
							var selected = $(\'input[name^="'.$this->getName().'"]\').val();
							$(".select-img").find("#"+selected).addClass("active");
						}
						$(".img-option").bind("click", function(ev){
							if(!$(this).hasClass("active")){
								$("#'.$this->getAttr('id').' > .img-option").removeClass("active");
								$(this).addClass("active");
								$(\'input[name^="'.$this->getName().'"]\').val($(this).data("value"));
							}
						})
					});
					</script>';

  		return $input;
	}
	function getselectToggle(){
		/**
		 * Multiselect
		 */
		wp_enqueue_script('dpc-bootstrap-select', plugins_url( 'assets/select2/select2.js', DPC_FILE), array('jquery'));
		wp_enqueue_style('dpc-bootstrap-select', plugins_url( 'assets/select2/select2.css', DPC_FILE));
		wp_enqueue_script('dpc-bootstrap-checkbox', plugins_url( 'assets/bootstrap-multiselect/js/bootstrap-multiselect.js', DPC_FILE), array('jquery'));
		wp_enqueue_style('dpc-bootstrap-checkbox', plugins_url( 'assets/bootstrap-multiselect/css/bootstrap-multiselect.css', DPC_FILE));
		
		//$input 	 = '<div class="input-group '.($this->getAttr('hidden') == 'true' ? 'hidden' : '').'">';
		$input  .= '<select id="'.$this->getName(). '" name="'.$this->getName().($this->getAttr('multiple') == 'multiple' ? '[]' : '').'" '.$this->getHtmlAttr().($this->getAttr('fullheight') == 'true' ? ' size="'.count($this->possibleValues).'"' : '' ).'>';
		foreach($this->possibleValues as $val){
			$selected = false;
			if($this->getAttr('multiple') == 'multiple'){
				$selected = (in_array($val['value'], $this->getValue()) ? true : false);
			} else {
				$selected = ($val['value'] == $this->getValue() ? true : false);
			}
			$input .= '<option value="'.$val['value'].'"'.($selected ? ' selected="selected"' : '').'>'.$val['label'].'</option>';
		} 
		$input .= '</select>';
		//$input .= '</div>';
		$input .= 	'<script type="text/javascript">
					jQuery(document).ready(function($) {
						$(\'[name^="'.$this->getName().'"]\').multiselect({
							buttonClass: \'btn btn-blue '.$this->getAttr('btn-class').'\',
						});
					});
					</script>';
		

		return $input;
	}
	function getTextarea(){
		return '<div class="form-group"><div class="input-group"><textarea id="'.$this->getName().'" name="'.$this->getName().'" '.$this->getHtmlAttr().'>'.$this->getValue().'</textarea></div></div>';
	}
	
	function getHtml(){
		echo "<pre>";
		print_r($this->field);
		echo "</pre>";
		return '';
	}
	
	function debug(){
		echo "<pre>";
		print_r($this->field);
		echo "</pre>";
		return '';
	}
	
	function getMediaUploader(){
		$input  = '	<div class="dpc-fileinput fileinput-new">';
		$input .= '		<div class="dpc-input-thumbnail" style="width: '.$this->getAttr('width').'; height: '.$this->getAttr('height').';">';
		$input .= '			<img class="dpc-file-holder" src="'.(strlen($this->getValue()) ? $this->getValue() : '').'" alt="'.$this->dpc->getText('Nothing selected').'"/>';
		$input .= '		</div>';
		$input .= '		<div class="dpc-media-uploader">		
				  	
							<a href="#" class="btn btn-default btn-file dpc-file-upload-button" data-name="'.$this->getAttr('id').'" data-frame-title="'.$this->getAttr('frame-title').'">'.$this->dpc->getText('Select').'</a>
							<a href="#" class="btn btn-default btn-file upload-dpc-file" data-name="'.$this->getAttr('id').'" data-frame-title="'.$this->getAttr('frame-title').'">'.$this->dpc->getText('Change').'</a>
							<a href="#" class="btn btn-danger remove-dpc-file">'.$this->dpc->getText('Remove').'</a>
							<input type="text" name="'.$this->getName().'" class="dpc-fileinput-input" id="'.$this->getAttr('id').'" value="'.(strlen($this->getValue()) ? $this->getValue() : '').'"/>
				  		</div>
					</div>';
					
		return $input;
	}
	function getFile(){
		$input =	'<div class="form-group">';
    	$input .=	'<label for="'.$this->getName().'">'.$this->getAttr('label').'</label>';
    	$input .=	'<input type="file" id="'.$this->getName().'" name="'.$this->getattr('index').'"/>';
    	if($this->getAttr('buttonLabel', false)){
    		$input .= '<button name="'.$this->getName().'" value="'.$this->getValue().'" '.$this->getHtmlAttr().'>'.$this->getAttr('buttonLabel').' '.(strlen($this->getAttr('icon-class')) ? '<i class="fa '.$this->getAttr('icon-class').'"></i>' : '').'</button>';
    	}
    	
    	if(strlen($this->getAttr('helptext'))){
    		$input .=	'<p class="help-block">'.$this->getAttr('helptext').'</p>';		
    	}
  		$input .=	'</div>';
		return $input;
	} 
	
	function showFields($fields = null){
		if($fields == null){ return false; }
		foreach($fields as $field){
			$this->initPossibleValues($field);
			$this->field 	= $field;
			$attr 			= $field->attributes();
			$this->value	= $attr->value;
			echo $this->getInput($field->attributes());
		}
	}
	
	
	function showSection($fields = null, $addAnchor = false, $skipWrapper = false){
		if($fields == null){ return false; }
		if(isset($this->sectionAttributes['extendable']) && $this->sectionAttributes['extendable'] == true){
			#unset($this->sectionAttributes['extendable']);
			$this->inLoop = true;
			$sectionName = (string)$this->sectionAttributes['name'];
			/* DRAFT: start */
			if($skipWrapper == false || $this->getAttr('skipWrapper', false)){
				echo $this->sectionStart('dpc-draft extendable');
			}
			echo $this->getExtendableButtonRemove();
			$this->isDraftLoop = true;
			foreach($fields as $field){
				$this->initPossibleValues($field);
				$this->field 	= $field;
				$attr 			= $field->attributes();
				$this->value	= $attr->value;
				echo $this->getInput($field->attributes());
			}
			$this->isDraftLoop = false;
			if(!$skipWrapper){
				echo $this->sectionClose();
			}
			/* DRAFT: end */
			
			if(isset($this->settings[$sectionName])){
				foreach($this->settings[$sectionName] as $k => $v){
					if($skipWrapper == false || $this->getAttr('skipWrapper', false)){
						echo $this->sectionStart('extendable');
					}
					echo $this->getExtendableButtonRemove();
					foreach($fields as $field){
						$this->initPossibleValues($field);
						$this->field 	= $field;
						$attr 			= $field->attributes();
						$this->value	= $attr->value;
						echo $this->getInput($field->attributes());
					}
					if($skipWrapper == false || $this->getAttr('skipWrapper', false)){
						echo $this->sectionClose();
					}
					$this->loopIndex++;
				}
			}
			echo $this->getExtendableButtonAdd();
			$this->loopIndex = 0;
			$this->inLoop = false;
		} else {
			if($skipWrapper == false || $this->getAttr('skipWrapper', false)){
				echo $this->sectionStart($this->getAttr('class'));
			}
			foreach($fields as $field){
				$this->initPossibleValues($field);
				$this->field 	= $field;
				$attr 			= $field->attributes();
				$this->value	= $attr->value;
				echo $this->getInput($field->attributes());
			}
			if($skipWrapper == false || $this->getAttr('skipWrapper', false)){
				echo $this->sectionClose();
			}
		}
	}
	
	function getExtendableButtonAdd(){
		if(isset($this->sectionAttributes['buttonAddClass'])){
			$class = trim($this->sectionAttributes['buttonAddClass']);
		}
		return '<button class="dpc-extendable-add btn btn-info'.(strlen($class) ? ' '.$class : '').'" data-container=".'. $this->module . '.' . $this->sectionAttributes['name'] .'.dpc-draft">'. $this->sectionAttributes['buttonAddText'] .'</button>';
	}
	
	function getExtendableButtonRemove(){
		$text = '';
		if(isset($this->sectionAttributes['buttonRemoveText'])){
			$text = trim($this->sectionAttributes['buttonRemoveText']);
		}
		if(isset($this->sectionAttributes['buttonRemoveClass'])){
			$class = trim($this->sectionAttributes['buttonRemoveClass']);
		}
		return '<button class="dpc-extendable-remove btn btn-xs btn-warning'.(strlen($class) ? ' '.$class : '').'">'.(strlen($text) ? $text : '<i class="fa fa-minus"></i>').'</button>';
	}
	
	function initPossibleValues($field){
		$possibleValues = $this->getValuesBySource($field);

		if(is_array($field) || is_object($field)){
			foreach($field->children() as $child){
				$possibleValues[] = $this->replaceXmlAttributes($child);
			}
		}
		if(count($possibleValues)){	
			$this->possibleValues = $possibleValues;
		} else {
			$this->possibleValues = null;
		}
	}
	
	function initChilds(){
		$field = $this->field;
		$childs = array();
		$this->childs = ($field ? $field : null);
	}
	
	
	
}