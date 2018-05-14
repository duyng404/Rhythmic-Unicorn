var mongoose = require('mongoose');
var random = require('mongoose-simple-random');
var Schema = mongoose.Schema;

var linkSchema = new mongoose.Schema({
	spotIds : [ String ],
	songs: [ { type: Schema.Types.ObjectId, ref: 'Song' } ],
	up: { type: Number, default: 0 },
	total: { type: Number, default: 0 },
	ratio: { type: Number, default: 0 }
});
linkSchema.plugin(random);

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
	total : { type: Number, default: 0 },
	seed : {
		type: Boolean,
		default: false
	}
	//related : [ {
	//	type: Schema.Types.ObjectId,
	//	ref: 'Link'
	//} ]
});
songSchema.plugin(random);

var Link = mongoose.model('Link',linkSchema);
var Song = mongoose.model('Song',songSchema);
