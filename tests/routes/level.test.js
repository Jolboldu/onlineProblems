var axios = require('axios');
var fetch = require('../fetch')
var faker = require('faker');


const headers = {
  'Authorization': {}
}


let name = "name";
let blocks = [{color:"green",position:[0,0]}];
let hero =  {position:[0,0], direction:1};
let stars = [{position:[0, -3]}];
let pointsForLevel = {xp: 500, minNumberOfCommands:10};
let stageId = "5f2a96849289ce3828bce791";
let position = 6;
let restrictions = {
  allowedCommands:[
    "step",
    "right",
    "left",
    "if",
    "paint",
    "recursion"
  ],
  numberOfFunctions: 1,
  numberOfCommands: 1000,
  numberOfCommandsInFunction:[
    5,
    5
  ]
}

let token;


describe('test creating of levels level/create', () => {

  test('login', async () => {
    let response =  await fetch.login("sydykalyuulu_z@auca.kg", "Zhoma1999");
    headers.Authorization = response.data;
    expect(response.status).toEqual(200);
  });

  describe('invalid data', () => {
    test('invalid arguments', async () => {
      let response =  await fetch.createLevel('lala', "blocks", "hero", "stars", 
      "restrictions","pointsForLevel", "stageId", "position", headers);
      
      expect(response.response.status).toEqual(500);
    });

    test('not enough arguments', async () => {

      var response;
      
      try
      {
        response = await axios.post('http://localhost:4000/level/create', {name, blocks, hero, stars, 
        position, pointsForLevel, restrictions}, {headers});
      }
      catch(e)
      {
        response = e;

      }
      expect(response.response.status).toEqual(400);
    });
  });

  describe('creating of level and check ranks', () => {
    let ranks;
    let stage;
    for(let i = 1; i <= 10; ++i)
    {

      test(('create level ' + i), async () => {
        
        ranks = await fetch.getRanks();
        stage = await fetch.getStage(stageId);

        pointsForLevel.xp = i * 100;
        let response =  await fetch.createLevel(i.toString(), blocks, hero, stars, 
        restrictions, pointsForLevel, stageId, position, headers);
        expect(response.status).toEqual(200);  
      })
            
      test(('stage counter of levels after adding' + i), async () => {
       
        let response = await fetch.getStage(stageId);
        
          expect(response.data.counterOfLevels).toEqual(stage.data.counterOfLevels + 1);
        
      });
      
      test(('ranks changing after adding' + i), async () => {
       
        let response = await fetch.getRanks();
        
        for(let j = 0; j < ranks.length; ++i)
        {
          expect(ranks.data[j].xpFrom + i * 100 * ranks.data[j].percentageFrom / 100)
          .toEqual(response.data[j].xpFrom);
        }
      });

      test(('level remove' + i), async () => {
        ranks = await fetch.getRanks();
        stage = await fetch.getStage(stageId);

        let response = await fetch.removeLevel(i.toString(), headers);
        expect(response.status).toEqual(200);
      });

      test(('ranks changing after remove' + i), async () => {
       
        let response = await fetch.getRanks();
        
        for(let j = 0; j < ranks.length; ++i)
        {
          expect(ranks.data[j].xpFrom - i * 100 * ranks.data[j].percentageFrom / 100)
          .toEqual(response.data[j].xpFrom);
        }
      });

      test(('stage counter of levels after adding' + i), async () => {
       
        let response = await fetch.getStage(stageId);
        
        expect(response.data.counterOfLevels).toEqual(stage.data.counterOfLevels - 1);
        
      });

    }
  });

    
})

