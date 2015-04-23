jQuery(document).ready(function($){

	$('.startMigrationWizard').live('click', function(e){
		e.preventDefault();
		if($('#dpcMigrationModal').length == 0){
			//<button class="btn btn-primary" id="modalSubmit">'+dpc_dpc_importexport_translator['save']+'</button>
			$('body').append('<div class="modal fade" id="dpcMigrationModal" tabindex="-1" role="dialog" aria-hidden="true" data-keyboard="false" data-backdrop="static"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title" id="dpcMigrationModalLabel">'+dpc_dpc_importexport_translator['Migration wizard']+'</h4></div><div class="loader" style="display:none;"></div><div class="modal-body" id="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">'+dpc_dpc_importexport_translator['close']+'</button></div></div></div></div>');
		}
		$('#dpcMigrationModal #modal-body').html('');
		$('#dpcMigrationModal').modal({ show:true });
		
		$('.loader').show();
      	
      	wizardAdapter = $(this).data('adapter');
      	
		$.ajax({
			url: 'admin-post.php', 
			data: $.extend({}, { action: 'dpc_importexport_migration_wizard', adapter:  wizardAdapter }),
			success: function(response){
				$('.loader').hide();
				$('#dpcMigrationModal #modal-body').append(response);
				applyOnWizard();
			}
		});
		$('#dpcMigrationModal').on('hidden.bs.modal', function () {
	    	$('#dpcMigrationModal #modal-body').html('');
		});
		

	});
		
	function applyOnWizard(){
		//save wizard,
		$('.wizard-warning').html('<div class="col-md-10"><strong>'+dpc_dpc_importexport_translator['Attention']+'!</strong> '+dpc_dpc_importexport_translator['With the completion of the migration wizard, all data previously selected will be overwritten. Are you sure you want to perform this step?']+'</div><div class="col-md-2"> <input type="submit" id="wizardSubmit" class="pull-right btn btn-success" value="'+dpc_dpc_importexport_translator['Yes, continue']+'"/></div>');
		$('#dpcMigrationModal #wizardSubmit').unbind('click').click(function(e){
		    e.preventDefault();
		    formdata = $('#dpcMigrationModal form#migrationWizard').serialize();
		    $('.loader').show();
	      	$('#dpcMigrationModal #modal-body').html('');
			$.ajax({
				url: 'admin-post.php?action=dpc_importexport_migration_execute', 
				data: formdata,
				dataType: 'html',
				success: function(response){
					$('.loader').hide();
					$('#dpcMigrationModal #modal-body').html(response);
				}
			});
		});
		
		//$('.pager.wizard').after('<div class="alert alert-warning migrate-error" role="alert" style="display:none"></div>')
		$(".form-wizard").each(function(i, el){
			$('.pager > li > a').on('click', function(ev){
				ev.preventDefault();
			});
			
			var $this 		= jQuery(el),
				$progress 	= $this.find(".steps-progress div"),
				_index 		= $this.find("> ul > li.active").index();
			
			var metadataCheckbox = $('#migrate-metadata').parents().closest('.icheckbox_square-blue'), 
				settingsCheckbox = $('#migrate-settings').parents().closest('.icheckbox_square-blue');
			
			// Validation
			var checkForward = function(tab, navigation, index){	
				$('.migrate-error').html('').hide();			

				if(index === 1 && !$(settingsCheckbox).hasClass('checked') && $(metadataCheckbox).hasClass('checked')){		//skip settings tab, if settings is not selected
					$('.form-wizard').bootstrapWizard('show',1);
				}else if(index === 2 && !$(metadataCheckbox).hasClass('checked') && $(settingsCheckbox).hasClass('checked')){		//skip metadata tab, if metadata is not selected
					$('.form-wizard').bootstrapWizard('show',3);
				}else if(!$(metadataCheckbox).hasClass('checked') && !$(settingsCheckbox).hasClass('checked')){
					$('.migrate-error').html('<div class="row"><div class="col-md-12">'+dpc_dpc_importexport_translator['Please select at least one option.']+'</div></div>').toggle('show');
					return false;
				}else if(index === 2 && $(settingsCheckbox).hasClass('checked')){		//check empty fields in settings tab
					if($(".step2").find('.icheckbox_square-blue.checked').length > 0){ 
				       	return true;
				   	}else {
				    	$('.migrate-error').html('<div class="row"><div class="col-md-12">'+dpc_dpc_importexport_translator['Please select at least one option.']+'</div></div>').toggle('show');
				    	return false;
				   	}
				   	return false;
				}else if(index === 3 && $(metadataCheckbox).hasClass('checked')){		//check empty fields in metadata tab
					if($(".step3").find('.icheckbox_square-blue.checked').length > 0){ 
				       	return true;
				   	}else {
				    	$('.migrate-error').html('<div class="row"><div class="col-md-12">'+dpc_dpc_importexport_translator['Please select at least one option.']+'</div></div>').toggle('show');
				    	return false;
				   	}
				   	return false;
				}
				
		  		return true;
			};
			var checkBackward = function(tab, navigation, index){			
				if(index === 1 && !$(settingsCheckbox).hasClass('checked') && $(metadataCheckbox).hasClass('checked')){		//skip settings tab, if settings is not selected
					$('.form-wizard').bootstrapWizard('show',0);
				}else if(index === 2 && !$(metadataCheckbox).hasClass('checked') && $(settingsCheckbox).hasClass('checked')){		//skip metadata tab, if metadata is not selected
					$('.form-wizard').bootstrapWizard('show',2);
				} 

		  		return true;
			};
			
			$this.bootstrapWizard({
				tabClass: "", 
				nextSelector: '.dl-next', 
				previousSelector: '.dl-previous',
		  		onTabShow: function($tab, $navigation, index){
					setCurrentProgressTab($this, $navigation, $tab, $progress, index);
					var $total = $navigation.find('li').length;
					var $current = index+1;
					
					//console.log(index)
					
					if($current >= $total) {
						$this.find('.dl-wizard-footer .dl-next').hide();
						$this.find('.dl-wizard-footer .dl-finish').show();
						$this.find('.dl-wizard-footer .dl-finish').removeClass('disabled');
					} else {
						$this.find('.dl-wizard-footer .dl-next').show();
						$this.find('.dl-wizard-footer .dl-finish').hide();
						$('.wizard-warning').hide();
					}
		  		},
		  		onNext: checkForward,
		  		onPrevious: checkBackward,
		  		onTabClick: function(){
					return false;
				}
		  	});
		  	
		  	$this.data("bootstrapWizard").show( _index );
		  	
		  	$('.dl-finish').on('click', function(ev){
				ev.preventDefault();
				$(this).hide();
				$('.wizard-warning').show();
			});
		});
		
		function setCurrentProgressTab($rootwizard, $nav, $tab, $progress, index){
			$tab.prevAll().addClass('completed');
			$tab.nextAll().removeClass('completed');
			
			var items      	  = $nav.children().length,
				pct           = parseInt((index+1) / items * 100, 10),
				$first_tab    = $nav.find('li:first-child'),
				margin        = (1/(items*2) * 100) + '%';//$first_tab.find('span').position().left + 'px';
		
			if( $first_tab.hasClass('active')){
				$progress.width(0);
			}else{
				$progress.width( ((index-1) / (items-1)) * 100 + '%' ); //$progress.width( $tab.prev().position().left - $tab.find('span').width()/2 );
			}
		
			$progress.parent().css({
				marginLeft: margin,
				marginRight: margin
			});
		}
	}

});