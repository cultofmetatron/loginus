var jwt = require('express-jwt');
var jwt_secret = process.env.TOKEN_SECRET;
var mongoose = require('../../../deps/mongoose');
var User = require('../modules/user.js')(mongoose);
var Promise = require('bluebird');

//authorize pipeline gets the user model for that user
module.exports.authorize = function(req, res, next) {
  jwt({secret: jwt_secret})(req, res, function(req, res) {
    if (req.user) {
      req.user._id
      Promise.try(function() {
        return User.find({
          _id: res.user._id
        }).exec();
      })
      .then(function(users) {
        if (users.length === 0) {
          throw new Error('no user with that token!')
        } else {
          return users[0]
        }
      })
      .then(function(user) {
        req.user = user;
        next();
      });
    } else {
      next(new Error('Unauthorized'));
    }
  });
};



