var express = require('express');
var app     = express();



app.get('/', function(req, res, next) {
  console.log('grr')
  res.render('login', {
  
  });
});



module.exports = app;

