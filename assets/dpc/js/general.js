function dpc_check_license(itemName, productKey, hostname){
	if(productKey.length == 0){
		dpc_remove_suite();
		dpc_remove_pro();
		return false;
	}
	var result = null;
	jQuery.ajax({
	   type: 'GET',
		url: dpc_license_server_url,
		async: true,
		data: {edd_action: 'check_license', license: productKey, item_name: itemName, url: hostname},
		dataType: 'jsonp',
		success: function(data) {
			if(data.license != 'valid'){
				dpc_remove_suite();
				dpc_remove_pro();
			}
		},
		error: function(e) {
		}
	});
}
/*activate license should in php */
function dpc_activate_license(itemName, productKey){
	var result = null;
	jQuery.ajax({
	   type: 'GET',
		url: dpc_license_server_url,
		async: true,
		data: {edd_action: 'activate_license', license: productKey, item_name: itemName},
		dataType: 'jsonp',
		success: function(data) {
		    if (data.license == 'valid'){
			}
		},
		error: function(e) {
		}
	});
}

jQuery(document).ready(function($){	
	if (typeof dpc_license_key == 'undefined' || typeof dpc_license_server_url == 'undefined' || typeof dpc_hostname == 'undefined' || typeof dpc_license_type == 'undefined'){
		dpc_remove_suite();
		dpc_remove_pro();
	}else{
		dpc_check_license(dpc_license_type, dpc_license_key, dpc_hostname);
	}
	

});

function dpc_remove_suite(){
jQuery('a[href^="admin.php?page=dpc-suite"]').remove();
if (typeof pagenow != 'undefined' && pagenow == 'delucks_page_dpc-suite'){
	jQuery('#wpbody').remove();
}
}

function dpc_remove_pro(){
jQuery('a[href^="admin.php?page=dpc-professional"]').remove();
if (typeof pagenow != 'undefined' && pagenow == 'delucks_page_dpc-professional'){
	jQuery('#wpbody').remove();
}
}
