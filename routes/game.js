var express = require('express');
var router = express.Router();
var middleware = require('../middleware')
var models = require('../database/models');
var gameEngine = require('../build/engine.bundle')
var estimation = require('../estimation')
var validator = require('../validation');


router.get('/', (req, res, next) => {
  res.render('game')
})

function incrementAcceptedEachStage(acceptedEachStage, myStageId, xp, counter)
{
  for(let i = 0; i < acceptedEachStage.length; ++i)
  {
    if(acceptedEachStage[i].stageId.toString() == myStageId.toString()){
      acceptedEachStage[i].counter += counter;
      acceptedEachStage[i].xpOnStage += xp;
      return;
    }
  }

  acceptedEachStage.push({stageId: myStageId, counter: 1, xpOnStage: xp});
}

router.post('/submit', middleware.checkToken, (req, res, next) => {

  if(!validator.isValidSubmitData(req.body))
    return res.sendStatus(400);

  //searching for level
  models.Level.findOne({ _id: req.body.levelId }, (levelErr, levelData) => {
    
    if (levelErr){
      console.log(levelErr);
      res.sendStatus(500);
    }
    else if (levelData) 
    {
      let result;
      
      //check the solution
      try 
      {
        result = estimation.estimateSolution(levelData, req.body.functions);
      }
      catch (e) {
        result = false;
        console.log(e);
      }

      if (!result)
        res.sendStatus(400); //in case of syntax error in user's solution
      else if (result.isAccepted)
      {
        
        //get best submission so far on the level 
        models.Submission.findOne({userId: req.decoded.data._id, levelId: req.body.levelId},
                                  null, {sort: '-xp'}, (err, subdata) => {
          if(err){
            console.log(err);
            res.sendStatus(500);
          }
          else
          {
            models.User.findOne({ _id: req.decoded.data._id}, (error, userData) => {
              if (error)
                return res.sendStatus(500);
              else if (userData) 
              {

                if(subdata) // if there is previous submission on the same level
                {  

                  if(result.xp > subdata.xp) // if new submission beats last one
                  {

                    userData.xp += (result.xp - subdata.xp);

                    //recalculate average numbers
                    userData.solvingTime *= userData.acceptedCounter;
                    userData.solvingTime += (req.body.solvingTime - subdata.solvingTime);
                    userData.solvingTime /= userData.acceptedCounter;

                    userData.efficiency *= userData.acceptedCounter;
                    userData.efficiency += result.xp / levelData.pointsForLevel.xp - subdata.efficiency;
                    userData.efficiency /= userData.acceptedCounter;
                    
                    incrementAcceptedEachStage(userData.acceptedEachStage, 
                      levelData.stageId, result.xp - subdata.xp, 0);

                  }
                }
                else //first submission on the level
                {

                  userData.xp += result.xp;

                  //recalculate average numbers

                  userData.efficiency *= userData.acceptedCounter;
                  userData.efficiency += result.xp / levelData.pointsForLevel.xp;
                  userData.efficiency /= userData.acceptedCounter + 1;
                  
                  userData.solvingTime *= userData.acceptedCounter;
                  userData.solvingTime += req.body.solvingTime;
                  userData.solvingTime /= userData.acceptedCounter + 1;

                  incrementAcceptedEachStage(userData.acceptedEachStage, levelData.stageId, result.xp, 1);
                  
                  userData.acceptedCounter += 1;                  

                }

                userData.save((Err, userNewData) => {
                  if(Err){
                    console.log(Err);
                    res.sendStatus(500);    
                  }
                  else
                  {
                    let submission = new models.Submission({
                      userId: req.decoded.data._id,
                      solution: req.body.functions,
                      levelId: req.body.levelId,
                      executionTime: result.time,
                      xp: result.xp,
                      stageId: levelData.stageId,
                      efficiency: result.xp / levelData.pointsForLevel.xp,
                      solvingTime: req.body.solvingTime,
                      date: Date.now()
                    }).save((sumbissionErr) => {
                      if (sumbissionErr){
                        console.log(sumbissionErr)
                        res.sendStatus(500);
                      }
                      else
                      {
                        res.json({xp:userData.xp});
                      }
                    }) 
                  }               
                });
                
              }
              else
                res.sendStatus(403);
            });
          }
        });
      }
      else
        res.sendStatus(422) //wrong solution
    }
    else //no level with provided id
      res.sendStatus(400);

  })
})


module.exports = router;