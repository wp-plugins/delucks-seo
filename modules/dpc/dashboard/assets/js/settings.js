jQuery(document).ready(function($) {
	var prof = '<div class="form-group"><div class="col-sm-8"><input type="text" placeholder="Lizenz Key" id="licence-key" name="dpcLicenseKey" class="form-control"></div><div class="col-sm-4"><button class="btn btn-primary" type="submit">'+dpc_dashboard_translator.unlock+'</button></div></div>';
	var suite = '<div class="form-group"><div class="col-sm-8"><input type="text" placeholder="Lizenz Key" id="licence-key" name="dpcLicenseKey" class="form-control"></div><div class="col-sm-4"><button class="btn btn-primary" type="submit">'+dpc_dashboard_translator.unlock+'</button></div></div>';

	$('#unlock_professional').on('click', function(){
		return false;
	});
	$('#unlock_professional').popover({animation:true, content:prof, html:true, placement:"bottom"});
	
	$('#unlock_suite').on('click', function(){
		return false;
	});
	$('#unlock_suite').popover({animation:true, content:suite, html:true, placement:"bottom"});
	
	
	$('.dark-text a').attr('target', '_blank');
	$('#settings_basic').bind('click', function(){ window.location.href='./admin.php?page=dpc-basic'; return false;})
	$('#settings_professional').bind('click', function(){ window.location.href='./admin.php?page=dpc-professional'; return false;})
	$('#settings_suite').bind('click', function(){ window.location.href='./admin.php?page=dpc-suite'; return false;})
	
	$('#purchase_professional').bind('click', function(){ window.location.href='https://delucks.com/wordpress-seo-plugin/'; return false;})
	$('#purchase_suite').bind('click', function(){ window.location.href='https://delucks.com/wordpress-seo-plugin/'; return false;})
	
});