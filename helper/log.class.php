<?php 

class DPC_Helper_Log {
	
	var $manager	= null;
	var $dpc 		= null;
	
	function __construct(&$dpc){
		$this->dpc		= $dpc;
		$this->setup();
	}
	
	function setup(){
		global $wpdb;
		$sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}dpc_suite` (
				`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				`post_id` bigint(20) NOT NULL,
				`type` varchar(255) CHARACTER SET utf8 NOT NULL,
				`module` varchar(255) CHARACTER SET utf8 NOT NULL,
				`message` varchar(255) CHARACTER SET utf8 NOT NULL,
				`params` text CHARACTER SET utf8 NOT NULL,
				`timestamp` bigint(20) NOT NULL,
				`status` tinyint(1) NOT NULL,
				PRIMARY KEY (`id`)
				)";
		$wpdb->query($sql);
	}
	
	function addError($post_id, $message, $params = array()){
		global $wpdb;
		$sql = "INSERT INTO {$wpdb->prefix}dpc_suite (`post_id`, `type`, `message`, `params`, `timestamp`, `status`) VALUES ('".$post_id."', 'error', '".$message."', '".serialize($params)."', '".time()."', 0)";
		$wpdb->query($sql);
	}
	
	function addWarning($post_id, $message, $params = array()){
		global $wpdb;
		$sql = "INSERT INTO {$wpdb->prefix}dpc_suite (`post_id`, `type`, `message`, `params`, `timestamp`, `status`) VALUES ('".$post_id."', 'warning', '".$message."', '".serialize($params)."', '".time()."', 0)";
		$wpdb->query($sql);
	}
	
	function markAllAsRead($type){
		global $wpdb;
		switch($type){
			case 'error':
				$sql = "UPDATE {$wpdb->prefix}dpc_404_redirects SET `status`=1 WHERE 1";
				break;
			case 'warning':
				$sql = "UPDATE {$wpdb->prefix}dpc_suite SET `status`=1 WHERE `type`='$type'";
				break;
		}
		echo $sql;
		$wpdb->query($sql);
	}
	
	function clearPostLog($post_id){
		global $wpdb;
		$sql = "DELETE FROM {$wpdb->prefix}dpc_suite WHERE `post_id` = '$post_id'";
		$wpdb->query($sql);
	}
	
	function clearLog($type = false){
		global $wpdb;
		$sql = "DELETE FROM {$wpdb->prefix}dpc_suite WHERE 1";
		if($type){
			$sql = " AND `type`='$type'";
		}
		$wpdb->query($sql);
	}
	
	function getErrors(){
		global $wpdb;
		$sql = "SELECT * FROM {$wpdb->prefix}dpc_suite WHERE `type`='error' GROUP BY `post_id`";
		return $wpdb->get_results($sql, ARRAY_A);
	}
	
	function getErrorsById($postId, $count = false){
		global $wpdb;
		$sql = "SELECT ".($count ? 'COUNT(*)' : '*')." FROM {$wpdb->prefix}dpc_suite WHERE `type`='error' AND `post_id` = $postId";
		if($count){
			return $wpdb->get_var($sql, ARRAY_A);
		} else {
			return $wpdb->get_results($sql, ARRAY_A);
		}
	}
	
	function getOptimus($count = false){
		global $wpdb;
		$loggedPostIds = array();
		foreach($this->getWarnings() as $k => $v){
			$loggedPostIds[] = $v['post_id'];
		}

		$sql = "SELECT `ID` FROM $wpdb->posts WHERE `post_type` IN('".join("','",get_post_types(array('public' => true)))."') AND `post_type` NOT IN('".join("','",array('attachment', 'revision'))."') AND `post_status` NOT IN('".join("','",array('auto-draft', 'trash'))."')";
		if(is_array($loggedPostIds) && count($loggedPostIds)){
			$sql .= "AND `ID` NOT IN(".join(",",$loggedPostIds).")";
		}
		
		$posts = $wpdb->get_results($sql, ARRAY_A);
		if($count){
			return count($posts);
		} else {
			return $posts;
		}
	}
	
	function getWarnings(){
		global $wpdb;
		$sql = "SELECT * FROM {$wpdb->prefix}dpc_suite WHERE `type`='warning' GROUP BY `post_id`";
		return $wpdb->get_results($sql, ARRAY_A);
	}
	
	function getWarningsById($postId, $count = false){
		global $wpdb;
		$sql = "SELECT ".($count ? 'COUNT(*)' : '*')." FROM {$wpdb->prefix}dpc_suite WHERE `type`='warning' AND `post_id` = $postId";
		if($count){
			return $wpdb->get_var($sql);
		} else {
			return $wpdb->get_results($sql, ARRAY_A);
		}
	}

	/******************************************/
	
	/*
	function log($post_id, $type, $module, $msg_key){ //todo: remove
		global $wpdb;
		$sql = "INSERT INTO {$wpdb->prefix}dpc_suite (`post_id`, `type`, `module`, `msg_key`, `timestamp`, `status`) VALUES ('".$post_id."', '".$type."', '".$module."', '".$msg_key."', '".time()."', 0)";
		$wpdb->query($sql);
	}
	*/
	
	function updateStatus($id, $status){
		global $wpdb;
		$type = (strlen($id) == strlen(abs($id)) ? 'post' : 'url');
		switch($type){
			case 'post':
				$sql = "UPDATE `{$wpdb->prefix}dpc_suite` SET `status` = '{$status}' WHERE `post_id` = '{$id}'";
				break;
			case 'url':
				$sql = "UPDATE `{$wpdb->prefix}dpc_404_redirects` SET `status` = '{$status}' WHERE `url` = '{$id}'";
				break;
		}
		return $wpdb->query($sql);
	}
	
	function deletePostLog($post_id, $module, $type = null){
		global $wpdb;
		$sql = "DELETE FROM {$wpdb->prefix}dpc_suite WHERE `post_id`='".$post_id."' AND `module`='".$module."'";
		if(!is_null($type)){
			$sql .= " AND `type`='".$type."'";
		}
		$wpdb->query($sql);
	}
	
	function delete($objectType, $objectId){
		global $wpdb;
		switch($objectType){
			case 'post':
				$sql = "DELETE FROM {$wpdb->prefix}dpc_suite WHERE `post_id`='".$objectId."'";
				break;
			case 'url':
				$sql = "DELETE FROM {$wpdb->prefix}dpc_404_redirects WHERE `url`='".$objectId."'";
				break;
		}
		$wpdb->query($sql);
	}

	function deleteLogEntry($id){
		global $wpdb;
		$sql = "DELETE FROM {$wpdb->prefix}dpc_suite WHERE `id`='".$id."'";
		$wpdb->query($sql);
	}
	
	function count($type = null, $status = null){
		global $wpdb;
		$sql = "SELECT count(*) as `count` FROM {$wpdb->prefix}dpc_suite WHERE 1";
		if(!is_null($status)){
			$sql .= " AND `status`='".$status."'";
		}
		if(!is_null($type)){
			$sql .= " AND `type`='".$type."'";
		}
		
		$count = $wpdb->get_var($sql);
		
		switch($type){
			case 'error':
				$params = array('target_url' => '');
				$params = array('post_id' => 0);
				if(!is_null($status)){
					$params['status'] = $status;
				}
				$count += $this->dpc->getModuleInstance('basic_urls')->getCount404Entries($params);
				break;
			case 'warning':
				$params = array();
				if(!is_null($status)){
					$params['status'] = $status;
				}
				$total 	= $this->dpc->getModuleInstance('basic_urls')->getCount404Entries($params);
				$params['target_url'] = '';
				$params['post_id'] = 0;
				$errors = $this->dpc->getModuleInstance('basic_urls')->getCount404Entries($params);
				$count += ($total - $errors);
				break;
		}
		return $count; 
	}
	
	function ajaxDeleteLogEntry(){
		if($logEntryId = $_REQUEST['entryId']){
			$this->deleteLogEntry($logEntryId);
		}
	}

	
}