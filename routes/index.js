var express = require('express');
var router = express.Router();
var gameEngine = require('../build/engine.bundle')
var models = require('../database/models');
var middleware = require('../middleware')
var multer  = require('multer')
const path = require('path');


//var upload = multer({ dest: 'public/uploads/avatars' })

/* GET home page. */


router.post('/', middleware.checkToken, (req, res, next) => {
	res.send('ok');	
})

router.get('/', (req, res, next) => {
	res.render('index', {
    title: "Balatech.asia"
  });	
})


module.exports = router;
