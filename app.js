// all the requires
//var jsonfile = require('jsonfile');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
//var moment = require('moment');

// this is the whole app
var app = express();

// this server gonna run on this port
app.set('port', 8080);

// logging out all the access
app.use(function(req, res, next){
	console.log(req.method, req.url);
	next();
});

// static directory
app.use(express.static(path.join(__dirname, 'html')));
// node modules
app.use('/node_modules', express.static(path.join(__dirname,'/node_modules')));
// enable parser so it can read POST
app.use(bodyParser.urlencoded({ extended: false }));;
app.use(bodyParser.json());

var ctrl = require('./api/controllers.js');

app.
	route('/api/test').
	get(ctrl.apitest);

// Listen for requests
var server = app.listen(app.get('port'), function(){
	var port = server.address().port;
	console.log("Magic happens on port " + port);
});
