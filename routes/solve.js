var express = require('express');
var router = express.Router();
var models = require('../database/models');
var middleware = require('../middleware')
var estimation = require('../estimation')


function getUserStageInfo(stageId, acceptedEachStage)
{
  for(let i = 0; i < acceptedEachStage.length; ++i)
  {
    if(acceptedEachStage[i].stageId.toString() == stageId.toString()){
      return {counter: acceptedEachStage[i].counter, xpOnStage: acceptedEachStage[i].xpOnStage};
    }
  }
  return {counter: 0, xpOnStage: 0};
}

// router.get('/getStages', middleware.checkToken, async (req, res, next) => {
//   let data = await models.Stage.find({}).sort('complexity').lean()
//   res.json(data)
// })

// router.post('/getLevels', async (req, res, next) => {
//   let data = await models.Level.find({stageId: req.body.stageId}).select('_id name pointsForLevel').lean()
//   res.json(data)
// })

router.get('/', middleware.checkToken, async (req, res, next) => {

  let response = {};

  try
  {
    let data = await models.Stage.find({}).sort('complexity').lean();

    response.stages = data;

    let currentLevel = await estimation.getCurrentLevel({userId: req.decoded.data._id}, data[0]._id);
    
    if(currentLevel)
    {
      response.currentLevel = {}
      response.currentLevel.name = currentLevel.name;
      response.currentLevel.id = currentLevel._id;
    }
    
    for(let i = 0; i < data.length; ++i)
    {
      if(currentLevel && currentLevel.stageId == data[i]._id.toString())
        response.currentLevel.stage = data[i].name;
      data[i].accepted = 0;
    }

    let userData = await models.User.findOne({_id: req.decoded.data._id});

    for(let i = 0; i < userData.acceptedEachStage.length; ++i)
    {
      for(let j = 0; j < data.length; ++j)
      {
        if(userData.acceptedEachStage[i].stageId == data[j]._id.toString())
          data[j].accepted = userData.acceptedEachStage[i].counter;
      }
    }

    return res.json(response);


  }
  catch(err)
  {
    console.log(err);
    return res.sendStatus(500);
  }
});


router.post('/level', middleware.checkToken, async (req, res, next) => {
  
  let response = {};
  
  try
  {
    let myStage = await models.Stage.findOne({_id: req.body.stageId});
    
    if(myStage)
    {
      response.maxXp = myStage.maxXp;
      response.stageName = myStage.name;
      response.counterOfLevels = myStage.counterOfLevels;

      let myUser = await models.User.findOne({_id: req.decoded.data._id});

      if(myUser)
      {
        let myStageData = await getUserStageInfo(myStage._id, myUser.acceptedEachStage);
        
        response.accepted = myStageData.counter;
        response.earnedXp = myStageData.xpOnStage; 

        let levels = await models.Level.find({stageId: myStage._id}).
        select('name xp position').sort('position').lean();
        

        //grab all submission on this stage
        //instead of one by one picking
        let mySubmissions = await models.Submission.find(
          {stageId: myStage._id, userId: myUser._id}
          ).sort('-efficiency').select('efficiency xp levelId').lean();

        let knownIds = [];
        let i = 0;
        
        //remove redundant data
        while(i < mySubmissions.length)
        {
          let isKnownLevel = knownIds.includes(mySubmissions[i].levelId.toString());
        
          if(isKnownLevel)
            mySubmissions.splice(i, 1);
          else
          {
            knownIds.push(mySubmissions[i].levelId.toString())
            ++i;
          }
        }

        //sort submission data in the same order with levels
        mySubmissions.sort(( a, b ) => {
            if (a.levelId.toString() < b.levelId.toString()){
              return -1;
            }
            if (a.levelId.toString() > b.levelId.toString() ){
              return 1;
            }
            return 0;
        })
        
        //check whether level is accepted or not
        i = 0;
        let j = 0;
        while(i < levels.length && j < mySubmissions.length)
        {
          if(levels[i]._id.toString() == mySubmissions[j].levelId.toString())
          {
            levels[i].accepted = true;
            levels[i].earnedXp = mySubmissions[j].xp;
            ++j;
          }
          ++i;
        }

        response.levels = levels;

        return res.send(response)
      }
    }
    res.sendStatus(400);
  }
  catch(e)
  {
    console.log(e)
    return res.sendStatus(500);
  }

});


module.exports = router;