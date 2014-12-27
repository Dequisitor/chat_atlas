var profiles = require('./profiles');
var Message = require('./models/message');

module.exports = function(app, io, passport) {
	
	var loggedIn = false;
	app.get('/', isLoggedIn, function (req, res) {
		res.render('main', { user: req.user.name, title: 'Main' });
	});

	app.post('/', isLoggedIn, function (req, res) {
		req.session.chat = {
			from: req.body.from,
			to: req.body.to
		};
		res.redirect('/chat');
	});

	app.get('/chat', isLoggedIn, function (req, res) {
		res.render('index', { from: req.session.chat.from, to: req.session.chat.to, title: req.session.chat.to });
	});

	app.get('/logout', isLoggedIn, function(req, res) {
		req.logout();
		res.redirect('/login');
	});

	app.get('/login', function (req, res) {
		res.render('login', { loginMessage: req.flash('loginMessage'), signupMessage: req.flash('signupMessage'), title: 'Welcome' });
	})

	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	}));

	app.get('/signup', function (req, res) {
		res.render('signup', { signupMessage: req.flash('signupMessage'), title: '' });
	});

	app.post('/signup', function (req, res) {
		profiles.registerUser(req, function (err, user) {
			if (err) {
				req.flash('signupMessage', 'Server Error: '+err);
				res.render('signup', { signupMessage: req.flash('signupMessage'), title: '' });
			} else {
				req.flash('loginMessage', '');
				req.flash('signupMessage', 'Successfully registered, please log in.');
				res.redirect('/login');
			}
		});
	});

	app.get('/users', isLoggedIn, function (req, res) {
		profiles.getAllUsers(function (err, data) {
			if (!err) {
				res.send(data);
			} else {
				res.send('error');
			}
		});
	});

	app.get('/unread_messages/:to', isLoggedIn, function (req, res) {
		Message.find({ to: req.params.to, unseen: true }, function (err, unread) {
			var result = {};
			unread.forEach(function (msg) {	
				if (!result[msg.from]) {
					result[msg.from] = 1;
				} else {
					result[msg.from] += 1;
				}
			});

			res.send(result);
		});		
	});

	app.get('/emoticons', isLoggedIn, function (req, res) {
		var emoticons = [
			{ pattern: ':)', name: 'smile'},
			{ pattern: ':(', name: 'sad'},
			{ pattern: ':D', name: 'laugh'},
			{ pattern: 'xD', name: 'lol'},
			{ pattern: ':P', name: 'tongue'},
			{ pattern: ':blah', name: 'blahblah'},
			{ pattern: ':cry', name: 'cry'},
			{ pattern: ':dead', name: 'dead'},
			{ pattern: ':disappointed', name: 'disappointed'},
			{ pattern: ':L', name: 'love'},
			{ pattern: ':no', name: 'no'},
			{ pattern: ':sick', name: 'sick'},
			{ pattern: ':suspicious', name: 'suspicious'},
			{ pattern: ':suprise', name: 'surprise'},
			{ pattern: ':tough', name: 'tough'},
			{ pattern: ':?', name: 'what'},
			{ pattern: ':kiss', name: 'kiss'}
		];

		res.send(emoticons);
	});

	//======================================================//
	//socket io
	allConnections = [];
	io.on('connection', function (socket) {
		allConnections.push(socket);
		io.emit('user_connected', socket.handshake.query.from);

		//show unread messages
		Message.find({ from: socket.handshake.query.to, to: socket.handshake.query.from, unseen: true }, function (err, unread) {
			if (!err) {
				unread.forEach(function (msg) {
					socket.emit('chat message', msg.text, msg.from, msg.to);
				});
			}
		});

		socket.on('chat message', function(msg, from, to) {
			var newMsg = new Message();
			newMsg.from = from;
			newMsg.to = to;
			newMsg.text = msg;
			newMsg.unseen = true;
			newMsg.save(function (err) {
				if (err) {
					console.log('can not save');
				};
			});
			socket.emit('recieved_message', msg, from, to);

			var socketTo = getRecipientSocket(to);
			if (!!socketTo) {
				socketTo.emit('chat message', msg, from, to);
			};

		});

		socket.on('typing', function (from, to) {
			var socketTo = getRecipientSocket(to);
			if (!!socketTo) {
				socketTo.emit('typing', from, to);
			}
		});

		socket.on('typing_stop', function (from, to) {
			var socketTo = getRecipientSocket(to);
			if (!!socketTo) {
				socketTo.emit('typing_stop', from, to);
			}
		});

		socket.on('seen', function (from, to) {
			Message.find({from: to, to: from, unseen: true}, function (err, messages) {
				if (!err) {
					messages.forEach(function (msg) {
						msg.unseen = false;
						msg.save(function (err) {
							if (err) {
								console.log('unable to update message: '+ err);
							}
						});
					});
				} else {
					console.log('unable to update messages: ' + err);
				}
			});

			var socketTo = getRecipientSocket(to);
			if (!!socketTo) {
				socketTo.emit('seen', from, to);
			}
		});

		socket.on('disconnect', function () {
			io.emit('disconnected', socket.handshake.query.from);
			var index = allConnections.indexOf(socket);
			allConnections.splice(index, 1);
		});

	});


	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}

		res.redirect('/login');
	}

	var getRecipientSocket = function (to) {
		var result = null;
		allConnections.forEach(function (connection) {
			if (to == connection.handshake.query.from) {
				result = connection;
			};
		});

		return result;
	};

}