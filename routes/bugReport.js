var express = require('express');
var router = express.Router();
var bot = require('../telegram')

const chat_id = process.env.TELEGRAM_CHAT_ID

router.post('/', (req, res) => {
  if (req.body.email && req.body.message) {
    res.sendStatus(200)
    bot.sendMessage(chat_id, ``)
  } else res.sendStatus(400)
})

router.post('/noSchool', (req, res) => {
  if (req.body.email, req.body.locality) {
    res.sendStatus(200)
    bot.sendMessage(chat_id, `Школа не найдена:\n Отправитель: ${req.body.email}, Регион: ${req.body.locality}.\nСвзяжитесь с пользователем как можно скорее.`)
  }
  else res.sendStatus(400)
})

module.exports = router;
