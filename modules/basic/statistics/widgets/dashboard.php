<?php
class DelucksStatistic extends WP_Widget {
	var $dpc 			= null;
	var $translatorJs 	= null;
	
	function DelucksStatistic(&$dpc) {
		$this->dpc = $dpc;
		$this->translatorJs = array('Hits'=>$this->dpc->getText('Hits'));
		$this->statisticSettings 	= $this->dpc->getModuleSettings('basic_statistics');
		
		wp_enqueue_script('dpc-basic-statistics-text-sm_raphael_js', plugins_url( 'assets/js/raphael.min.js', dirname(__FILE__) ));
		wp_enqueue_script('dpc-basic-statistics-text-sm_raphael_helper', plugins_url( 'assets/js/raphael.helper.js', dirname(__FILE__)));
		wp_enqueue_script('dpc-basic-statistics-widget', plugins_url( 'assets/js/dashboard.js', dirname(__FILE__) ), array('jquery'));
		wp_localize_script('dpc-basic-statistics-widget', 'dpc_basic_statistics_widget_translator', $this->translatorJs);
		wp_enqueue_style('dpc-basic-statistics-dashboard', plugins_url( 'assets/css/dashboard.css', dirname(__FILE__) ));		
	}

	function ajax_dpc_basic_statistics_diagramm(){
		$this->appliedWidgetView($this->getStatistics($_REQUEST['dpc_statistics_interval']));
		die(0);
	}
	
	function dashboard_widget( ) {
		$user 		= wp_get_current_user();
		$userRole 	= $user->roles[0];
		
		if (array_key_exists('validUsergroups', $this->statisticSettings)) {
			if(in_array($userRole, $this->statisticSettings['validUsergroups']) || $userRole == 'administrator'){
				$option = get_option('dpc_basic_statistics_interval', 'm');
				if ( ! empty($_POST['dpc_statistics_interval']) ) {
					check_admin_referer('_dpc_basic_statistics');
					$option = $_POST['dpc_statistics_interval'];
				}
				//$this->_insertTestData();
				
				$this->appliedWidgetView($this->getStatistics($option));
				$this->appliedForm();
			}
		}			
	}
	
	function getStatistics($option){
		$now     = time();
		$nowDate = getdate($now);
		switch ($option){
			case 'm': // diese Monat
				$begin 			= mktime(0, 0, 0, $nowDate['mon'], 1, $nowDate['year']);
				$end 			= $now;
				$_end			= $begin - 1;
				$endvar			= getdate($_end);
				$_begin			= mktime(0, 0, 0, $endvar['mon'], 1, $endvar['year']);
				$interval 		= 60 * 60 * 24;
				$labelFormat 	= get_option('date_format');
				break;
			case '-m': // letzt Monat
				$end 			= mktime(0, 0, 0, $nowDate['mon'], 1, $nowDate['year']) - 1;
				$endvar			= getdate($end);
				$begin 			= mktime(0, 0, 0, $endvar['mon'], 1, $endvar['year']);
				$_end			= $begin - 1;
				$_begin			= mktime(0, 0, 0, $endvar['mon'], 1, $endvar['year']);
				$interval 		= 60 * 60 * 24;
				$labelFormat 	= get_option('date_format');
				break;
			case 'w': // 7 Tage
				$begin 			= strtotime('-6 days', $now);
				$beginvar		= getdate($begin);
				$begin 			= mktime(0, 0, 0, $beginvar['mon'], $beginvar['mday'], $beginvar['year']);
				$_end			= $begin - 1;
				$_begin			= strtotime('-7 days', $_end) + 1;
				$end 			= $now;
				$interval 		= 60 * 60 * 24;
				$labelFormat 	= get_option('date_format');
				break;
			/*
			case 'w': // diese Woche
				$begin = strtotime('-'.$nowDate['wday'].' days', $now);
				$begin = mktime(0, 0, 0, getdate($begin)['mon'], getdate($begin)['mday'], getdate($begin)['year']);
				$_end			= $begin - 1;
				$_begin			= strtotime('-7 days', $_end) + 1;
				$end 			= $now;
				$interval 		= 60 * 60 * 24;
				$labelFormat 	= get_option('date_format');
				break;
			*/
			case '-w': // letzt Woche
				$end 			= strtotime('-'.$nowDate['wday'].' days', $now);
				$endvar			= getdate($end);
				$end 			= mktime(0, 0, 0, $endvar['mon'], $endvar['mday'], $endvar['year']) - 1;
				$begin 			= strtotime('-7 days', $end) + 1;
				$_end			= $begin - 1;
				$_begin			= strtotime('-7 days', $_end) + 1;
				$interval 		= 60 * 60 * 24;
				$labelFormat 	= get_option('date_format');
				break;
			case 'd': // heute
				$begin 			= mktime(0, 0, 0, $nowDate['mon'], $nowDate['mday'], $nowDate['year']);
				$end 			= $now;
				$_end			= $begin - 1;
				$endvar			= getdate($_end);
				$_begin			= mktime(0, 0, 0, $endvar['mon'], $endvar['mday'], $endvar['year']) ;
				$interval 		= 3600;
				$labelFormat 	= get_option('time_format');
				break;
			case '-d': // gestern
				$end 			= mktime(0, 0, 0, $nowDate['mon'], $nowDate['mday'], $nowDate['year']) - 1;
				$endvar			= getdate($end);
				$begin 			= mktime(0, 0, 0, $endvar['mon'], $endvar['mday'], $endvar['year']) ;
				$_end			= $begin - 1;
				$_begin			= mktime(0, 0, 0, $endvar['mon'], $endvar['mday'], $endvar['year']) ;
				$interval 		= 3600;
				$labelFormat 	= get_option('time_format');
				break;
			case 'y': // dieses Jahr
				$begin 			= mktime(0, 0, 0, 1, 1, $nowDate['year']);
				$end 			= $now;
				$_end			= $begin - 1;
				$endvar			= getdate($_end);
				//$_begin			= mktime(23, 59, 59, 12, 31, getdate($_end)['year'] - 1);
				$_begin			= mktime(0, 0, 0, 1, 1, $endvar['year']);
				$interval 		= 60 * 60 * 24 * 31;
				$labelFormat 	= str_replace(array('d', 'j', 'S', 'I', 'D', '.'), '' , get_option('date_format'));
				break;
			case '-y': // letztes Jahr
				$begin 			= mktime(0, 0, 0, 1, 1, $nowDate['year'] - 1);
				$end 			= mktime(23, 59, 59, 12, 31, $nowDate['year'] - 1);
				$_end			= $begin - 1;
				$endvar			= getdate($_end);
				$_begin			= mktime(23, 59, 59, 12, 31, $endvar['year'] - 1);
				$interval 		= 60 * 60 * 24 * 31;
				$labelFormat 	= get_option('date_format');
				break;
		}
		 
		$result['visits'] = $this->getVisits($begin, $end, $interval, $labelFormat);
		$result['lastPeriodVisits'] = $this->getVisits($_begin, $_end, $interval, $labelFormat);
		$result['referrers'] = $this->getTopReferrer($begin, $end);
		return $result;
	}
	
