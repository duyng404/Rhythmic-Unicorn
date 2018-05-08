var request = require('request');
var mongoose = require('mongoose');
var Song = mongoose.model('Song');
var Link = mongoose.model('Link');

var _createSong = async function(spotId, title, artist, album, img, preview){
	return Song.create({
		spotId: spotId,
		title: title,
		artist: artist,
		album: album,
		img: img,
		preview: preview
	})
}

var _findSongBySpotId = async function(spotId){
	return Song.
		find({"spotId":spotId})
}

var _findLink = async function(spotId1,spotId2){
	return Link.find({"$and": [{"spotIds": spotId1},{"spotIds": spotId2}]}).
		populate('songs')
}

var _createLink = async function(spotIds, songs, up, total, ratio){
	return Link.create({
		spotIds: spotIds,
		songs: songs,
		up: up,
		total: total,
		ratio: ratio
	})
}


var _checkLink = async function(link){
	var song0 = link.songs[0];
	var song1 = link.songs[1];
	if (!song0.related.includes(link)) {
		console.log('ADDING LINK TO',song0.title);
		song0.related.push(link);
		await song0.save();
	}
	if (!song1.related.includes(link)) {
		console.log('ADDING LINK TO',song1.title);
		song1.related.push(link);
		await song1.save();
	}
}

var _findRandomLink = function(amount){
	return new Promise((resolve,reject) => {
		Link.
			find().
			where('total').lte(10).
			populate('songs').
			random(amount, true, function(err,found){
				if (err) reject(err);
				resolve(found);
			});
	});
}

var _findRandomLinkWithSeed = function(amount,seedId){
	return new Promise((resolve,reject) => {
		Link.
			find({"spotIds":seedId}).
			where('total').lte(10).
			populate('songs').
			random(amount, true, function(err,found){
				if (err) reject (err);
				resolve(found);
			});
	});
}

var _touch = async function(spotIds,spotifyApi){
	// the final list of songs that has been touched
	var listOfResults = [];
	// songs that need update
	var toBeTouched = [];
	// go thru the input list to check if song already exist
	for (const i of spotIds){
		await _findSongBySpotId(i).
			then(function(doc){
				if (doc.length == 0){
					toBeTouched.push(i);
					listOfResults.push(0);
				} else listOfResults.push(doc[0]);
			})
	}
	// process the update queue
	if (toBeTouched.length > 0){
		await spotifyApi.getTracks(toBeTouched).
			then(async function(data){
				// after query, add them all to db
				for (const i of data){
					await _createSong(i.id, i.name, i.artists[0].name, i.album.name, i.album.images[0].url, i.preview_url).
						then(function(doc){
							var a = listOfResults.indexOf(0);
							listOfResults[a] = doc;
						})
				}
			});
	}
	return listOfResults;
}

module.exports.touch = function(req, res){
	const spotifyApi = req.app.locals.spotify;
	var spotId = req.params.spotId.split(',');
	_touch(spotId,spotifyApi).
		then(function(data){
			res.status(200).json(data);
		}).catch(function(err){
			console.log('error touching:',err);
			res.status(400).json({"message":"error touching"});
		});
}

module.exports.getSeedSong = function(req, res) {
	Song.
		find({"seed":true}).
		random(1, true, function(err, doc) {
			if (err) {
				console.log('error:',err);
				res.status(500).json({"message":"error finding seed song"});
			} else if (doc) {
				res.status(200).json(doc);
			} else {
				res.status(200).json({});
			}
		});
};

module.exports.setSeedSong = function(req, res){
	var spotId = req.params.spotId;
	const spotifyApi = req.app.locals.spotify;
	_touch([spotId],spotifyApi).
		then(function(touched){
			touched[0].seed = true;
			touched[0].save().then(function(saved){
				res.status(200).json(saved);
			}).catch(function(err){console.log('error saving:',err)});
		}).catch(function(err){console.log('error touching:',err)});
}

