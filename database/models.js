var mongoose = require('mongoose');
var schema = require('./schema');

const level = mongoose.model('level', schema.Level);
const user = mongoose.model('user', schema.User);
const submission = mongoose.model('submission', schema.Submission);
const like = mongoose.model('like', schema.LikeHistory);
const rank = mongoose.model('rank', schema.Rank);
const stage = mongoose.model('stage', schema.Stage);
const tutorial = mongoose.model('tutorial', schema.Tutorial);
const school = mongoose.model('school', schema.School)

module.exports = {
  Level: level,
  User: user,
  Submission: submission,
  Like: like,
  Rank: rank,
  Stage: stage,
  Tutorial: tutorial,
  School: school
}