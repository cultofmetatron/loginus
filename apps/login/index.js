var express  = require('express');
var app      = express();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var mongoose = require('../../deps/mongoose');

var User = require('./models/user')(mongoose);

passport.use(new LocalStrategy({
    usernameField: 'email'
  }, function(email, password, done) {
    User.passwordMatch({
      email: email,
      password: password
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


app.get('/', function(req, res, next) {
  console.log('grr')
  res.render('login', {
    title: 'login page'
  });
});






module.exports = app;

