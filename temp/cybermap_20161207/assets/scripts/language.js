$(function(){


	$("*[data-lang]").bind("click", function(e){
		e.stopPropagation();
		e.preventDefault();
		var lang = $(this).data("lang");
		var url = window.location.href+"?lang="+lang;
		url = url.replace("/#?", "/?");
		window.location = url;

	})


	$("*[data-lang]").each(function(){
		var $this = $(this);
		if($this.data("lang") == window.lang.lang())$this.addClass("active");
		else $this.removeClass("active");


	});

	$("#country-select").bind("mouseover", function(){
		$(this).find("ul").css("display", "block");
		$("#country-select").find(".arrow").hide();
	}).bind("mouseout", function(){
		$(this).find("ul").css("display", "none");
		$("#country-select").find(".arrow").show();
	});
});