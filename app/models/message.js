var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
	from: String,
	to: String,
	text: String,
	unseen: Boolean
});

module.exports = mongoose.model('Message', messageSchema);