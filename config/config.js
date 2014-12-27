var stylus = require('stylus');
var nib = require('nib');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');

module.exports = function(app, passport) {

	function compile(str, path) {
		return stylus(str)
			.set('filename', path)
			.use(nib());
	}

	//setup
	app.use(morgan('dev'));
	app.use(session({secret: 'themjewsarepersistant'}));
	app.set('views', __dirname + '/../views');
	app.set('view engine', 'jade');
	app.use(stylus.middleware({
		src: __dirname + '/../public',
		compile: compile
	}));
	app.use(express.static(__dirname + '/../public'));
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());
	app.use(cookieParser());
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());

};