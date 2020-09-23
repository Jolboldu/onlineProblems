var express = require('express');
var router = express.Router();
var models = require('../database/models');
var middleware = require('../middleware')
const nodemailer = require("nodemailer");
var estimation = require('../estimation')


router.get('/', function(req, res, next) {
	models.User.find({}, (err, data) => {
		res.send(data);
	})
});

router.get('/getRanks', (req, res, next) => {
  models.Rank.find({}, (err, data)=>{
    if(err)
      res.sendStatus(500);
    else
      res.send(data);
  })
})

router.get('/me', middleware.checkToken, async (req, res, next) => {

  try
  {
    let response = {
      ratingCountry : 1,
      ratingSchool : 1
    };

    let data = await models.Stage.find({}).sort('complexity').lean().limit(1);

    let currentLevel = await estimation.getCurrentLevel({userId: req.decoded.data._id}, data[0]._id);

    if(currentLevel)
    {
      let currentStage = await models.Stage.findOne({_id: currentLevel.stageId});
      response.currentLevel = {};
      response.currentLevel.stageName = currentStage.name;
      response.currentLevel.name = currentLevel.name;
      response.currentLevel.id = currentLevel._id;
    }

    let myUserData = await models.User.findOne({_id: req.decoded.data._id});
   
    response.firstName = myUserData.firstName;
    response.lastName = myUserData.lastName;
    response.avatar = myUserData.avatar
    response.xp = myUserData.xp;
    response.school = myUserData.school;

    response.accepted = myUserData.acceptedCounter;

    let rankData = await models.Rank.findOne({xpTo: {$gte : response.xp}, xpFrom: {$lte : response.xp}}); 
       
    response.rank = rankData;
    
   
    let ratingCountry = await models.User.aggregate(
      [
        {$match: { xp: { $gt : myUserData.xp }, country: myUserData.country, isActive:true}},
        {$group: {_id: '$xp'}},
        {$group: {_id: 1, count: {$sum: 1}}}
      ]);
    if(ratingCountry.length > 0)
      response.ratingCountry = ratingCountry[0].count + 1;

 
    let ratingSchool = await models.User.aggregate(
      [
        {$match: { xp: { $gt : myUserData.xp }, 
        school: myUserData.school, country: myUserData.country, isActive:true}},
        {$group: {_id: '$xp'}},
        {$group: {_id: 1, count: {$sum: 1}}}
      ]);
    if(ratingSchool.length > 0)
      response.ratingSchool = ratingSchool[0].count + 1;

    res.send(response);
   
  }
  catch(e)
  {
    console.log(e);
    res.sendStatus(500);
  }
})


router.post('/createRank',middleware.checkTokenAdmin , function(req, res, next) {
	let newRank = models.Rank({
    name: req.body.name,
    xpFrom: req.body.xpFrom,
    xpTo: req.body.xpTo,
    percentageFrom: req.body.percentageFrom,
    percentageTo: req.body.percentageTo
  }).save((err)=>{
    if(err)
      console.log(err);
    else
      res.send("ok");
  })
});

router.post('/like', middleware.checkToken, function(req, res, next) {
  models.Like.findOne({sourceUserId: req.decoded.data._id, 
                      destinationUserId: req.body.destinationUserId}, (err, data) => {

    if(err)
      res.sendStatus(500);
    else if(data)
    {
      models.Like.deleteOne({_id: data.id}, (err) => {
        if(err)
        {
          res.sendStatus(500);
          console.log(err);
        }

        res.sendStatus(200);
      })
    }
    else
    {
      let newLike = models.Like({
        sourceUserId: req.decoded.data._id,
        destinationUserId: req.body.destinationUserId
      }).save((err,data)=>{
        if(err)
        {
          res.sendStatus(500);
          console.log(err);
        }
        else
          res.sendStatus(200);
      })
    }
  })
});

router.get('/getLikes', middleware.checkToken, function(req, res, next) {
  models.Like.find({destinationUserId: req.decoded.data._id}, (err, data) => {

    if(err)
      res.sendStatus(500);
    else
    {
      res.json(data.length);
    }

  })

});

router.get('/allLikes', function(req, res, next) {
  models.Like.find({}, (err, data) => {

    if(err)
      res.sendStatus(500);
    else
    {
      res.send(data);
    }
  })
});


router.get('/rank', middleware.checkToken, function(req, res, next) {

  models.User.findOne({_id: req.decoded.data._id}, (err,data) => {
    if (err)
      res.sendStatus(500);
    else 
    {
      if(data){
        
        let xp = data.xp;
        
        models.Rank.findOne({xpTo: {$gt : xp}, xpFrom: {$lte : xp}}, (error, rankData) => {
          if(err)
            return res.sendStatus(500);
          if(rankData)
            return res.send(rankData);
          res.sendStatus(400)
        });
      }
      else{
        res.sendStatus(400);
      }
    }
  })
});


module.exports = router;