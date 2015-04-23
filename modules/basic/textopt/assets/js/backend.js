var suggestCallBack; // global var for autocomplete jsonp

//Tooltip texts:
// var keywordTooltip		= 'Bitte tragen Sie hier den Begriff oder die Begriffe ein, unter denen dieser Inhalt gefunden werden soll. Dieses Feld dient dazu, dass Sie sich beim Texten auf das entsprechende Thema konzentrieren.',
	// descriptionTooltip	= 'Die Beschreibung dient in erster Linie als Vorschau für die Suchergebnisse von Google (sog. "Meta-Description"). Sie können die Beschreibung aber auch als Einleitung nutzen und über unseren PHP Code in Ihrem Theme sichtbar einbauen (siehe Basic-Einstellungen > Textoptimierung).';
var keywordTooltip		= dpc_basic_textopt_translator.keywordTooltip,	descriptionTooltip	= dpc_basic_textopt_translator.descriptionTooltip;
	
jQuery(document).ready(function ($) {
	// auto fill
	if (typeof dpc_basic_textopt_settings != 'undefined'){
		if (typeof dpc_basic_textopt_settings.autofill != 'undefined' && dpc_basic_textopt_settings.autofill == 'on'){
			 $("#dpc-textopt-keyword").autocomplete({
		        source: function(request, response) {
		            $.getJSON(dpc_basic_textopt_suggest_callback,
		                {
		                  "hl"		: "de", // Language
		                  "jsonp"	: "suggestCallBack", // jsonp callback function name
		                  "q"		: request.term, // query term
		                  "client"	: "youtube" // force youtube style response, i.e. jsonp
		                }
		            );
		            suggestCallBack = function (data) {
		                var suggestions = [];
		                $.each(data[1], function(key, val) {
		                    suggestions.push({"value":val[0]});
		                });
		                suggestions.length = 10; // prune suggestions list to only 5 items
		                response(suggestions);
		            };
		        },
		    });
		}
	}
   
    // position for keyword
    if ($("#dpc-textopt-keyword-box").length > 0){ 
		$("#dpc-textopt-keyword-box").insertBefore("#titlediv") ;
		//append tooltip
		$("#dpc-textopt-keyword-box").append('<span class="dpc-tooltip dpc-keyword" style="display: none;">'+keywordTooltip+'</span>');
	}
    // position for desc
	if ($("#dpc-textopt-description-box").length > 0){
		$("#dpc-textopt-description-box").insertBefore("#postdivrich") ; 
		//append tooltip
		$("#dpc-textopt-description-box").append('<span class="dpc-tooltip dpc-description" style="display: none;">'+descriptionTooltip+'</span>');
	}

	$('#dpc-textopt-keyword-box > h3.hndle').remove();
	$('#dpc-textopt-keyword-box > .handlediv').remove();
	$('input#dpc-textopt-keyword').attr('placeholder', dpc_basic_textopt_translator.keyword)
	$('#dpc-textopt-description-box > h3.hndle').remove();
	$('#dpc-textopt-description-box > .handlediv').remove();
	$('input#dpc-textopt-description').attr('placeholder', dpc_basic_textopt_translator.desc)
	
	$('#titlewrap').append('<div id="dpc-msg-keyword-title"></div>');
	$('#dpc-textopt-description-box .inside').append('<div id="dpc-msg-keyword-description"></div>');
	$('#post-status-info').after('<div id="dpc-msg-keyword-content"></div>');

	
	//Description
	$("input#dpc-textopt-keyword").focusin(function(){
		$('.dpc-tooltip.dpc-keyword').show();
	}).focusout(function(){
		$('.dpc-tooltip.dpc-keyword').hide();
	})
	
	$("input#dpc-textopt-description").focusin(function(){
		$('.dpc-tooltip.dpc-description').show();
	}).focusout(function(){
		$('.dpc-tooltip.dpc-description').hide();
	})
	
	

	var DpcTextOpt = function (keyword, title, desc, content){
		this.keyword		= keyword;
		this.title			= title;
		this.desc			= desc;
		this.content		= content;
		this.isCheckTitle 	= false;
		this.isCheckDesc 	= false;
		this.isCheckContent = false;
		
		if (typeof dpc_basic_textopt_settings.keyword != 'undefined'){
			this.isCheckTitle 	= dpc_basic_textopt_settings.keyword.indexOf('title') == -1 		? false : true;
			this.isCheckDesc 	= dpc_basic_textopt_settings.keyword.indexOf('description') == -1 ? false : true;
			this.isCheckContent	= dpc_basic_textopt_settings.keyword.indexOf('content') == -1 	? false : true;
			
		}
		
		this.checkTitle = function (){
			if (this.isCheckTitle){
				if (this.doCheckText(this.keyword, this.title)){
					$("#dpc-keyword-in-title").html('<div class="notice notice-success" role="alert"><div class="entry"><strong><div class="dashicons dashicons-yes" data-code="f335"></div>' + dpc_basic_textopt_translator.title + '</strong></div></div>');
					$('#dpc-msg-keyword-title').html('<div class="alert alert-success" role="alert"><div class="entry"><strong><div class="dashicons dashicons-yes" data-code="f335"></div> ' + dpc_basic_textopt_translator.super + '! </strong>' + dpc_basic_textopt_translator.keyword + ' <strong>"'+this.keyword+'"</strong> ' + dpc_basic_textopt_translator.inTitle + '.</div></div>');
					$('#title').addClass("input-success").removeClass('input-warning');
				}else{
					$("#dpc-keyword-in-title").html('<div class="notice notice-warning" role="alert"><div class="entry"><strong><div class="dashicons dashicons-no-alt" data-code="f335"></div>' + dpc_basic_textopt_translator.title + '</strong></div></div>');
					$('#dpc-msg-keyword-title').html('<div class="alert alert-warning" role="alert"><div class="entry"><strong><div class="dashicons dashicons-no-alt" data-code="f335"></div> ' + dpc_basic_textopt_translator.warn + ': </strong>' + dpc_basic_textopt_translator.keyword + ' <strong>"'+this.keyword+'"</strong> ' + dpc_basic_textopt_translator.notInTitle + '.</div></div>');
					$('#title').addClass("input-warning").removeClass('input-success');
				}
			}
		}
		
		this.checkDescription = function(){
			if (this.isCheckDesc){ 
				if(this.doCheckText(this.keyword, this.desc)){
					$('#dpc-keyword-in-description').html('<div class="notice notice-success" role="alert"><div class="entry"><strong><div class="dashicons dashicons-yes" data-code="f335"></div>' + dpc_basic_textopt_translator.desc + '</strong></div></div>');
					$('#dpc-msg-keyword-description').html('<div class="alert alert-success" role="alert"><div class="entry"><strong><div class="dashicons dashicons-yes" data-code="f335"></div> ' + dpc_basic_textopt_translator.super + '! </strong>' + dpc_basic_textopt_translator.keyword + ' <strong>"'+this.keyword+'"</strong> ' + dpc_basic_textopt_translator.inDesc + '.</div></div>');
					$('#dpc-textopt-description').addClass("input-success").removeClass('input-warning');
					
				}else{
					$('#dpc-keyword-in-description').html('<div class="notice notice-warning" role="alert"><div class="entry"><strong><div class="dashicons dashicons-no-alt" data-code="f335"></div>' + dpc_basic_textopt_translator.desc + '</strong></div></div>');
					$('#dpc-msg-keyword-description').html('<div class="alert alert-warning" role="alert"><div class="entry"><strong><div class="dashicons dashicons-no-alt" data-code="f335"></div> ' + dpc_basic_textopt_translator.warn + ': </strong>' + dpc_basic_textopt_translator.keyword + ' <strong>"'+this.keyword+'"</strong> ' + dpc_basic_textopt_translator.notInDesc + '.</div></div>');
					$('#dpc-textopt-description').addClass("input-warning").removeClass('input-success');
				}
			}
		}
		
		this.checkContent = function(){
			if (this.isCheckContent){
				if(this.doCheckText(this.keyword, this.content)){
					$('#dpc-keyword-in-content').html('<div class="notice notice-success" role="alert"><div class="entry"><strong><div class="dashicons dashicons-yes" data-code="f335"></div>' + dpc_basic_textopt_translator.content + '</strong></div></div>');
					$('#dpc-msg-keyword-content').html('<div class="alert alert-success" role="alert"><div class="entry"><strong><div class="dashicons dashicons-yes" data-code="f335"></div> ' + dpc_basic_textopt_translator.super + '! </strong>' + dpc_basic_textopt_translator.keyword + ' <strong>"'+this.keyword+'"</strong> ' + dpc_basic_textopt_translator.inContent + '.</div></div>');
					$('iframe#content_ifr').addClass("input-success").removeClass('input-warning');
				}else{
					$('#dpc-keyword-in-content').html('<div class="notice notice-warning" role="alert"><div class="entry"><strong><div class="dashicons dashicons-no-alt" data-code="f335"></div>' + dpc_basic_textopt_translator.content + '</strong></div></div>');
					$('#dpc-msg-keyword-content').html('<div class="alert alert-warning" role="alert"><div class="entry"><strong><div class="dashicons dashicons-no-alt" data-code="f335"></div> ' + dpc_basic_textopt_translator.warn + ': </strong>' + dpc_basic_textopt_translator.keyword + ' <strong>"'+this.keyword+'"</strong> ' + dpc_basic_textopt_translator.notInContent + '.</div></div>');
					$('iframe#content_ifr').addClass("input-warning").removeClass('input-success');
				}
			}
			
		}
		
		this.doCheckText = function (str, text){
			if (typeof str == 'undefined' || str == '') 
				return false;
			
			var pattern = new RegExp("[\\s\\<\\>]"+ str +"[\\s\\<\\>]", "i");
			return pattern.test(' ' + text + ' ');
		}
	}
	
	if ($("#dpc-textopt-keyword").length > 0){
		var dpcTextOpt = new DpcTextOpt($("#dpc-textopt-keyword").val(),
				$("input[name='post_title']").val(),
				$("#dpc-textopt-description").val(),
				$("textarea#content").val()
					);
		if (dpcTextOpt.keyword != ''){
			dpcTextOpt.checkTitle();
			dpcTextOpt.checkDescription();
			dpcTextOpt.checkContent();
		}
		
		// change event for title, description, content
		$("#dpc-textopt-keyword").keyup(function(){			
			clearTimeout($.data(this, 'timing'));
			var timing = setTimeout(function(){
				dpcTextOpt.keyword = $("#dpc-textopt-keyword").val();
				dpcTextOpt.checkTitle();
				dpcTextOpt.checkDescription();
				dpcTextOpt.checkContent();
				}, 2000);
			$(this).data('timing', timing);
		});
		
		$("input[name='post_title']").keyup(function(){
			clearTimeout($.data(this, 'timing'));
			var timing = setTimeout(function(){
				dpcTextOpt.title = $("input[name='post_title']").val();
				dpcTextOpt.checkTitle();
				}, 2000);
			$(this).data('timing', timing);
		});
		
		$("#dpc-textopt-description").keyup(function(){
			clearTimeout($.data(this, 'timing'));
			var timing = setTimeout(function(){
				dpcTextOpt.desc = $("#dpc-textopt-description").val();
				dpcTextOpt.checkDescription();
				}, 2000);
			$(this).data('timing', timing);
		});
		
		//console.log(tinymce);
		if (typeof tinymce != 'undefined'){
			if (null == tinymce.activeEditor){
				if (tinymce.majorVersion == '4'){
					tinymce.on('addEditor', function(e){
						e.editor.on('keyup', function(e){
							clearTimeout($.data(this, 'timing'));
							var timing = setTimeout(function(){
								dpcTextOpt.content = tinymce.activeEditor.getContent({format: 'text'});
								dpcTextOpt.checkContent();
								}, 2000);
							$(this).data('timing', timing);
						});
					});
				}else{
					tinyMCE.onAddEditor.add(function(mgr,ed) {
						ed.onKeyUp.add(function(){
							clearTimeout($.data(this, 'timing'));
							var timing = setTimeout(function(){
								dpcTextOpt.content = tinymce.activeEditor.getContent({format: 'text'});
								dpcTextOpt.checkContent();
								}, 2000);
							$(this).data('timing', timing);
						});
					});
				}
			}
		}
		
		
		
	}
});

