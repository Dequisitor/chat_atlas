$(function () {
	var socket = io.connect('', { query: "from="+CurrentFrom+"&to="+CurrentTo });

	//smileys
	var emoticons = [];
	$.get('/emoticons', function (data) {
		emoticons = data;

		var str = '';
		emoticons.forEach(function(smiley) {
			str += '<img src="icons/' + smiley.name + '.png" height="32" width="32"';
			str += ' onclick="$(\'#m\').val($(\'#m\').val() + \'' + smiley.pattern + '\'); $(\'#m\').focus();">';
		});

		$('[data-toggle="popover"]').popover({
			placement: 'top',
			html: 'true',
			content: str
		}).on('show.bs.popover', function () {
			$('#m').focus();
		});
	});

	//sound
	var soundOn = false;
	var sound = new Audio('sounds/bird.wav');
	$(window).on('blur', function() {
		soundOn = true;
	});
	$(window).on('focus', function () {
		soundOn = false;
		notifySeen();
	});
	var playNotification = function () {
		if (soundOn) {
			sound.play();
		}
	};

	//message
	$('form.chat').submit(function () {
		if ($('#m').val().length > 0) {
			if ($('#m').val() == "show emoticons" || $('#m').val() == "show smileys") {
				var str = '';
				emoticons.forEach(function (smiley) {
					str += "'" + smiley.pattern + "'" + ' -> ' + '<img src="/icons/' + smiley.name + '.png" height="32" width="32"/><br/>';
				});
				
				addMessage(str, 'left');
			} else {
				//emit message
				socket.emit('chat message', $('#m').val(), CurrentFrom, CurrentTo);
			}

			//clear input
			$('#m').val('');
			socket.emit('typing_stop', CurrentFrom, CurrentTo);
		}

		$('#smileys').popover('hide');
		return false;
	});

	var resize = function () {
		var containerTop = $('#messages').offset().top;
		var screenHeight = $(window).height();
		var formHeight = $('form.chat').height();
		$('#messages')
			.css('max-height', screenHeight - formHeight - containerTop - 20)
			.scrollTop($('#messages').prop('scrollHeight'));
	};
	$(window).resize(resize);
	resize();

	$('#m').on('keyup', function () {
		notifySeen();
		var text = $('#m').val();
		if (text.length > 0) {
			socket.emit('typing', CurrentFrom, CurrentTo);
		} else {			
			socket.emit('typing_stop', CurrentFrom, CurrentTo);
		}
	});

	var parseMessage = function (msg) {
		emoticons.forEach(function (smiley) {
			var regexPattern = smiley.pattern.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
			var regex = new RegExp(regexPattern, "g");
			var replace = '<img src="/icons/' + smiley.name + '.png" height="32" width="32"/>';
			msg = msg.replace(regex, replace);
		});
		
		return msg;
	};

	var addMessage = function (msg, side) {
		$('#messages')
			.append('<div class="entryrow"><div class="' + side + '">' + msg + '</div></div>')
			.scrollTop($('#messages').prop('scrollHeight'));
	};

	//====================================================================//
	//socket communication
	//====================================================================//
	var unseen = false;
	var notifySeen = function () {
		if (unseen) {
			socket.emit('seen', CurrentFrom, CurrentTo);
			$(window).unbind('mousemove');

			unseen = false;
		}
	}

	var force2digits = function (value) {
		return value > 9 ? "" + value : '0' + value;
	}

	var prevTime = null;
	var showTimeStamp = function (from, time) {
		if (!time) {
			time = !!prevTime ? prevTime : new Date();
		}
		var timestr = force2digits(time.getHours()) + ':' + force2digits(time.getMinutes()) + ':' + force2digits(time.getSeconds());
		$('#log').html('Last message recieved from <b>' + from + '</b> at ' + timestr);		

		prevTime = time;
	}

	socket.on('disconnected', function (user) {
		$('#log').html('User <b>' + user + '</b> has disconnected.');
	});

	socket.on('disconnect', function () {
		$('#log').html('You have been disconnected.');
	})

	socket.on('chat message', function (msg, from, to) {
		//append message from server
		msg = parseMessage(msg);
		addMessage(msg, 'right');
		showTimeStamp(from, new Date());
		playNotification();

		//add handlers to notify others if the reciever has seen the message
		unseen = true;
		$(window).on('mousemove', function () {
			notifySeen();
		});
	});

	socket.on('typing', function (from) {
		$('#log').html('<b>' + from + '</b> is typing ...');
	});

	socket.on('typing_stop', function (from) {
		showTimeStamp(from);
	});

	socket.on('seen', function (from) {
		$('#messages .left.unseen').removeClass('unseen');
	});

	socket.on('recieved_message', function (msg, from) {
		//append message
		msg = parseMessage(msg);
		addMessage(msg, 'left unseen');
	});

	socket.on('user_connected', function (user) {
		if (user != CurrentFrom) {
			$('#log').html('User <b>' + user + '</b> connected.');
		}
	});

});
