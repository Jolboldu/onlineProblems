var express = require('express');
var router = express.Router();
var models = require('../database/models');
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var middleware = require('../middleware');
var validator = require('../validation');
var nodemailer = require("nodemailer");
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var passport = require('passport')
var multer = require('multer')
const path = require('path');
var estimation = require('../estimation')
const imageFolder = './public/uploads/avatars/templates';
const sharp = require('sharp');
const fs = require('fs')

const bot = require('../telegram');
const { checkToken } = require('../middleware');

let transporter = nodemailer.createTransport({
  host: "in-v3.mailjet.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  },
});
/*
//oauth2 setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://balatech.asia/auth/oauth2callback"
  },

  function (accessToken, refreshToken, profile, cb) {
    models.User.findOne({
      email: profile._json.email
    }, (err, data) => {
      if (err)
        console.log(err)
      else {
        if (data) {
          return cb(null, data);
        } else {
          let user = new models.User({
            email: profile._json.email,
            firstName: profile._json.given_name,
            lastName: profile._json.family_name,
            avatar: profile._json.picture,
            isActive: true,
            lastLogin: Date.now()
          }).save((savingErr, savingData) => {
            if (savingErr)
              console.log(savingErr);
            else {
              return cb(null, savingData);
            }
          });
        }
      }
    })
  }
));
*/

/*
router.get('/google', passport.authenticate('google', {
  scope: ['email profile']
}));

router.get('/oauth2callback', passport.authenticate('google', {
  failureRedirect: '/users/getRanks',
  session: false
}), (req, res) => {
  // Successful authentication, redirect home.
  let data = req.user;

  const token = jwt.sign({
    data
  }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7 days"
  });
  res.type('text/plain')
  res.send(token);
});
*/

router.post('/searchSchool', async (req, res) => {
  let { name, locality } = req.body
  let regex = new RegExp(name)
  let localityRegex = new RegExp(locality)
  try {
    let data = await models.School.find({'name': { $regex: regex, $options: 'i' }, 'address': {$regex: localityRegex, $options: 'i'}}).limit(5)
    let result = []
    for (let school of data) {
      result.push({ description: `${school.name}, ${school.address}`})
    }
    res.json(result)
  }
  catch (err) {
    res.sendStatus(500)
  }
})

async function isAvailableEmail(email) {
  let result = true
  try {
    result = !await models.User.exists({
      email: email
    })
  } catch (err) {
    return false
  }
  return result
}


router.get('/getLang', middleware.checkToken, async (req, res) => {
  let lang = req.decoded.data.language || 'ru'
  res.type('text/plain')
  res.send(lang)
})

router.post('/isAvailableEmail', async (req, res) => {
  if (req.body.email === undefined)
    res.sendStatus(400)
  let email = req.body.email
  let isAvailable = await isAvailableEmail(email)
  res.json({
    result: isAvailable
  })
})


//image upload
var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/avatars')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  }),
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return callback(new Error('Only images are allowed'))
    }
    callback(null, true)
  }
}).single('avatar');

