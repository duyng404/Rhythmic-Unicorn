var mongoose = require('mongoose');
var dburl = 'mongodb://localhost:27017/unicorndb';

// mongoose options
mongoose.Promise = global.Promise;

mongoose.connect(dburl);

mongoose.connection.on('connected',function(){
	console.log('Mongoose connected to ' + dburl);
});
mongoose.connection.on('disconnected',function(){
	console.log('Mongoose disconnected');
});
mongoose.connection.on('error',function(err){
	console.log('Mongoose connection error: ' + err);
});

process.on('SIGINT', function(){
	mongoose.connection.close(function(){
		console.log('Mongoose closed thru SIGINT');
		process.exit(0);
	});
});

process.on('SIGTERM', function(){
	mongoose.connection.close(function(){
		console.log('Mongoose closed thru SIGTERM');
		process.exit(0);
	});
});

process.once('SIGUSR2', function(){
	mongoose.connection.close(function(){
		console.log('Mongoose closed thru SIGUSR2');
		process.kill(process.pid, 'SIGUSR2');
	});
});

// bring in schemas and models
require('./models.js');
