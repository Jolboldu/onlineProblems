var express = require('express');
var router = express.Router();
var models = require('../database/models');
var middleware = require('../middleware')
var estimation = require('../estimation')
var validator = require('../validation');

router.get('/', middleware.checkToken, async (req, res, next) => {

  let tmp = []; 
  let response = {
    rating : tmp,
    ratingWorld : 1,
    ratingSchool: 1,
    ratingCountry: 1
  }

  try
  {
    let myData = await models.User.findOne({_id: req.decoded.data._id}); 
    response.accepted = myData.acceptedCounter;

    //get 5 above
    let aboveQueryData = await models.User.find({ "xp": { "$gte": myData.xp}}).
    sort({xp: 1}).limit(10).select('xp firstName lastName').lean();          
 
    //get 5 below
    let belowQueryData = await models.User.find({ "xp": { "$lt": myData.xp}}).
    sort({xp: -1}).limit(10).select('xp firstName lastName').lean();
    
    
    aboveQueryData.reverse();
    response.rating = aboveQueryData.concat(belowQueryData);

    let ratingWorld = await models.User.aggregate(
      [
        {$match: { xp: { $gt : myData.xp }}},
        {$group: {_id: '$xp'}},
        {$group: {_id: 1, count: {$sum: 1}}}
      ]);
    if(ratingWorld.length > 0)
      response.ratingWorld = ratingWorld[0].count + 1;


    let ratingCountry = await models.User.aggregate(
      [
        {$match: { xp: { $gt : myData.xp }, country: myData.country}},
        {$group: {_id: '$xp'}},
        {$group: {_id: 1, count: {$sum: 1}}}
      ]);
    if(ratingCountry.length > 0)
      response.ratingCountry = ratingCountry[0].count + 1;

 
    let ratingSchool = await models.User.aggregate(
      [
        {$match: { xp: { $gt : myData.xp }, school: myData.school, 
                        country: myData.country}
        },
        {$group: {_id: '$xp'}},
        {$group: {_id: 1, count: {$sum: 1}}}
      ]);
    if(ratingSchool.length > 0)
      response.ratingSchool = ratingSchool[0].count + 1;
      

    let index = estimation.forceSearch(response.rating, myData);
    if(index == -1)
      return res.json(response);
    
    response.rating[index].position = response.ratingWorld;

    //define position of each user
    let i = index;

    while(i < response.rating.length - 1)
    {
      if(response.rating[i].xp == response.rating[i + 1].xp)
        response.rating[i + 1].position = response.rating[i].position;
      else
        response.rating[i + 1].position = response.rating[i].position + 1;

      ++i;
    }

    i = index;
    while(i > 0)
    {
      if(response.rating[i].xp == response.rating[i - 1].xp)
        response.rating[i - 1].position = response.rating[i].position;
      else
        response.rating[i - 1].position = response.rating[i].position -1;
      
      --i;
    }
    res.json(response);
  }
  catch(e)
  {
    console.log(e);
    res.sendStatus(500);
  }
})


router.post('/scroll', middleware.checkToken, async (req, res, next) => {
  
  if(!validator.isValidStatsScrollData(req.body))
    return res.sendStatus(400);

  //knownIds[0] is last one and other elements are ids which xp is equal to last one.
  let knownIds = req.body.knownIds;
  let delta = req.body.delta;
  let ratingOfLast = req.body.ratingOfLast;
  
  try
  {
    let myData = await models.User.findOne({_id: knownIds[0]});

    let newData;
    if(delta == 0)
      res.sendStatus(400);
    else
    {
      if(delta > 0)
        newData = await models.User.find({ xp: { "$gte": myData.xp}, 
        "_id": { "$nin": knownIds }, isActive:true}).sort({xp: 1})
        .limit(delta).select('xp firstName lastName').lean();
      else
        newData = await models.User.find({ "xp": { "$lte": myData.xp},
         "_id": { "$nin": knownIds }, isActive:true}).sort({xp: -1})
        .limit(delta).select('xp firstName lastName').lean();
    
           
      // define position of each user
      if(newData[0].xp == myData.xp)
        newData[0].position = ratingOfLast;
      else
      {
        if(delta > 0)
          newData[0].position = ratingOfLast - 1;
        else
          newData[0].position = ratingOfLast + 1;  
      }

      for(let i = 0; i < newData.length - 1; ++i)
      {
        if(newData[i + 1].xp == newData[i].xp)
            newData[i + 1].position = newData[i].position;
        else
        {
          if(delta > 0)
            newData[i + 1].position = newData[i].position - 1;
          else if (delta < 0)
            newData[i + 1].position = newData[i].position + 1;

        }
      }  
        
      res.send(newData)
    }   
  }catch(e)
  {
    console.log(e);
    res.sendStatus(500);
  }
  
})

router.get('/2', middleware.checkToken, async (req, res, next) => {

  try
  {
    let response = {};
    
    let myUserData = await models.User.findOne({_id: req.decoded.data._id, isActive:true});
      
    let efficiencyData = await models.User.countDocuments(
    {efficiency: {$lt : myUserData.efficiency}, isActive:true});
          
    let allUsersData = await models.User.countDocuments({isActive:true});
             
    response.efficiency = efficiencyData * 100 / allUsersData;
    
    let acceptedData = await models.User.countDocuments(
      {acceptedCounter: {$lt : myUserData.acceptedCounter}, isActive:true});
             
    response.zeal = acceptedData * 100 / allUsersData;

    let solvingData = await models.User.countDocuments(
      {solvingTime: {$gt : myUserData.solvingTime}, isActive:true});  

    response.time = solvingData * 100 / allUsersData;
    res.json(response);
         
  }
  catch(e)
  {
    console.log(e);
    res.sendStatus(500);
  }
});



module.exports = router;