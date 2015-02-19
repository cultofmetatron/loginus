var express  = require('express');
var app      = express();
var passport = require('./middleware/passport');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session'); //required for twitter oauth

app.use(cookieParser())
app.use(bodyParser.json())

app.use(session({
  secret: 'keyboard cat',
  cookie: { maxAge: new Date(Date.now() +     3600000), },
  resave: true,
  saveUninitialized: true
}));


passport.setSessions(app);

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
app.post('/auth/mailer/reset/', passport.createResetCode);
app.get('/auth/mailer/reset/:reset_code', passport.changePassword);
app.post('/auth/mailer/resetpassword', passport.resetPassword)


app.get('/auth/facebook', passport.fbAuthenticate);
app.get('/auth/facebook/callback', passport.facebookCallback);
app.get('/auth/twitter', passport.authenticateTwitter);
app.get('/auth/twitter/callback', passport.twitterCallback);

app.get('/email-exists', function(req, res, next) {
  res.status(200).send({})
})


app.use(function(err, req, res, next) {
  console.log('login app error', err.stack)
  res.status(404).json({
    message: err.message
  });
});


module.exports.app = app;

