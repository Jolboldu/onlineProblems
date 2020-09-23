let jwt = require('jsonwebtoken');
var models = require('./database/models');


let checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

  if (token) {

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err){
        res.sendStatus(403);
      }
      else 
      {
        req.decoded = decoded;
        try
        {
          let myUser = await models.User.findOne({_id:decoded.data._id});
          myUser.lastLogin = Date.now();
          await myUser.save();
        }
        catch(e){
          console.log(e);
          return res.sendStatus(403);
        }
        next();  
      }
    });
  }
  else{
    res.sendStatus(403);
  }
};

let checkTokenAdmin = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

  if (token) {

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err){
        res.sendStatus(403);
      }
      else 
      {
        req.decoded = decoded;
        
        if(decoded.data.isAdmin){
          next();  
        }
        else
          res.sendStatus(403);
      }
    });
  }
  else{
    res.sendStatus(403);
  }
};




module.exports = {
  checkToken,
  checkTokenAdmin,
}
