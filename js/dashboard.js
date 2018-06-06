
$(document).ready(function(){


	$("#list-view-btn").click(function() {
		$("#prompt").fadeOut();
		$("#map-view-text").fadeOut();
		$("#items-listed-div").delay(500).fadeIn("slow");

	});


	$("#map-view-btn").click(function() {
		$("#prompt").fadeOut();
		$("#items-listed-div").fadeOut();
		$("#map-view-text").delay(500).fadeIn("slow");

	});



})