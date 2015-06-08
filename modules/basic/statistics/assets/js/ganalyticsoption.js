jQuery(document).ready(function($) {	
	if ( typeof ga == 'function' && typeof(dpc_basic_statistics_settings.analytics) != 'undefined') {		
		if(typeof(dpc_basic_statistics_settings.analytics.anonymousIp) != 'undefined'){
			ga('set', 'anonymizeIp', true);
		}
		if(typeof(dpc_basic_statistics_settings.analytics.outbound) != 'undefined'){
			$('a').each(function(){
				var url = $(this).prop('href');
				var host = $(this).prop('hostname');
				if (host != dpc_basic_statistics_hostname){
					$(this).click(function(){
						ga('send', 'event', 'outbound', 'click', url, {'hitCallback':
						     function () {
						     //document.location = url;
						     }
						});
					});
				}
			});
		}
	}
});