var passport = require('passport');
var LocalStrategy = require('passport-local');
var mongoose = require('../../../deps/mongoose');
var jwt = require('jsonwebtoken');
var User = require('../models/user')(mongoose);
var tokenSecret = process.env.TOKEN_SECRET;
var _ = require('lodash');

passport.use(new LocalStrategy({
  usernameField: 'email'
  }, function(email, password, done) {
  User.passwordMatch({
    email: email,
    password: password,
    login_type: 'local'
  })
  .then(function(user) {
    if (user) {
      done(null, user);
    } else {
      done(null, user, {message: 'User not found'});
    }
  })
  .catch(done);
}));

module.exports.signupLocal = function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.createUser(_.extend({}, req.body, {login_type: 'local' }))
    .then(function(user) {
      console.log('a user', user, jwt)
      var token = jwt.sign({
        'email': user.email,
        'type': user.type,
        _id: user._id
      }, tokenSecret);

      res.status(200).json({
        message: 'successfully logged in',
        token: token
      });

    })
    .catch(next);
  } else {
    next(new Error('email and or password not provided'));
  }
};


module.exports.authenticateLocal = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return next(new Error('unauthorized')); }

    var token = jwt.sign({
      'email': user.email,
      'type': user.type,
      _id: user._id
    }, tokenSecret);

    res.status(200).json({
      message: 'successfully logged in',
      token: token
    });
  })(req, res, next);
};
