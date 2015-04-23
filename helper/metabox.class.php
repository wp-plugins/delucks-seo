<?php 

class dpcMetabox {
	
	function __construct(){
		add_action('load-post.php', array($this, 'setup'));
		add_action('load-post-new.php', array($this, 'setup'));
	}
	
	function setup(){
		#echo "asfdasfasf";
	}
	
	
	
}

?>