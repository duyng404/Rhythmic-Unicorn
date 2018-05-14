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
		song0.related.push(link);
		await song0.save();
	}
	if (!song1.related.includes(link)) {
		song1.related.push(link);
		await song1.save();
	}
}

var _chooseRandom = function(array,amount){
	if (array.length <= amount){
		return array;
	} else {
		ratio = amount / array.length;
		var coinflip = Math.random();
		if (coinflip < ratio){
			return array.slice(0,1).concat(_chooseRandom(array.slice(1),amount-1));
		} else {
			return _chooseRandom(array.slice(1),amount);
		}
	}
}

var _findRandomLinks = function(amount){
	return new Promise((resolve, reject) => {
		var max = amount * 5;
		Link.count().then(async function(count){
			if (count <= 20) resolve([]);
			else if (Math.floor(count / 2) < max) max = Math.floor(count/2);
			await Link.find().sort({'total':1}).limit(max).populate('songs').then(function(found){
				var a = _chooseRandom(found,amount);
				resolve(a);
			}).catch(function(err){console.log('error finding links:',err)})
		}).catch(function(err){console.log('error counting:',err)});
	})
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

module.exports.getSeedSong = async function(req, res) {
	var aa = {};
	await Song.count().then(async function(count){
		var random = Math.floor(Math.random() * Math.floor(count/4));
		await Song.
			find({'seed':true}).
			sort({'total':1}).
			skip(random).
			limit(1).
			then(function(found){
				aa = found[0];
			}).catch(function(err){console.log('error finding:',err)});
	}).catch(function(err){console.log('error counting:',err)});
	res.status(200).json(aa);
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
									// increase total of seed song
									touched[0].total = touched[0].total + 1;
									await touched[0].save();
									// increase total of nonseed song
									asong.total = asong.total + 1;
									await asong.save();
									// return
									created = created.toObject();
									created.reward = 5;
									resultList.push(created);
								}).catch(function(err){console.log('error creating link',err)});
						} else {
						// if link already exist
							//await _checkLink(found[0]);
							found = found[0];
							if (arel.rating == 'up') found.up += 1;
							found.total += 1;
							found.ratio = Math.floor(found.up / found.total * 100);
							found.save();
							found = found.toObject();
							if (found.total <= 10) found.reward = 5;
							else found.reward = 1;
							resultList.push(found);
						}
					}). catch(function(err){ console.log('error finding link:',err) });
			}
		}).catch(function(err){console.log('error touching:',err)});
	res.status(200).json(resultList);
}

module.exports.getTenRelation = async function(req,res){
	var result = [];
	await _findRandomLinks(10).
		then(function(found){
			for (const i of found){
				result.push(i);
			}
		}).catch(function(err){console.log('error findling link:',err)});
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

module.exports.view = async function(req,res){
	var spotId = req.params.spotId;
	const spotifyApi = req.app.locals.spotify;
	var aa = {};
	await _touch([spotId],spotifyApi).
		then(async function(touched){
			touched = touched[0].toObject();
			await Link.find({'spotIds':touched.spotId}).sort({'total':-1}).limit(15).populate('songs').then(function(found){
				touched.relations = found;
				aa = touched;
			}).catch(function(err){console.log('error finding:',err)});
		}).catch(function(err){console.log('error touching:',err)});
	res.status(200).json(aa);
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


