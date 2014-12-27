$('#logout').click(function () {
	CurrentUser = null;
});

$(function() {
	if (typeof CurrentUser != 'undefined' || typeof CurrentFrom != 'undefined') {
		$('#logout').removeClass('hidden');
	};

	if (window.location.pathname == '/chat') {
		$('#back').removeClass('hidden');
	}
});