async function resizeFile(path) {
  let buffer = await sharp(path)
    .resize(256,144, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .toBuffer();
  return sharp(buffer).toFile(path);
}

router.post('/signup', upload, async (req, res, next) => {

  if (validator.isEmail(req.body.email) && validator.isValidPassword(req.body.password)) {
    
    //check whether there is loaded image or not
    try 
    {
      let myUser = await models.User.findOne({
        email: req.body.email
      });
      if (myUser)
        return res.sendStatus(400);

      //image processing
      let avatar;

      if (req.file)
      {
        avatar = req.file.path.substring(6);
        await resizeFile(req.file.path);
      }
      else {
        randomImages = await estimation.readDirPromise(imageFolder);
        avatar = '/uploads/avatars/templates/' + randomImages[estimation.getRandom(randomImages.length - 1, 0)];
      }

      let phoneNumber;

      if (validator.IsPhoneNumber(req.body.phoneNumber))
        phoneNumber = req.body.phoneNumber;


      let user = new models.User({
        password: req.body.password,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        country: req.body.country,
        locality: req.body.locality,
        language: req.body.language || 'ru',
        isActive: false,
        avatar: avatar,
        phoneNumber: phoneNumber,
        lastLogin: Date.now(),
        school : req.body.school,
        grade: req.body.grade
      });

      await user.save();
      let data = user;
      const token = jwt.sign({
        data
      }, process.env.JWT_SECRET_KEY, {
        expiresIn: "7 days"
      });


      // let info = transporter.sendMail({
      //   from: process.env.MAIL_ADDRESS,
      //   to: req.body.email, // list of receivers
      //   subject: "verification code", // Subject line
      //   text: myVerificationCode.toString(), // plain text body
      // });

      bot.sendMessage(process.env.TELEGRAM_NEWUSER_CHAT_ID, `Новый пользователь: ${req.body.firstName} ${req.body.lastName}\nE-mail: ${req.body.email}\nLocality: ${req.body.country}, ${req.body.locality} \nSchool: ${req.body.school}, class: ${req.body.grade}`)
      res.type('text/plain')
      return res.send(token);
    
    } catch (e) {
      console.log(e)
      res.sendStatus(500);
    }

  } else
    res.sendStatus(400);

})

//uncomment to test with jest (test/routes)

// router.post('/fakeSignup', upload, (req, res, next)=>{

//     let user = new models.User({
//       password: req.body.password,
//       email: req.body.email,
//       firstName: req.body.firstName,
//       lastName: req.body.lastName,
//       country: req.body.country,
//       locality: req.body.locality,
//       isActive: true,
//       acceptedEachStage: req.body.acceptedEachStage,
//       acceptedCounter: req.body.acceptedCounter,
//       xp: req.body.xp,
//       school: req.body.school
//     }).save((err, data) => {
//       if (err){
//         console.log(err);
//         res.sendStatus(500);
      
//       }
//       else 
//       {
//         const token = jwt.sign({ data }, process.env.JWT_SECRET_KEY, {
//           expiresIn: "24h"
//         });
        
//         res.type('text/plain')
        
//         res.send(token);
//       }

//     })
// })

// router.post('/erase', middleware.checkToken, (req, res, next) => {
//   models.User.findOne({_id: req.decoded.data._id }, (error, data) => {
//     if (error)
//       res.sendStatus(500);
//     else if (data) {

//       data.remove((removeError, removedata) => {
//         if(removeError)
//           res.sendStatus(500);
//         else
//           res.sendStatus(200);
//       })
//     }
//     else
//       res.sendStatus(400);
//   });
  
// })


router.post('/login', async (req, res, next) => {
  if (validator.isEmail(req.body.email)) {

    let data = await models.User.findOne({
      email: req.body.email
    });
    if (data) {
      if (bcrypt.compareSync(req.body.password, data.password)) {
        const token = jwt.sign({
          data
        }, process.env.JWT_SECRET_KEY, {
          expiresIn: "7 days"
        });

        data.lastLogin = Date.now();
        await data.save();
        res.type('text/plain')
        res.send(token);
      } else {
        console.log(data);
        res.sendStatus(400);
      }
    } else
      res.sendStatus(400);
  } else
    res.sendStatus(400);
})

router.post('/delete', middleware.checkToken, (req, res, next) => {

  models.User.findOne({
    _id: req.decoded.data._id
  }, (error, data) => {
    if (error)
      res.sendStatus(500);
    else if (data) {
      if (bcrypt.compareSync(req.body.password, data.password)) {

        data.isActive = false;

        data.save((err, data) => {
          res.sendStatus(200);
        })

      } else
        res.sendStatus(400);
    } else
      res.sendStatus(400);


  });

})


router.post('/edit', middleware.checkToken, (req, res, next) => {

  models.User.findOne({
    _id: req.decoded.data._id
  }, (error, data) => {
    if (error)
      res.sendStatus(500);
    else if (data) {

      if (bcrypt.compareSync(req.body.password, data.password)) {

        //edit if exists
        data.country = (req.body.country ? req.body.country : data.country)
        data.locality = (req.body.locality ? req.body.locality : data.locality);
        data.school = (req.body.school ? req.body.school : data.school);
        data.grade = (req.body.grade ? req.body.grade : data.grade);
        data.language = (req.body.language ? req.body.language : data.language);
        data.phoneNumber = (req.body.phoneNumber ? req.body.phoneNumber : data.phoneNumber);

        data.save((err, data) => {
          if (err)
            res.sendStatus(500);
          else
            res.sendStatus(200);
        })

      } else
        res.sendStatus(400);

    } else
      res.sendStatus(400);


  });
})


router.post('/activate', (req, res, next) => {

  models.User.findOne({
    email: req.body.email
  }, (error, data) => {
    if (error)
      res.sendStatus(500);
    else if (data) {
      if (bcrypt.compareSync(req.body.password, data.password)) {

        if (req.body.verificationCode == data.verificationCode) {

          data.isActive = true;
          data.lastLogin = Date.now();

          data.save((err, data) => {
            if (err)
              res.sendStatus(500);
            else {
              const token = jwt.sign({
                data
              }, process.env.JWT_SECRET_KEY, {
                expiresIn: "7 days"
              });
              res.type('text/plain')
              res.send(token);
            }
          })
        } else {
          res.sendStatus(400);
        }
      } else
        res.sendStatus(400);

    } else
      res.sendStatus(400);
  });
})

router.get('/refresh', middleware.checkToken, (req, res, next) => {

  // let token = req.headers['x-access-token'] || req.headers['authorization'];

  // jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
  //   if(err)
  //     return res.sendStatus(500);

  // delete payload.iat;
  // delete payload.exp;
  // let data = payload.data;
  delete req.decoded.data.iat;
  delete req.decoded.data.exp;
  let data = req.decoded.data;
  let newToken = jwt.sign({
    data
  }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7 days"
  });
  res.type('text/plain')
  res.send(newToken);
  // });
})

router.post('/isAvailable', (req, res, next) => {

  if (validator.isEmail(req.body.email)) {
    models.User.findOne({
      email: req.body.email
    }, (err, data) => {
      if (err)
        return res.sendStatus(500);
      if (data)
        return res.sendStatus(400);
      res.sendStatus(200);
    })
  } else
    res.sendStatus(400);
})

module.exports = router;