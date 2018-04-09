// all the requires
//var jsonfile = require('jsonfile');
var path = require('path');
var express = require('express');
//var request = require('request');
var bodyParser = require('body-parser');
//var moment = require('moment');

// Connect to the database
//require('./api/db.js');

// this is the whole app
var app = express();

// this server gonna run on this port
app.set('port', 8080);

// logging out all the access
app.use(function(req, res, next){
	console.log(req.method, req.url);
	next();
});

// proxy all the spotify api
//app.use('/spotify',function(req,res){
//	req.pipe(request("http]"))
//});

// global variables
app.locals.spotify = {
	id64: 'ZWM1NDQ5ZjEwYTUzNGRmZDgwODkwY2Y5NmEzMmEzNWU6MWM0NmQ0ZjVmMzAxNDZhNzk4Nzc3YTE3MzcyZjYzZmU=',
	token: 'nowaythisisgoingtowork',
	expire: 0
};

// static directory
app.use(express.static(path.join(__dirname, 'html')));
// node modules
app.use('/node_modules', express.static(path.join(__dirname,'/node_modules')));
// enable parser so it can read POST
app.use(bodyParser.urlencoded({ extended: false }));;
app.use(bodyParser.json());

var ctrl = require('./api/controllers.js');

app.
	route('/api/getSpotifyToken').
	get(ctrl.getToken);

// Listen for requests
var server = app.listen(app.get('port'), function(){
	var port = server.address().port;
	console.log("Magic happens on port " + port);
});
