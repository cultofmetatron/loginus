var express  = require('express');
var app      = express();
var passport = require('./middleware/passport');
var bodyParser = require('body-parser');

app.use(bodyParser.json())

app.get('/login', function(req, res, next) {
  console.log('grr')
  res.render('login', {
    title: 'login page'
  });
});

app.post('/login', passport.authenticateLocal);
app.post('/signup', passport.signupLocal);

var mailer = require('./mailer');

app.get('/auth/mailer/confirm/:confirm_token', mailer.confirm)
app.get('/auth/facebook', passport.fbAuthenticate);
app.get('/auth/facebook/callback', passport.facebookCallback);
app.get('/auth/twitter', passport.authenticateTwitter);
app.get('/auth/twitter/callback', passport.twitterCallback);



app.use(function(err, req, res, next) {
  res.status(404).json({
    message: err.message
  });
});


module.exports.app = app;

