var mongoose = require('mongoose');
require('mongoose-query-random');
var Schema = mongoose.Schema;

var linkSchema = new mongoose.Schema({
	spotIds : [ String ],
	songs: [ { type: Schema.Types.ObjectId, ref: 'Song' } ],
	up: { type: Number, default: 0 },
	total: { type: Number, default: 0 },
	ratio: { type: Number, default: 0 }
});

var songSchema = new mongoose.Schema({
	spotId : {
		type: String,
		index: true,
		unique: true
	},
	title : String,
	artist : String,
	album : String,
	img : String,
	preview : String,
	seed : {
		type: Boolean,
		default: false
	}
	//related : [ {
	//	type: Schema.Types.ObjectId,
	//	ref: 'Link'
	//} ]
});

var Link = mongoose.model('Link',linkSchema);
var Song = mongoose.model('Song',songSchema);
