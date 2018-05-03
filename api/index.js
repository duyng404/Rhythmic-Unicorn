
// He will send a request of get to the back end and this will rout him to the controllers

var express = require('express');
var router = express.Router();

var ctrl = require('./controllers.js');
//var ctrlReviews = require('../controllers/reviews.controllers.js');

// song routes
router
  .route('/songs')
  .get(ctrl.songGetOne)
  .post(ctrl.songAddOne);

router
  .route('/songs/:spotId')
  .get(ctrl.songGetOne);

router
  .route('/getSeedSong')
  .get(ctrl.getSeedSong);

router
  .route('/connectSong')
  .post(ctrl.songConnect)

router
  .route('/getSpotify/Token')
  .get(ctrl.getToken);

module.exports = router;
