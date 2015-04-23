jQuery(document).ready(function($) {
	var se = '', sitemapType = '';
	$('body').append('<div class="modal fade" id="sitemapModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title" id="myModalLabel"></h4></div><div class="loader" style="display:none;"></div><div class="modal-body" id="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Ok</button></div></div></div></div>');
	
	$('#sitemapModal').on('shown.bs.modal', function () {
		$('#myModalLabel').html(capFl(se));
		$('.loader').show();
		$('#modal-body').append('<iframe id="sitemapIframe"></iframe>')
		$('#sitemapIframe').prop('src', 'admin-post.php?action=dpc_basic_sitemap_notify&notify='+se+'&type='+sitemapType).css('width', '100%').css('height', '200px');
			
		$('#sitemapIframe').on('load', function(){
			$('.loader').hide();
		});
    });
    $('#sitemapModal').on('hidden.bs.modal', function () {
    	$('#sitemapIframe').remove();
	});
	
	$('button.btn-sitemap').click(function(e){
		e.preventDefault();
		id = $(this).attr('id'); 
		if (id && id.indexOf('dpc-basic-sitemap-button-') == 0){
			e.preventDefault();
			var sitemap = id.replace('dpc-basic-sitemap-button-', '').split('-');
			
			if (sitemap.length == 2){
				se = sitemap[1];
				sitemapType = sitemap[0];
				$('#sitemapModal').modal({show:true});				
			}
		}
		
	});
	
	/*
	 * Deactivate sitemap buttons
	 */
	if($('#site-noindex').length){
		$('body').children().find('.col-md-12.dpc-section.basic_sitemaps.general').addClass('buttons-inactive');
	}
});
function capFl(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}