module.exports.postRelation = async function(req,res) {
	var resultList = [];
	const spotifyApi = req.app.locals.spotify;
	// build a list of songs to touch
	if (!req.body.seedSongId || !req.body.relatedSongs){
		res.status(400).json({"message":"bad request"});
		return;
	}
	var seedId = req.body.seedSongId;
	var rel = JSON.parse(req.body.relatedSongs)
	var touching = [ seedId ];
	for (const i of rel){
		touching.push(i.spotId)
	}
	var query = touching.join();
	// perform the touch
	await _touch(touching,spotifyApi).
		then(async function(touched){
			// iterate through relations
			for (var i=0; i<rel.length; i++){
				const arel = rel[i];
				const asong = touched[i+1];
				// look up if the link exists
				await _findLink(seedId,arel.spotId).
					then(async function(found){
						// if link doesnt exist, create new
						if (found.length == 0){
							var up = 0;
							if (arel.rating == 'up') up=1;
							await _createLink([seedId, arel.spotId], [touched[0],asong], up, 1, Math.floor(up*100)).
								then(async function(created){
									// also update both the songs
									//await _checkLink(created);
									resultList.push(created);
								}).catch(function(err){console.log('error creating link',err)});
						} else {
						// if link already exist
							//await _checkLink(found[0]);
							resultList.push(found[0]);
						}
					}). catch(function(err){ console.log('error finding link:',err) });
			}
		}).catch(function(err){console.log('error touching:',err)});
	res.status(200).json(resultList);
}

module.exports.getTenRelation = async function(req,res){
	var result = [];
	if (req.params.seedId) {
		var seedId = req.params.seedId;
		await _findRandomLinkWithSeed(3,seedId).
			then(function(found){
				for (const i of found){
					result.push(i);
				}
			}).catch(function(err){console.log('error finding link:',err)});
		await _findRandomLink(7).
			then(function(found){
				for (const i of found){
					result.push(i);
				}
			}).catch(function(err){console.log('error findling link:',err)});
	} else {
		await _findRandomLink(10).
			then(function(found){
				for (const i of found){
					result.push(i);
				}
			}).catch(function(err){console.log('error findling link:',err)});
	}
	res.status(200).json(result);
}

module.exports.search = function(req,res){
	const spotifyApi = req.app.locals.spotify;
	var query = req.params.query;
	spotifyApi.search(query).
		then(function(data){
			var result = [];
			var theList = data.body.tracks.items;
				for (let i of theList){
					result.push({
						spotId: i.id,
						title: i.name,
						artist: i.artists[0].name,
						album: i.album.name,
						img: i.album.images[0].url,
						preview: i.preview_url
					})
				}
			res.status(200).json(result);
		}).catch(function(err){
			console.log('error finding songs:',err)
		})
}

module.exports.getToken = function(req,res){
	var token = req.app.locals.spotifyy.token;
	var expire = req.app.locals.spotifyy.expire;
	if (expire <= Math.floor(new Date().getTime()/1000)){
		request({
			method: 'POST',
			uri: 'https://accounts.spotify.com/api/token',
			qs: { grant_type: 'client_credentials' },
			headers: {
				'Authorization': 'Basic '+req.app.locals.spotifyy.id64,
				"Content-Type": "application/x-www-form-urlencoded",
			}
		},
		function(error,response,body){
			if (response.statusCode == 200){
				var data = JSON.parse(body);
				var token = data.access_token;
				var expire = Math.floor(new Date().getTime()/1000) + data.expires_in;
				req.app.locals.spotifyy.token = token;
				req.app.locals.spotifyy.expire = expire;
				res.status(200).json({'token':'Bearer '+token});
			} else {
				var data = JSON.parse(body);
				res.status(500).json({'message':'some error occured','body':data});
			}
		});
	} else {
		res.status(200).json({'token':'Bearer '+token});
	}
}


