function applyJs(){
	function reIndexExtendable(){
		if(!jQuery('.dpc-draft').nextAll('.extendable').length){ return; }
		jQuery('.dpc-draft').each(function(){
			jQuery(this).nextAll('.extendable').each(function(k, extendableArea){
				jQuery('[name]', extendableArea).each(function(){
					jQuery(this).attr('name', jQuery(this).attr('name').replace(/[(\d)]/, k));
				});
			});
		});
	}
	
	/**
	 * Default settings opt-in
	 */
	if(jQuery('.install-defaults').length > 0){
		jQuery('.install-defaults').bind('click', function(ev){
			ev.preventDefault();
			var $this = jQuery(this);
			
			jQuery('body').append('<div class="modal fade" id="dpcDefaultsOptin" tabindex="-1" role="dialog" aria-hidden="true" data-keyboard="false" data-backdrop="static"><div class="modal-dialog"><div class="modal-content">'
								+'<div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">'+dpc_main_translator['cancel']+'</span></button>'
								+'<h4 class="modal-title" id="myModalLabel">'+dpc_main_translator['are_you_sure']+'?</h4></div><div class="modal-body" id="modal-body"><h4>'+dpc_main_translator['install_defaults_modal_head']+'?</h4><p>'+dpc_main_translator['install_defaults_modal_content']+'.</p></div>'
								+'<div class="modal-footer"><button type="button" class="btn btn-danger" data-dismiss="modal">'+dpc_main_translator['cancel']+'</button>	<button type="submit" class="btn btn-success" id="modalSubmit" value="'+$this.val()+'" name="'+$this.attr('name')+'">'+dpc_main_translator['install_defaults']+'</button></div></div></div></div>');
			jQuery('#dpcDefaultsOptin').modal({ show:true });			
			
			var postdata = {};
				postdata['dpc']																= {};
				postdata['dpc']['install_defaults'] 										= {};
				postdata['dpc']['install_defaults'][$this.data('module')] 					= $this.val();
				postdata['dpc'][$this.data('module')]										= {};
				postdata['dpc'][$this.data('module')]['dpc_status_' + $this.data('module')] = ($this.data('module_status') ? $this.data('module_status') : '');
			
			jQuery('#modalSubmit').bind('click', function(ev){
				jQuery.ajax({
					type: 'POST',
					url: '?', 
					data: postdata,
					success: function(response){
						window.location = window.location.href;
						window.location.reload();
					}		
				});	
			});
			
		});
	}
	
	/**
	 * Image file input
	 */
	if(jQuery('.dpc-fileinput').length > 0){
		
		jQuery('.dpc-fileinput').each(function(){
			if(jQuery(this).children().find('.dpc-fileinput-input').val()){
				jQuery(this).removeClass('fileinput-new');
			}
		});

		jQuery('.dpc-file-upload-button').live('click', function( event ){
			event.preventDefault();
			startMediaBrowser(jQuery(this));
		});
		jQuery('.upload-dpc-file').live('click', function( event ){
			event.preventDefault();
			startMediaBrowser(jQuery(this));
		});
		jQuery('.remove-dpc-file').live('click', function( event ){
			event.preventDefault();
			var name 	= jQuery(this).data('name'),
				wrapper = jQuery(this).parents().closest('.dpc-fileinput'),
				holder	= jQuery(wrapper).find('img.dpc-file-holder');
				input 	= jQuery('input#'+name);
				
			jQuery(input).val('');
         	jQuery(holder).attr('src', '');
         	jQuery(wrapper).addClass('fileinput-new');
		});
		
		function startMediaBrowser(data){
			var name 	= jQuery(data).data('name'),
				wrapper = jQuery(data).parents().closest('.dpc-fileinput'),
				holder	= jQuery(wrapper).find('img.dpc-file-holder'),
				input =	jQuery('.dpc-media-uploader > input#'+name);
				
			jQuery(input).val('');
			
	      	//If the frame already exists, reopen it
			if (typeof(custom_file_frame)!=="undefined") {
		      	custom_file_frame.close();
			}
			
	      	custom_file_frame = wp.media.frames.customHeader = wp.media({
	         	title: jQuery(data).data('frame-title'),
	        	library: {
	            	type: 'image'
	         	},
	         	button: {
	            	text: "Speichern"
				},
				multiple: false
			});
	 
	      	//callback for selected image
			custom_file_frame.on('select', function() {
				var 	attachment = custom_file_frame.state().get('selection').first().toJSON();
	         			
	         	jQuery(input).val(attachment.url);
	         	jQuery(holder).attr('src', attachment.url);
	         	jQuery(wrapper).removeClass('fileinput-new');
			});
			custom_file_frame.open();
		}
	}
	
	/*
	 * Nav
	 */
	jQuery("#nav > .container > .navbar-collapse > ul > li > a.menu-anchor").on('click', function() {
		var scrollTo = jQuery(this).data('scroll');
	    jQuery('html, body').animate({
	        scrollTop: jQuery('#wpbody-content').find('#'+scrollTo).offset().top - 98
	    }, 1000);
	    return false;
	});
	jQuery('.dpc-submit').click(function(e){
		e.preventDefault();
		reIndexExtendable();
		jQuery('.dpc-draft').remove();
		jQuery(this).parents('form').submit();
	});
	
	/**
	 * Close Popover 
	 */
	jQuery('html').on('click', function(e) {
		if (typeof jQuery(e.target).data('original-title') == 'undefined' && !jQuery(e.target).parents().is('[data-toggle="popover"]')) {
	    	jQuery('[data-original-title]').popover('hide');
	  	}
	});

	jQuery('.dpc-extendable-add').live('click', function(e){
		e.preventDefault();
		draft = jQuery(jQuery(this).data('container'));
		jQuery(this).before(jQuery(draft).clone().removeClass('dpc-draft'));
		
		if(jQuery(this).prev().has('.timepicker')){
			jQuery('.timepicker input', jQuery(this).prev()).timepicker({
				template: "dropdown",
				minuteStep: 5,
				showInputs: false,
				disableFocus: true
			});
		}
		
		if(jQuery(this).prev().has('select')){
			jQuery('select', jQuery(this).prev()).next().remove();
			jQuery('select', jQuery(this).prev()).multiselect();
		}
	});
		
	jQuery('.dpc-extendable-remove').live('click', function(e){
		e.preventDefault();
		jQuery(this).parent().fadeOut(function(){ 
			jQuery(this).remove(); 
		});
	});
	
	
	/* elementabhängigkeiten */
	jQuery('.hideControls').each(function(){			
		var controlArea 	= jQuery(this);
		var triggerValue	= jQuery(this).data('display-value');

		if(jQuery('[name="'+jQuery(this).data('display-element')+'"]').length){
			var triggerElement 	= jQuery('[name="'+jQuery(this).data('display-element')+'"]');
		} else if(jQuery('[name="'+jQuery(this).data('display-element')+'[]"]').length) {
			var triggerElement 	= jQuery('[name="'+jQuery(this).data('display-element')+'[]"]');
		} else {
			console.log('nothing found to trigger on element:'+ jQuery(this).data('display-element'));
			return;
		}
		
		if(typeof(jQuery(this).data('display-value')) !== 'undefined'){
			triggerElement.change(function(){
				if(jQuery.inArray(triggerValue, jQuery(this).val())  !== -1 || jQuery(this).val() == triggerValue){ controlArea.show().css('display', 'inline-block'); } else { controlArea.hide(); }
			});
					
			if(jQuery('[name="'+jQuery(this).data('display-element')+'"]').attr('type') == 'checkbox'){
				if(jQuery('[name="'+jQuery(this).data('display-element')+'"]').attr('checked') == 'checked'){
					if(triggerValue == ''){
						controlArea.show().css('display', 'none');
					} else {
						controlArea.show().css('display', (jQuery(controlArea).data('display-type').length ? jQuery(controlArea).data('display-type') : 'inline-block'));
					}
				} else {
					if(triggerValue == ''){
						controlArea.show().css('display', (jQuery(controlArea).data('display-type').length ? jQuery(controlArea).data('display-type') : 'inline-block'));
					} else {
						controlArea.show().css('display', 'none');
					}
				}
				
				jQuery('[name="'+jQuery(this).data('display-element')+'"]').on('ifChanged', function(event){
					jQuery(this).on('ifChecked', function(event){
						if(triggerValue == ''){
							controlArea.show().css('display', 'none');
						} else {
							controlArea.show().css('display', (jQuery(controlArea).data('display-type').length ? jQuery(controlArea).data('display-type') : 'inline-block'));
						}
					});
					jQuery(this).on('ifUnchecked', function(event){
						if(triggerValue == ''){
							controlArea.show().css('display', (jQuery(controlArea).data('display-type').length ? jQuery(controlArea).data('display-type') : 'inline-block'));
						} else {
							controlArea.show().css('display', 'none');
						}
					});
				});
			}
		}else if(typeof(jQuery(this).data('display-searchvalue')) !== 'undefined'){
			var triggerValue = jQuery(this).data('display-searchvalue');
			jQuery(triggerElement).on('keyup paste', function(e){
				if(triggerElement.val().search(triggerValue) == '-1'){
					controlArea.show().css('display', 'none');
				} else {
					controlArea.show().css('display', (jQuery(controlArea).data('display-type').length ? jQuery(controlArea).data('display-type') : 'inline-block'));
				}
			});
			//on init
			if(triggerElement.val().search(triggerValue) == '-1'){
				controlArea.show().css('display', 'none');
			} else {
				controlArea.show().css('display', (jQuery(controlArea).data('display-type').length ? jQuery(controlArea).data('display-type') : 'inline-block'));
			}
		}
	});
	
	/**
	 * Module config toggle
	 */
	jQuery(".row.status").each(function(){
		var toggleButton 	= jQuery('.toggle-section', this),
			section			= jQuery(this).parent();
		jQuery(this).nextAll().wrapAll('<div class="dpc-config-wrap" />');
		if(jQuery(this).data('status') === 'inactive'){
			jQuery('.dpc-config-wrap', jQuery(this).parents('.dpc-section')).hide();
		}
		toggleButton.click(function(){
			if(jQuery(this).hasClass('toggle-hide')){
				jQuery('.dpc-config-wrap', jQuery(this).parents('.dpc-section')).hide(function(){
					toggleButton.removeClass('toggle-hide').addClass('toggle-show');
				});
			} else {
				jQuery('.dpc-config-wrap', jQuery(this).parents('.dpc-section')).show(function(){
					toggleButton.removeClass('toggle-show').addClass('toggle-hide');
				});
			}
		});
	});
	
	/**
	 * Toggle button show/hide section
	 */
	jQuery('.toggle-button').on('click', function(){
		var toggleBtn	= jQuery(this).attr('data-toggle'),
			row 		= jQuery('#wpbody-content').find('.'+toggleBtn).closest('.row'),
			section 	= jQuery(this).parents().closest('.toggle-row');
		if(row.css('display') == 'none'){
			jQuery(section).addClass('active-row');
			// jQuery(section).siblings().removeClass('active-row');
			jQuery(this).children('#toggle-icon').removeClass('fa-plus').addClass('fa-minus');
			jQuery(row).toggle('show').addClass('toggle-active-row');
			// jQuery(row).siblings().toggle('hide');
		}else{
			jQuery(section).removeClass('active-row');
			jQuery(this).children('#toggle-icon').removeClass('fa-minus').addClass('fa-plus');
			jQuery(row).toggle('hide').removeClass('toggle-active-row');;
		}
	})
	jQuery('.toggle-button-col').on('click', function(){
		var toggle		= jQuery(this).attr('data-toggle'),
			toggleCol	= jQuery('#wpbody-content').find('#'+toggle);
		if(toggleCol.css('display') == 'none'){
			jQuery(toggleCol).addClass('active-col');
			jQuery(this).parents().closest('.toggle-head').addClass('active');
			jQuery(this).children('#toggle-icon').removeClass('fa-plus').addClass('fa-minus');
			jQuery(toggleCol).toggle('show');
		}else{
			jQuery(toggleCol).removeClass('active-col');
			jQuery(this).parents().closest('.toggle-head').removeClass('active');
			jQuery(this).children('#toggle-icon').removeClass('fa-minus').addClass('fa-plus');
			jQuery(toggleCol).toggle('hide');
		}
	});
	
	/**
	 *  TABS 
	*/
	jQuery('.dpc-tabs').each(function(){
		jQuery('a', this).click(function (e) {
			e.preventDefault();
			jQuery(this).tab("show");
		});
	});
	jQuery(".dpc-tabs a:first").tab("show");
	
	/**
	 *Tooltip 
	 */
	jQuery('.tooltip-toggle').tooltip()
	
	/**
	 * Sortable sections
	 */
	jQuery('.tosort').each(function(){
		jQuery(this).sortable({
	  		items: '.sortable',
	  		handle: '.input-group-addon'
		});
	});
	jQuery('.tosort-row').sortable({
		items: '.toggle-row',
	});
	
	/**
	 * 
	 * Colorpicker
	 */
	if(jQuery('.color-picker').length > 0){
		jQuery(".color-picker > input").colorpicker().on('changeColor', function(ev){
			jQuery(this).parents().closest('.color-picker').find('.input-group-addon > i').css('color',ev.color.toHex());
		}).on('create', function(ev){
			jQuery(this).parents().closest('.color-picker').find('.input-group-addon > i').css('color',jQuery(this).val());
		});
	}
	
	
	var keys     = [];
    var konami  = '38,38,40,40,37,39,37,39';
    
    jQuery(document).keydown(function(e) {
    	keys.push( e.keyCode );
		if ( keys.toString().indexOf( konami ) >= 0 ){
			jQuery('#wpbody').jGravity({target: '.dpc-section',
                   ignoreClass: 'ignoreMe',
                   weight: 25,
                   depth: 5,
                   drag: true});
			keys = [];
		}
	});
}

