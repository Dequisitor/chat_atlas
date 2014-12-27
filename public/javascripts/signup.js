$(function() {

	$('form.signup').submit(function () {
		var pwd0 = $('#pwd0').val();
		var pwd1 = $('#pwd1').val();

		if (pwd0 != pwd1) {
			var field = document.getElementById('pwd1');
			field.setCustomValidity('Passwords do not match.');
			return false;
		}

		return true;
	});

});