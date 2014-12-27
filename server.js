var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var passport = require('passport');
var mongoose = require('mongoose');

//connect to db
mongoose.connect('0.0.0.0:27017');

//passport
require('./config/passport')(passport);

//config
require('./config/config')(app, passport);

//routes
require('./app/routes')(app, io, passport);

//start server
http.listen(3000, '192.168.1.100', function() {
	console.log("listening on port 3000 ...");
});