jQuery(document).ready(function(){
	applyJs();
	jQuery('.dpc-section .toggle-section').click(function(e){
		dataModule = jQuery(this).data('module');
		dataStatus = jQuery(this).hasClass('toggle-hide') ? 0 : 1;
		jQuery.ajax({
			type: 'POST',
			url: 'admin-post.php',
			async: true,
			data: {action: 'dpc_save_toggle_state', module: dataModule, status: dataStatus}
		});
	});

}).ajaxComplete(function(){

	/* elementabhängigkeiten */
	jQuery('#dpcSuiteManagerModal .hideControls, #dpcMigrationModal .hideControls, .dpcAjaxContent .hideControls').each(function(){			
		var controlArea 	= jQuery(this);
		var triggerValue	= jQuery(this).data('display-value');

		if(jQuery('[name="'+jQuery(this).data('display-element')+'"]').length){
			var triggerElement 	= jQuery('[name="'+jQuery(this).data('display-element')+'"]');
		} else if(jQuery('[name="'+jQuery(this).data('display-element')+'[]"]').length) {
			var triggerElement 	= jQuery('[name="'+jQuery(this).data('display-element')+'[]"]');
		} else {
			console.log('nothing found to trigger on element:'+ jQuery(this).data('display-element'));
			return;
		}
		
		if(typeof(jQuery(this).data('display-value')) !== 'undefined'){
			triggerElement.change(function(){
				if(jQuery.inArray(triggerValue, jQuery(this).val())  !== -1 || jQuery(this).val() == triggerValue){ controlArea.show().css('display', 'inline-block'); } else { controlArea.hide(); }
			});
			
			if(jQuery('[name="'+jQuery(this).data('display-element')+'"]').attr('type') == 'checkbox'){
				//init
				if(jQuery('[name="'+jQuery(this).data('display-element')+'"]').attr('checked') == 'checked'){
					if(triggerValue == ''){
						controlArea.show().css('display', 'none');
					} else {
						controlArea.show().css('display', (jQuery(controlArea).data('display-type').length ? jQuery(controlArea).data('display-type') : 'inline-block'));
					}
				} else {
					if(triggerValue == ''){
						controlArea.show().css('display', (jQuery(controlArea).data('display-type').length ? jQuery(controlArea).data('display-type') : 'inline-block'));
					} else {
						controlArea.show().css('display', 'none');
					}
				}
				
				jQuery('[name="'+jQuery(this).data('display-element')+'"]').on('ifChanged', function(event){
					jQuery(this).on('ifChecked', function(event){
						if(triggerValue == ''){
							controlArea.show().css('display', 'none');
						} else {
							controlArea.show().css('display', (jQuery(controlArea).data('display-type').length ? jQuery(controlArea).data('display-type') : 'inline-block'));
						}
					});
					jQuery(this).on('ifUnchecked', function(event){
						if(triggerValue == ''){
							controlArea.show().css('display', (jQuery(controlArea).data('display-type').length ? jQuery(controlArea).data('display-type') : 'inline-block'));
						} else {
							controlArea.show().css('display', 'none');
						}
					});
				});
			} else if(jQuery('[name="'+jQuery(this).data('display-element')+'"]').is('select')){
				//several selects in modal
				if(triggerValue == jQuery('[name="'+jQuery(this).data('display-element')+'"]').val()){
					controlArea.show().css('display', (jQuery(controlArea).data('display-type').length ? jQuery(controlArea).data('display-type') : 'inline-block'));
				} else {
					controlArea.show().css('display', 'none');
				}
			}
		} else if(typeof(jQuery(this).data('display-searchvalue')) !== 'undefined'){
			var triggerValue = jQuery(this).data('display-searchvalue');
			jQuery(triggerElement).on('keyup paste', function(e){
				if(triggerElement.val().search(triggerValue) == '-1'){
					controlArea.show().css('display', 'none');
				} else {
					controlArea.show().css('display', (jQuery(controlArea).data('display-type').length ? jQuery(controlArea).data('display-type') : 'inline-block'));
				}
			});
			//on init
			if(triggerElement.val().search(triggerValue) == '-1'){
				controlArea.show().css('display', 'none');
			} else {
				controlArea.show().css('display', (jQuery(controlArea).data('display-type').length ? jQuery(controlArea).data('display-type') : 'inline-block'));
			}
		}
	});
});