var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var songSchema = new mongoose.Schema({
	title : String,
	artist : String,
	album : String,
	genre : [ String ]
});

var Song = mongoose.model('Song',songSchema);
