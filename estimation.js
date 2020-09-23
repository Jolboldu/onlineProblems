var models = require('./database/models');
const { PerformanceObserver, performance } = require('perf_hooks');
var gameEngine = require('./build/engine.bundle')
const MongoClient = require("mongodb").MongoClient;
const {ObjectId} = require('mongodb'); // or ObjectID 
const fs = require('fs');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

client.connect();

async function getCurrentLevel(query, firstStageId) {
	let currentLevel;

  // define a database and collection on which to run the method
  const database = client.db("onlineProblems");
  const submissions = database.collection("submissions");
  const levels = database.collection("levels");
  const stages = database.collection("stages");

  const options = {
  	sort: {date : -1}
  }

  const lastSubmission = await submissions.findOne(query, options);

  if(lastSubmission)
  {
  	let lastLevel = await levels.findOne({_id: ObjectId(lastSubmission.levelId)});

    currentLevel = await levels.findOne({stageId: lastLevel.stageId, 
      position: {$gt: lastLevel.position}}, {sort: {position: 1}, limit: 1});

    if(currentLevel == undefined)
    {
      let lastStage = await stages.findOne({_id: ObjectId(lastLevel.stageId)});
      let currentStage = await stages.findOne({complexity: {$gt: lastStage.complexity}},
                                              {sort:{complexity: 1}, limit: 1});

      if(currentStage != undefined){
        currentLevel = await levels.findOne({stageId: currentStage._id.toString(),
          position: {$gt: 0}}, {sort: {position: 1}, limit:1});
      }
      else
      {
        currentLevel = await levels.findOne({stageId: firstStageId.toString()},
                                        {sort: {position: 1}, limit:1})
      }
    }
  }
  else
  {
    currentLevel = await levels.findOne({stageId: firstStageId.toString()},
                                        {sort: {position: 1}, limit:1})
  }
 

  return currentLevel;  
}


function estimateSolution(data, functions)
{
  let level = new gameEngine.Level(data.name, data.blocks, data.hero, 
									data.stars, data.restrictions, data.pointsForLevel);


  if(functions.length == 0)
	{
		let result = {
			isAccepted: false,
			time: 0
		}

		return result;
	}

	//functions init
	let arrayOfFunctions = [];
	functions.forEach((element) => {
		arrayOfFunctions.push(level.createFunction(element.name))
	})

	for(let i = 0; i < arrayOfFunctions.length; ++i)
	{
		functions[i].commands.forEach((element) => {

			let tmpArray = [];

			level.pushToCustomFunction(arrayOfFunctions[i], element, tmpArray, arrayOfFunctions);
		})
	}

  //game init and perfomance
	let game = new gameEngine.Game(level, arrayOfFunctions[0]);

	let begin = performance.now() 
	let isAccepted = game.check();
	let end = performance.now();

	let result = {
		isAccepted,
    time: (end-begin),
    NumberOfCommands : level.counterOfCommands,
    xp: calculateXp(level.pointsForLevel.minNumberOfCommands, level.pointsForLevel.xp, level.counterOfCommands)
	}
	return result;
}

function calculateXp(minNumberOfCommands, xp, currentNumberOfCommands)
{

  let calculatedXp = xp * (minNumberOfCommands / currentNumberOfCommands);

  return xp;
}

function forceSearch(array, element)
{
  for(let i = 0; i < array.length; ++i)
  {
    if(array[i]._id.toString() == element._id.toString())
      return i;
  }
  return -1;
}

function getRandom(max, min) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}


var readDirPromise = function(imageFolder) {
  return new Promise(function(ok, notOk) {
    fs.readdir(imageFolder, function(err, data) {
        if (err) {
          notOk(err)
        } else {
          ok(data)
        }
    })
  })
}


module.exports = {
  estimateSolution,
  forceSearch,
  getCurrentLevel,
  getRandom,
  readDirPromise
}
