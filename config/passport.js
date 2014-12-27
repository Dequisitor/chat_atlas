var LocalStrategy = require('passport-local').Strategy;

var User = require('../app/models/user');

module.exports = function (passport) {

	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use('local-login', new LocalStrategy({
		usernameField: 'name',
		passwordField: 'passwd',
		passReqToCallback: true
	}, function (req, user, password, done) {

		process.nextTick(function () {

			User.findOne({ 'name': user }, function (err, user) {

				if (err) {
					return done(err);
				};

				if (!user) {
					return done(null, false, req.flash('loginMessage', 'invalid username/password'));
				};

				if (!user.validPassword(password)) {
					return done(null, false, req.flash('loginMessage', 'invalid username/password'));
				};

				return done(null, user);
			});
		});

	}));
};