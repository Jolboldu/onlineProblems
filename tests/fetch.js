var axios = require('axios');
// Make a request for a user with a given ID

async function getIndexPage() 
{

  var response = await axios.get('http://localhost:4000/');

  return response;
}


async function signup(email, password, firstName, lastName, country, locality, 
  acceptedEachStage, xp, school, acceptedCounter, headers='') 
{
  var response;
  try{
    response = await axios.post('http://localhost:4000/auth/fakeSignup', 
                                  {email, password, firstName, lastName, country, locality, 
                                   acceptedEachStage, xp, school, acceptedCounter}, headers);
  }
  catch(err){
    response = err;
  }
  return response
}


async function sendSolution(levelId, functions, headers, solvingTime) 
{
  var response;
  try{
    response = await axios.post('http://localhost:4000/game/submit', 
                                  {levelId, functions, solvingTime}, 
                                  {headers});
  }
  catch(err){
    response = err;
  }
  return response
}

async function deleteUser(headers) 
{
  var response;
  try{
    response = await axios.post('http://localhost:4000/auth/erase', {}, {headers});
  }
  catch(err){
    response = err;
  }
  return response
}


async function getStats(headers) 
{
  var response;
  try
  {
    response = await axios.get('http://localhost:4000/api/stats/', {headers});
  }
  catch(err){
    response = err;
  }
  return response
}

async function getDashboard(headers) 
{
  var response;
  try{
    response = await axios.get('http://localhost:4000/users/me',{headers});
  }
  catch(err){
    response = err;
  }
  return response
}


async function getStage(stageId) 
{
  var response;
  try{
    response = await axios.post('http://localhost:4000/level/getStage',{stageId});
  }
  catch(err){
    response = err;
  }
  return response
}

async function scroll(delta, knownIds, ratingOfLast) 
{
  var response;
  try{
    response = await axios.post('http://localhost:4000/api/stats/fakeScroll',{delta, knownIds, ratingOfLast});
  }
  catch(err){
    response = err;
  }
  return response
}


async function login(email, password) 
{
  var response;
  try{
    response = await axios.post('http://localhost:4000/auth/login', 
                                  {email, password});
  }
  catch(err){
    response = err;
  }
  return response
}

async function editUser(phoneNumber, password, headers, country, locality, school, grade) 
{
  var response;
  try{
    response = await axios.post('http://localhost:4000/auth/edit', 
                                  {phoneNumber, password, country, locality, school, grade}, 
                                  {headers});
  }
  catch(err){
    response = err;
  }
  return response
}

async function createLevel(name, blocks, hero, stars, restrictions, pointsForLevel, 
  stageId, position, headers) 
{
  var response;
  try{
    response = await axios.post('http://localhost:4000/level/create', 
                                  {name, blocks, hero, stars, restrictions, pointsForLevel,
                                    stageId, position}, 
                                  {headers});
  }
  catch(err){
    response = err;
  }
  return response
}

async function createStage(name, complexity, headers) 
{
  var response;
  try{
    response = await axios.post('http://localhost:4000/level/createStage', 
                                  {name, complexity}, 
                                  {headers});
  }
  catch(err){
    response = err;
  }
  return response
}

async function removeLevel(name, headers) 
{
  var response;
  try{
    response = await axios.post('http://localhost:4000/level/remove', {name}, {headers});
  }
  catch(err){
    response = err;
  }
  return response
}


async function getRanks() 
{
  var response;
  try{
    response = await axios.get('http://localhost:4000/users/getRanks');
  }
  catch(err){
    response = err;
  }
  return response
}




module.exports = {
  getIndexPage,
  sendSolution,
  signup,
  login,
  editUser,
  deleteUser,
  getDashboard,
  getStats,
  createLevel,
  getRanks,
  removeLevel,
  getStage
};
