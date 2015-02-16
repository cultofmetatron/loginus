var express  = require('express');
var app      = express();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var mongoose = require('../../deps/mongoose');


passport.use(new LocalStrategy(function(username, password, done) {
  

}));


app.get('/', function(req, res, next) {
  console.log('grr')
  res.render('login', {
    title: 'login page'
  });
});






module.exports = app;

