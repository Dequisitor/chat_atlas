var User = require('../app/models/user');

var profiles = {};

profiles.registerUser = function (req, done) {
	User.findOne({ 'name': req.body.name }, function (err, user) {
		if (err) {
			req.flash('signupMessage', 'Error registering user.')
			return done(1);
		};

		if (!user) {
			var newUser = new User();
			newUser.name = req.body.name;
			newUser.email = req.body.email;
			newUser.password = newUser.generateHash(req.body.passwd);
			newUser.lastOnline = '';

			newUser.save(function (err) {
				if (err) {
					done(err);
				}

				return done(null, newUser);
			});				
		} else {
			req.flash('signupMessage', 'User name already taken.');
			return done(1);
		};
	});
};

profiles.getAllUsers = function (done) {
	User.find({}, { name: 1 }, function (err, users) {
		return done(err, users);
	})
};

module.exports = profiles;