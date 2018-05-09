var SpotifyWebApi = require ('spotify-web-api-node');

module.exports = function(){
	var credentials = {
		clientId:  'ec5449f10a534dfd80890cf96a32a35e',
		clientSecret: '1c46d4f5f30146a798777a17372f63fe'
	}

	var expire = 0;

	this.spotifyApi = new SpotifyWebApi(credentials);

	this.spotifyApi.clientCredentialsGrant().then(
		function(data){
			console.log('Spotify connection successful.')
			spotifyApi.setAccessToken(data.body['access_token']);
			expire = Date.now() + data.body['expires_in'] * 1000;
		},
		function(err){
			console.log('Something went wrong when retrieving an access token', err);
		}
	)

	this.checkExpire = async function(){
		if (Date.now() > expire){
			await this.spotifyApi.clientCredentialsGrant().then(
				function(data){
					console.log('Spotify Token Refreshed');
					spotifyApi.setAccessToken(data.body['access_token']);
					expire = Date.now() + data.body['expires_in'] * 1000;
				});
		}
	}

	this.search = async function(query){
		await this.checkExpire();
		return new Promise((resolve,reject) => {
		this.spotifyApi.searchTracks(query,{ limit: 9 }).
			then(function(data){
				resolve(data);
			}, function(err){
				reject(err);
			});
		})
	}

	this.getTracks = async function(trackIds){
		await this.checkExpire();
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
