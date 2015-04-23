if(typeof(dpc_basic_metadata_settings) != 'undefined'){

	var homeTitle		= '',
		divider			= '',
		websiteTitle	= '',
		settings		= dpc_basic_metadata_settings,
		maxTitleLength	= settings.titleLimit,
		maxDescLength	= settings.descLimit;
		
	jQuery(document).ready(function($){
		$('.title-wrap').each(function(){
			jQuery(this).find('.counter').before('<strong class="input-length green"></strong>');
			countInputTitleLength();
			
			$(this).find('input[type^="text"]').each(function(){
				$(this).keyup(function(){ countInputTitleLength(); });
			})
		});
		
		$('.description-wrap').each(function(){
			jQuery(this).find('.desc-counter').before('<strong class="input-length green"></strong>');
			countInputDescLength();
			
			$(this).find('.desc').each(function(){
				$(this).keyup(function(){ countInputDescLength(); });
			})
		});
		
		$('[name^="dpc[basic_metadata][titleLimit]"]').multiselect({
			onChange: function(option, checked) {
				var selectedTitleLength = $('[name^="dpc[basic_metadata][titleLimit]"] option:selected');			
				maxTitleLength = selectedTitleLength.val();
				countInputTitleLength()
			}
		});
		$('[name^="dpc[basic_metadata][descLimit]"]').multiselect({
			onChange: function(option, checked) {
				var selectedDescLength = $('[name^="dpc[basic_metadata][descLimit]"] option:selected');			
				maxDescLength = selectedDescLength.val();
				countInputDescLength()
			}
		});
	});
	
	function countInputTitleLength(){
		jQuery('.title-wrap').each(function($){
			var homeTitle		= jQuery(this).find('.home-title').val().length,
				divider			= jQuery(this).find('.divider').val().length,
				websiteTitle	= jQuery(this).find('.website-title').val().length,
				inputLength		= homeTitle+divider+websiteTitle;
				diff			= maxTitleLength-inputLength;
				
			jQuery(this).find('.input-length').html(diff);
			if(diff < '20'){
				jQuery(this).find('.green').css('color','red');
			}else{
				jQuery(this).find('.green').css('color', '');
			}
		});
	}
	function countInputDescLength(){ 
		jQuery('.description-wrap').each(function($){
			var descLength	= jQuery(this).find('textarea.desc').val().length,
				diff		= maxDescLength-descLength;
			jQuery(this).find('.input-length').html(diff);
			if(diff < '40'){
				jQuery(this).find('.green').css('color','red');
			}else{
				jQuery(this).find('.green').css('color', '');
			}
			
		});
	}
}