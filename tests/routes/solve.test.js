var axios = require('axios');
var fetch = require('../fetch')
var faker = require('faker');

let randomPassword = 'qwer';
let tokens1 = [];
let tokens2 = [];


let accepted = [
  [//counter = 15
    {stageId:"1", counter: 1},
    {stageId:"2", counter: 2},
    {stageId:"3", counter: 3},
    {stageId:"4", counter: 4},
    {stageId:"5", counter: 5},
  ],
  [//counter = 5
    {stageId:"1", counter: 1},
    {stageId:"2", counter: 1},
    {stageId:"3", counter: 1},
    {stageId:"4", counter: 1},
    {stageId:"5", counter: 1},
  ],
  [//counter = 17
    {stageId:"1", counter: 1},
    {stageId:"2", counter: 2},
    {stageId:"3", counter: 2},
    {stageId:"4", counter: 2},
    {stageId:"5", counter: 10},
  ],
  [//counter = 14
    {stageId:"1", counter: 10},
    {stageId:"2", counter: 1},
    {stageId:"3", counter: 1},
    {stageId:"4", counter: 1},
    {stageId:"5", counter: 1},
  ],
  [//counter = 10
    {stageId:"1", counter: 2},
    {stageId:"2", counter: 2},
    {stageId:"3", counter: 2},
    {stageId:"4", counter: 2},
    {stageId:"5", counter: 2},
  ]
];

let acceptedCounter = [15, 5, 17, 14, 10];
describe('create users and check dashboard stats', () => {
      describe('create 20 users', () => {
      
        for(let i = 0; i < 20; ++i)
        {
          test('signup', async () => {
            
            let xp;
            if(i < 10)
              xp = 10000000;
            else
              xp = 100;

            let response = await fetch.signup(faker.internet.email(), randomPassword, faker.name.firstName(), 
            faker.name.lastName(), "SexLand", "Bishkek", accepted[i%5], xp + i, 
            "turma", acceptedCounter[i%5]);  


            let headers = {
              'Authorization': {}
            }
            headers.Authorization = response.data;

            tokens1.push(headers);
            expect(response.status).toEqual(200);
          })
        }
  
      });
  
      
  
      describe('delete 20 users', () => {
  
        for(let i = 0; i < 20; ++i)
        {
          test('delete', async () => {
            let response = await fetch.deleteUser(tokens1[i]);
            expect(response.data).toEqual('OK');
          })
        }
      })
    });

    describe('rating with equal xp', () => {
      
      describe('create 20 users with the same xp', () => {
        for(let i = 0; i < 20; ++i)
        {
          test('signup', async () => {
            let xp;
            if(i < 10)
              xp = 10000000;
            else
              xp = 100;

            let response = await fetch.signup(faker.internet.email(), randomPassword, faker.name.firstName(), 
            faker.name.lastName(), "SexLand", "Bishkek", accepted[i%5], xp - 1,
             "turma", acceptedCounter[i%5]);
            
            let headers = {
              'Authorization': {}
            }
            headers.Authorization = response.data;

            tokens2.push(headers);
            expect(response.status).toEqual(200);
          })
        }
  
      });
  
  
      describe('delete 20 users with the same xp', () => {
  
        for(let i = 0; i < 20; ++i)
        {
          test('delete', async () => {
            let response = await fetch.deleteUser(tokens2[i]);
            expect(response.data).toEqual('OK');
          })
        }
  
      })
})
