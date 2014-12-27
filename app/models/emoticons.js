var mongoose = require('mongoose');

var emoticonSchema = mongoose.Schema({
	pattern: String,
	name: String
});

module.exports = mongoose.model('Emoticon', emoticonSchema);