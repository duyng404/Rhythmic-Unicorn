
// He will send a request of get to the back end and this will rout him to the controllers

var express = require('express');
var router = express.Router();

var ctrl = require('./controllers.js');
//var ctrlReviews = require('../controllers/reviews.controllers.js');

// song routes
//router
//  .route('/songs')
//  .get(ctrl.songGetOne)
//  .post(ctrl.songAddOne);
//
//router
//  .route('/songs/:spotId')
//  .get(ctrl.songGetOne);
//
router.
	route('/relation').
	get(ctrl.getTenRelation).
	post(ctrl.postRelation);

router.
	route('/getSeed').
	get(ctrl.getSeedSong);

router.
	route('/setSeed/:spotId').
	get(ctrl.setSeedSong);

router.
	route('/getSpotifyToken').
	get(ctrl.getToken);

router.
	route('/touch/:spotId').
	get(ctrl.touch);

router.
	route('/search/:query').
	get(ctrl.search);

router.
	route('/view/:spotId').
	get(ctrl.view);

router.
	route('/stats').
	get(ctrl.stats);

module.exports = router;
