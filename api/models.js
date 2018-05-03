var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var conectSongs = new mongoose.Schema({
	spotId : String,
	title : String,
	score : Number
});

var songSchema = new mongoose.Schema({
	spotId : String,
	seed : Boolean,
	title : String,
	artist : String,
	album : String,
	genre : [ String ],
	ConnectedSongs : [ conectSongs ]
});

var Song = mongoose.model('Song',songSchema);
