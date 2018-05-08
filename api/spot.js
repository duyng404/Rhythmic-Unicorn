var SpotifyWebApi = require ('spotify-web-api-node');

module.exports = function(){
	var credentials = {
		clientId:  'ec5449f10a534dfd80890cf96a32a35e',
		clientSecret: '1c46d4f5f30146a798777a17372f63fe'
	}

	this.spotifyApi = new SpotifyWebApi(credentials);

	this.spotifyApi.clientCredentialsGrant().then(
		function(data){
			console.log('Spotify connection successful.')
			spotifyApi.setAccessToken(data.body['access_token']);
		},
		function(err){
			console.log('Something went wrong when retrieving an access token', err);
		}
	)

	this.search = function(query){
		return new Promise((resolve,reject) => {
		this.spotifyApi.searchTracks(query,{ limit: 15 }).
			then(function(data){
				resolve(data);
			}, function(err){
				reject(err);
			});
		})
	}

	this.getTracks = function(trackIds){
		return new Promise((resolve,reject) => {
		this.spotifyApi.getTracks(trackIds).
			then(function(data){
				resolve(data.body.tracks);
			}).catch(function(err){
				reject(err);
			});

		});
	}

	return this;

}
