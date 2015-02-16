var express  = require('express');
var app      = express();
var passport = require('./middleware/passport');
var bodyParser = require('body-parser');

app.use(bodyParser.json())

app.get('/', function(req, res, next) {
  console.log('grr')
  res.render('login', {
    title: 'login page'
  });
});

app.post('/login', passport.authenticateLocal);
app.post('/signup', passport.signupLocal);




module.exports = app;

