var request = require('request');

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
