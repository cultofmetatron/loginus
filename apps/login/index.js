var express  = require('express');
var app      = express();
var passport = require('passport');



app.get('/', function(req, res, next) {
  console.log('grr')
  res.render('login', {
    title: login
  });
});



module.exports = app;

