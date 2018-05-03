var dbcon = require('./db.js');
var request = require('request');
var mongoose = require('mongoose');
var Song = mongoose.model('Song');

//module.exports.checkDb = function()

//add songs to database, need to check if in
// Look at there example, need to check first
// Select * where spotId... 

module.exports.songAddOne = function(req, res) {
	console.log("POST new song");

	Song
	.create({
		spotId : req.body.spotId,
		seed : false,
		title : req.body.title,
		artist : req.body.artist,
		album : req.body.ablbum,
		genre : _splitArray(req.body.genre)
	}, function(err, song) {
		if (err) {
			console.log("Error creating song");
			res
			.status(400)
			.json(err);
		} else {
			console.log("Song created!", song);
			res
			.status(201)
			.json(song);
		}
	});
};

module.exports.getSeedSong = function(req, res) {
	var id = req.params.spotId;
	var seed = req.params.seed;
	var ran = Math.floor(Math.random() * 10);
	console.log('GET sporId of seed song', id);
	Song
	.find(seed)
	.skip(ran)
	.limit(1)
	.exec(function(err, doc) {
		var response = {
			status : 200,
			message : doc
		};
		if (err) {
			console.log("Error finding seed");
			response.status = 500;
			response.message = err;
		} else if(!doc) {
			console.log("Seed song not found in database", id);
			response.status = 404;
			response.message = {
				"message" : "Song ID not found " + id
			};
		}
		res
		.status(response.status)
		.json(response.message);
	});
};

var _addConSong = function (req, res, song1, song2) {
	
	song1.ConnectedSongs.push({
		spotId : req.body.song2,
    // Title of song 2
    title : req.body.title,
    score : 1
});

	song1.save(function(err, songUpdated) {
		if (err) {
			res
			.status(500)
			.json(err);
		} else {
			res
			.status(200)
			.json(songUpdated.ConnectedSongs[songUpdated.ConnectedSongs.length - 1]);
		}
	});
};

module.exports.songConnect = function(req, res) {
	var listOfSongs = req.body.song_list;
	var song1 = listOfSongs[0];
	var song2 = listOfSongs[1];
	console.log('PUT spotId ' + spotId + ' for hotelId ' + hotelId);

	Hotel
	.find(song1)
	.select('ConnectedSongs')
	.exec(function(err, song_1) {
		var thisSong;
		var response = {
			status : 200,
			message : {}
		};
		if (err) {
			console.log("Error finding song");
			response.status = 500;
			response.message = err;
		} else if(!song_1) {
			console.log("Song id not found in database", song_1);
			response.status = 404;
			response.message = {
				"message" : "Song ID not found " + song_1
			};
		} else {
        // Get the song
        thisSong = song_1.ConnectedSongs.id(song2);
        // If the song doesn't exist Mongoose returns null
        if (!thisSong) {
        	_addConSong(req, res, song1, song2);
        };
    }
    if (response.status !== 200) {
    	res
    	.status(response.status)
    	.json(response.message);
    } else {
    	song1.save(function(err, songUpdated) {
    		if (err) {
    			res
    			.status(500)
    			.json(err);
    		} else {
    			res
    			.status(204)
    			.json();
    		}
    	});
    }
});

	Hotel
	.find(song2)
	.select('ConnectedSongs')
	.exec(function(err, song_2) {
		var thisSong;
		var response = {
			status : 200,
			message : {}
		};
		if (err) {
			console.log("Error finding song");
			response.status = 500;
			response.message = err;
		} else if(!song_2) {
			console.log("Song id not found in database", song_2);
			response.status = 404;
			response.message = {
				"message" : "Song ID not found " + song_2
			};
		} else {
        // Get the song
        thisSong = song_2.ConnectedSongs.id(song1);
        // If the song doesn't exist Mongoose returns null
        if (!thisSong) {
        	_addConSong(req, res, song2, song1);
        };
    }
    if (response.status !== 200) {
    	res
    	.status(response.status)
    	.json(response.message);
    } else {
    	song2.save(function(err, songUpdated) {
    		if (err) {
    			res
    			.status(500)
    			.json(err);
    		} else {
    			res
    			.status(204)
    			.json();
    		}
    	});
    }
});
};

module.exports.songGetOne = function(req, res) {
	var id = req.params.spotId;

	console.log('GET sporId', id);

	Song
	.findById(id)
	.exec(function(err, doc) {
		var response = {
			status : 200,
			message : doc
		};
		if (err) {
			console.log("Error finding hotel");
			response.status = 500;
			response.message = err;
		} else if(!doc) {
			console.log("HotelId not found in database", id);
			response.status = 404;
			response.message = {
				"message" : "Hotel ID not found " + id
			};
		}
		res
		.status(response.status)
		.json(response.message);
	});

};
//module.exports.songsConnection and increase score

//module.exports.getSeedSong

// getSeedSong       get songs where seed is true then randomize list

module.exports.getToken = function(req,res){
	var token = req.app.locals.spotify.token;
	var expire = req.app.locals.spotify.expire;
	if (expire <= Math.floor(new Date().getTime()/1000)){
		request({
			method: 'POST',
			uri: 'https://accounts.spotify.com/api/token',
			qs: { grant_type: 'client_credentials' },
			headers: {
				'Authorization': 'Basic '+req.app.locals.spotify.id64,
				"Content-Type": "application/x-www-form-urlencoded",
			}
		},
		function(error,response,body){
			if (response.statusCode == 200){
				var data = JSON.parse(body);
				var token = data.access_token;
				var expire = Math.floor(new Date().getTime()/1000) + data.expires_in;
				req.app.locals.spotify.token = token;
				req.app.locals.spotify.expire = expire;
				console.log(token);
				console.log(req.app.locals.spotify.token);
				res.status(200).json({'token':'Bearer '+token});
			} else {
				var data = JSON.parse(body);
				res.status(500).json({'message':'some error occured','body':data});
			}
		}
		)
	} else {
		res.status(200).json({'token':'Bearer '+token});
	}
}


