jQuery(document).ready(function($){
	var dpcBasicMetadata = new DpcBasicMetadata();
	
	$('#titlediv input[name="post_title"]').each(function(){
		dpcBasicMetadata.titleCounter();
		dpcBasicMetadata.titleDuplicate()
		
		jQuery(this).keyup(function(){			
			clearTimeout($.data(this, 'titleCounter'));
			var titleCounter = setTimeout(function(){dpcBasicMetadata.titleCounter();}, 300);
			$(this).data('titleCounter', titleCounter);
			
			clearTimeout($.data(this, 'titleDuplicate'));
			var titleDuplicate = setTimeout(function(){dpcBasicMetadata.titleDuplicate();}, 2000);
			$(this).data('titleDuplicate', titleDuplicate);
		});
	});
	
	$('#dpc-textopt-description').each(function(){
		dpcBasicMetadata.descCounter();
		dpcBasicMetadata.descDuplicate();
		
		$(this).keyup(function(){
			clearTimeout(jQuery.data(this, 'descCounter'));
			var descCounter = setTimeout(function(){dpcBasicMetadata.descCounter();}, 300);
			$(this).data('descCounter', descCounter);
			
			clearTimeout(jQuery.data(this, 'descDuplicate'));
			var descDuplicate = setTimeout(function(){dpcBasicMetadata.descDuplicate();}, 2000);
			$(this).data('descDuplicate', descDuplicate);
		});
	});

});

var DpcBasicMetadata = function(){
	this.lang 	 = dpc_lang;
	this.jTitle = null;
	this.jDesc  = null;
	
	this.init = function(){		
		this.lang = (typeof icl_this_lang != 'undefined') ? icl_this_lang : this.lang;	
		this.jTitle = jQuery('#titlediv input[name="post_title"]');
		this.jDesc	= jQuery('#dpc-textopt-description');
		
		jQuery('#titlediv input[name="post_title"]').after('<div id="dpc-basic-metadata-title-counter" class="dpc-wp-counter"></div><div id="dpc-basic-metadata-title-duplicate"></div>');
		jQuery('#dpc-textopt-description').after('<div id="dpc-basic-metadata-desc-counter" class="dpc-wp-counter"></div><div id="dpc-basic-metadata-desc-duplicate"></div>');
	}
	
	this.urlparam = function(name){
		var results = new RegExp('[\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
	    if (results != null){
	    	return results[1];
	    }else{
	    	return 0;
	    }
	}
	
	this.titleCounter = function(){
		if (typeof dpc_basic_metadata_settings[this.lang] != 'undefined'){
			var jCounter = jQuery('#dpc-basic-metadata-title-counter');
			var limiter  = dpc_basic_metadata_settings.titleLimit;
			limiter		-= typeof dpc_basic_metadata_settings[this.lang]['title']['delimiter'] 	!= 'undefind' ? dpc_basic_metadata_settings[this.lang]['title']['delimiter'].length : 0;
			limiter 	-= typeof dpc_basic_metadata_settings[this.lang]['title']['website'] 	!= 'undefind' ? dpc_basic_metadata_settings[this.lang]['title']['website'].length 	: 0;
			
			jCounter.html('');
			if (limiter < this.jTitle.val().length){
				jCounter.css('color', 'red');
				jCounter.append('<span>' + (this.jTitle.val().length - limiter) + ' ' + dpc_basic_metadata_translator.tooMuchChars + '</span>');
			}else{
				jCounter.css('color', '#5eb861');
				jCounter.append('<span>' + (limiter - this.jTitle.val().length) + ' ' + dpc_basic_metadata_translator.remainChars +  '</span>');
			}
		}
	}
	
	this.titleDuplicate = function(){
		if (typeof dpc_basic_metadata_settings[this.lang] != 'undefined'){
			if (typeof dpc_basic_metadata_settings.duplicates != 'undefined' && dpc_basic_metadata_settings.duplicates == 'on'){
				var jDuplicate = jQuery('#dpc-basic-metadata-title-duplicate');
				var postId = this.urlparam('post');
				var self = this;
				if (this.jTitle.val() != ''){
					jDuplicate.html('');
					jQuery.post(
						    'admin-post.php',
						    {'action': 'dpc-metadata-check-duplicate-title', 'title': this.jTitle.val(), 'exclusive-id': postId},
						    function (data, textStatus){
						    	if (data.hasDuplicate){
						    		//self.jTitle.css('color', '#f00');
						    		jDuplicate.append('<div class="alert alert-warning" role="alert"><div class="entry"><strong><div class="dashicons dashicons-no-alt"></div> '+dpc_basic_metadata_translator.warning+': </strong>' + dpc_basic_metadata_translator.duplicateTitle + '! <strong><a target="_blank" href="' + data.posts.url + '">' + dpc_basic_metadata_translator.withPost + '</a></strong></div></div>');
						    	}
						    },
						    'json'
						);
				}
				
			}		
		}
	}
	
	this.descCounter = function(){
		if (typeof dpc_basic_metadata_settings[this.lang] != 'undefined'){
			var jCounter  = jQuery('#dpc-basic-metadata-desc-counter');
			var limiter   = dpc_basic_metadata_settings.descLimit;

			jCounter.html('');
			
			if (limiter < this.jDesc.val().length){
				jCounter.css('color', '#f00');
				jCounter.append('<span>' + (this.jDesc.val().length - limiter) + ' ' + dpc_basic_metadata_translator.tooMuchChars + '</span>');
			}else{
				jCounter.css('color', '#5eb861');
				jCounter.append('<span>' + (limiter - this.jDesc.val().length ) + ' ' + dpc_basic_metadata_translator.remainChars + '</span>');
			}
		}
	}
	
	this.descDuplicate = function(){
		if (typeof dpc_basic_metadata_settings[this.lang] != 'undefined'){		
			if (typeof dpc_basic_metadata_settings.descDuplicates != 'undefined' && dpc_basic_metadata_settings.descDuplicates == 'on'){
				var postId = this.urlparam('post');
				var jDuplicate = jQuery('#dpc-basic-metadata-desc-duplicate');
				if (this.jDesc.val() != ''){
					var self = this;
					jDuplicate.html('');
					jQuery.post(
						    'admin-post.php',
						    {'action': 'dpc-metadata-check-duplicate-description', 'description': jQuery('#dpc-textopt-description').val(), 'exclusive-id': postId},
						    function (data, textStatus){
						    	if (data.hasDuplicate){
						    		self.jDesc.css('color', '#f00');
						    		jDuplicate.append('<div class="alert alert-warning" role="alert"><div class="entry"><strong><div class="dashicons dashicons-no-alt"></div> '+dpc_basic_metadata_translator.warning+': </strong>' + dpc_basic_metadata_translator.duplicateDesc + '! <strong><a target="_blank" href="' + data.posts.url + '">' + dpc_basic_metadata_translator.withPost + '</a></strong></div></div>');
						    		//jDuplicate.append('<span style="color:red">Duplikat existiert. <a style="color:red" href="' + data.posts.url + '">ID ' + data.posts.id + '</a></span>');
						    	}
						    },
						    'json'
						);
				}
				
			}
		}
	}
	
	this.init();
}