	function appliedForm(){
		$option = get_option('dpc_basic_statistics_interval', 'm');
		if ( ! empty($_POST['dpc_statistics_interval']) ) {
			check_admin_referer('_dpc_basic_statistics');				
			$option = $_POST['dpc_statistics_interval'];				
		}
		$m = array(
				'm' 	=> $this->dpc->getText('Month'),
				//'-m' 	=> $this->dpc->getText('Last month'),
				'w' 	=> $this->dpc->getText('Week'),
				//'-w' 	=> $this->dpc->getText('Last week'),
				//'d' 	=> $this->dpc->getText('Today'),
				//'-d' 	=> $this->dpc->getText('Yesterday'),
				'y' 	=> $this->dpc->getText('Year'),
				//'-y' 	=> $this->dpc->getText('Last Year')
		);
		?>
		<form method="post" id="dpc_basic_statistics_form" class="dashboard-widget-control-form">
			<?php wp_nonce_field('_dpc_basic_statistics'); ?>
			<input type="hidden" value="dpc_basic_statistics_diagramm" name="action" />
			<table class="form-table">
				<tr>
					<td>
						<fieldset>
							<select name="dpc_statistics_interval" id="dpc_statistics_interval" >
								<?php foreach( $m as $value => $string ) { ?>
									<option value="<?php echo $value ?>" <?php echo ($option == $value) ? ' selected=selected ' : ''; ?>>
										<?php echo $string ?>
									</option>
								<?php } ?>
							</select>
							<img id="dpc_ajax_loader" src="<?php echo plugins_url('dpc/assets/img/ajax-loader.gif');?>" style="display:none" />
						</fieldset>
					</td>
				</tr>
			</table>
		</form>
		<?php 
		return $option;
	}
			
