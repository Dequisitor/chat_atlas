$(function () {
	var allUsers = [];
	$.get('/users', function (data) {
		allUsers = data;

		$.get('/unread_messages/'+CurrentUser, function (msg_count) {

			allUsers.forEach(function (user) {
				if (user.name != CurrentUser) {
				//structure
					var entry = document.createElement('DIV');
					entry.className = 'entry';
					var button = document.createElement('BUTTON');
					button.className = 'btn btn-primary';
					button.type = 'submit';
					var span = document.createElement('SPAN');
					span.className = 'badge';
					var buttonText = document.createTextNode('chat with ' + user.name + ' ');				
					var spanText = document.createTextNode(!!msg_count[user.name] ? msg_count[user.name] : '');
					button.appendChild(buttonText);
					span.appendChild(spanText);
					button.appendChild(span);
					entry.appendChild(button);
					
					//event handlers
					button.onclick = function () {
						$('#hiddenFrom').val(CurrentUser);
						$('#hiddenTo').val(user.name);
					};

					//finalize
					var userList = document.getElementById('userList');
					userList.appendChild(entry);
				};
			});
		});
	});
});