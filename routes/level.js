var express = require('express');
var router = express.Router();
var gameEngine = require('../build/engine.bundle')
var models = require('../database/models');
var middleware = require('../middleware')
var validator = require('../validation');

router.post('/create', middleware.checkTokenAdmin, async (req, res, next) => {

  if(!validator.IsValidLevelData(req.body))
    return res.sendStatus(400);

  try
  {
    let prevLevel = await models.Level.findOne({stageId: req.body.stageId}).sort('-position');
    let newPosition = 1;
    if(prevLevel)
      newPosition+= prevLevel.position;

    let newLevel = new models.Level(
    {
      name: req.body.name,
      blocks: req.body.blocks,
      hero: req.body.hero,
      stars: req.body.stars,
      restrictions: req.body.restrictions,
      pointsForLevel: req.body.pointsForLevel,
      stageId: req.body.stageId,
      position: newPosition
    });

    await newLevel.save();
    

    let xp = req.body.pointsForLevel.xp;
   
    let rankData = await models.Rank.find({});
    
    rankData.forEach(async (element) => {
      element.xpFrom+= (xp / 100 * element.percentageFrom);
      element.xpTo+= (xp / 100 * element.percentageTo);
      await element.save();
    });

    let stageData = await models.Stage.findOne({_id: req.body.stageId});
      
    stageData.counterOfLevels += 1;
    stageData.maxXp += xp;
    await stageData.save();		
    
    res.send(newLevel._id);

  }
  catch(e)
  {
    console.log(e);
    return res.sendStatus(500);
  }

      
})

router.post('/get', async (req, res, next) => {

  try
  {
    
    let data = await models.Level.findOne({_id: req.body.id}).lean();
    
    if(data)
    {
      let nextLevel = await models.Level.findOne({stageId: data.stageId, position:{$gt : data.position}})
      .sort('position').limit(1).select('_id');
      
      if(nextLevel)
        data.nextLevel = nextLevel;
      
      res.send(data); 
    }
    else
      res.sendStatus(400);
    
  }
  catch(e)
  {
    console.log(e);
    res.sendStatus(500);
  }
})

router.post('/getStage', (req, res, next) => {
  models.Stage.findOne({_id: req.body.stageId}, (error, data) =>
  {
    if(error)
      return res.sendStatus(500);
    if(data){
      res.send(data);
    }
    else
      res.sendStatus(400);
  })
})

router.post('/createStage', middleware.checkTokenAdmin, (req, res, next) => {
  
  if(!req.body.name || !req.body.complexity)
    return res.sendStatus(400);

  let newStage = models.Stage(
  {
    name: req.body.name,
    counterOfLevels:0,
    maxXp:0,
    complexity: req.body.complexity
  }).save((error, stageData) => {
    if(error)
      res.sendStatus(500);
    else{
      res.sendStatus(200);
    }   
  })
})

router.post('/removeStage', middleware.checkTokenAdmin, (req, res, next) => {

  models.Stage.deleteMany({_id: req.body.stageId}, (error)=>{
    if(error)
      res.sendStatus(500);
    models.Level.deleteMany({stageId: req.body.stageId}, (err)=>{
      if(err)
        return res.sendStatus(500);
      
      res.sendStatus(200);

    })
  })

})



router.post('/remove', middleware.checkTokenAdmin, async (req, res, next) => {

  try
  {
    
    let levelData = await models.Level.findOne({name: req.body.name});
    let xp = levelData.pointsForLevel.xp;

    await models.Level.deleteOne({name: req.body.name});
    
    let rankData = await models.Rank.find({});

    rankData.forEach(async (element) => {
      element.xpFrom-= (xp / 100 * element.percentageFrom);
      element.xpTo-= (xp / 100 * element.percentageTo);
      await element.save();
    });

    let stageData = await models.Stage.findOne({_id: levelData.stageId});
      
    stageData.counterOfLevels -= 1;
    stageData.maxXp -= xp;
    await stageData.save(); 

  }
  catch(e)
  {
    return res.sendStatus(500);
  }
  
  res.sendStatus(200);

})


module.exports = router;