	function appliedWidgetView($data){
		$visits 		= $data['visits'];
		$referrers 		= $data['referrers'];
		$showDiagramm 	= false;
		foreach($visits as $visit){
			if ($visit['count'] > 0){
				$showDiagramm = true;
				break;
			}
		}
		/* diagramm data */
		if ($showDiagramm){
			$html = "<table id=\"dpc_basic_statistics_chart_data\">\n";
			$html .= "<tfoot><tr>\n";
			$i = 0;
			foreach ($visits as $item) {
				$html .= '<th rel="'.$data['lastPeriodVisits'][$i++]['label'].'">' .esc_html($item['label']). "</th>\n";
			}
			$html .= "</tr></tfoot>\n";
			$html .= "<tbody><tr>\n";
			$i = 0;
			foreach($visits as $item) {
				$html .= '<td rel="'.$data['lastPeriodVisits'][$i++]['count'].'">' .(int)$item['count']. "</td>\n";
			}
			$html .= "</tr></tbody>\n";
			$html .= "</table>\n";
		}else{
			$html = '<p class="sub">'.$this->dpc->getText('No data').'</p>';
		}
		
		
		$counter = $lastCounter = 0;
		foreach ($visits as $visit){
			$counter += $visit['count'];
		}
		foreach ($data['lastPeriodVisits'] as $visit){ 
			$lastCounter += $visit['count'];
		}
		$html .= '<div class="table referrer statistics_text">
					<div>
						<table>
							<tr class="current">
								<td class="">'.$this->dpc->getText('Current') .'</td>
								<td class="b">'.$counter .'</td>
								<td>'.
									$visits[0]['label'] . ' - ' . $visits[count($visits)-1]['label'] . '
								</td>
							</tr>
							<tr class="before">
								<td class="">'.$this->dpc->getText('Before') .'</td>
								<td class="b">'.$lastCounter .'</td>
								<td>'.
									$data['lastPeriodVisits'][0]['label'] . ' - ' . $data['lastPeriodVisits'][count($data['lastPeriodVisits']) - 1]['label'] . '
								</td>
							</tr>
						</table>
					</div>
				</div>';
		
		
		/* top referrer html */
		/*
		if ($referrers){
			$html 		.= '<div class="table referrer">
								<p class="sub">Top Referrer</p>
								<div>
									<table>';
			foreach ($referrers as $referrer) {
				$html 	.= '			<tr>
											<td class="b">'.$referrer['count'] .'</td>
											<td class="t">
												<a href="'.esc_url('http://'.$referrer['host']).'" target="_blank">'. esc_url($referrer['host']) . '</a>
											</td>
										</tr>';
			}
			$html 		.= '		</table>
								</div>
							</div>';
		}
		*/
		
		echo '<div id="dpc_basic_statistics_view">';
		echo '<div id="dpc_basic_statistics_chart">' .$html. '</div>';
		echo '</div>'; 
	}
	
	
	function update( $new_instance, $old_instance ) {

	}

	function getTopReferrer($begin, $end){
		global $wpdb;
		$sql = "SELECT COUNT(ID) AS `count`, host FROM {$wpdb->prefix}dpc_statistics WHERE `timestamp` >= $begin AND `timestamp` <= $end GROUP BY host HAVING host != '' ORDER BY `count` DESC LIMIT 5 ";
		$result = $wpdb->get_results($sql, ARRAY_A);
		return  $result;
	}
	
	function getVisits($begin , $end , $interval , $labelFormat ){
		global $wpdb;
		$visits = array();	
		while($begin <= $end)
		{
			$stepEnd = $begin + $interval;
			if ($stepEnd > $end) $stepEnd = $end;
			$sql = "SELECT COUNT(ID) FROM {$wpdb->prefix}dpc_statistics WHERE `timestamp` >= $begin AND `timestamp` < $stepEnd";
			$visit['count'] = $wpdb->get_var($sql);
			$visit['timestamp'] = $begin;
			$visit['label'] = date_i18n($labelFormat, $visit['timestamp']);
			$visits[] = $visit;
			$begin += $interval;
		}
		return $visits;
	}
	
	function _insertTestData(){
		if ($_SERVER['REMOTE_ADDR'] == '139.174.192.210'){
		// fertig, aug 2014, 2014
			for($i = 1; $i <= 7; $i++){
				for($j = 1; $j <= 31; $j++){
					$this->_insertTestDataOneDay(2014, $i, $j);
				}
			}
		}
	}
	
	function _insertTestDataOneDay($year, $month, $day){
		global $wpdb;
		if (!checkdate($month, $day, $year)){
			return;
		}
		
		$sql = "INSERT INTO `" . $wpdb->prefix . "dpc_statistics` (`timestamp`,`referrer`, `host`) VALUES ";
		$count = rand(10, 100);
		$hosts = array('google.com', 'google.de', 'bing.com', 'yahoo.com', 'yahoo.de', 'amazon.de', 'web.de', 'php.net');
		
		for($i = 0; $i < $count; $i++){
			$timestamp = mktime(rand(0, 23), rand(0, 59), rand(0, 59), $month, $day, $year);
			$j = rand(0, 7);
			$sql .= " ($timestamp, 'http://".$hosts[$j]."', '".$hosts[$j]."')";
			$sql .= ($i == $count - 1) ? "\n" : ", \n";
		}
		//echo $sql;
		$wpdb->show_errors();
		$wpdb->query($sql);
	}
} 

