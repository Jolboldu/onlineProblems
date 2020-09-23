var express = require('express');
var router = express.Router();
var {
  Tutorial
} = require('../database/models')

router.get('/', (req, res, next) => {
  res.send('use this')
})

router.post('/create', async (req, res, next) => {
  try {
    let data = req.body
    if (data) {
      await Tutorial.create(data)
      res.sendStatus(200)
    } else
      res.sendStatus(400)
  } catch (e) {
    res.sendStatus(500)
  }
})

router.get('/tutorial_id=:tutorialId/lang=:lang', async (req, res, next) => {
  let id = req.params.tutorialId
  console.log(id);
  try {
    let data = await Tutorial.find({
      levelId: id,
      lang: req.params.lang || 'ru'
    }).sort('position').lean()
    if (data.length > 0) {
      res.json(data)
    } else
      res.sendStatus(404)
  } catch (err) {
    res.sendStatus(500)
  }
})

module.exports = router;