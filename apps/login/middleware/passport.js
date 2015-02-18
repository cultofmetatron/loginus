var passport = require('passport');
var LocalStrategy = require('passport-local');
var FacebookStrategy = require('passport-facebook');
var TwitterStrategy = require('passport-twitter').Strategy;

var mongoose = require('../../../deps/mongoose');
var jwt = require('jsonwebtoken');
var User = require('../models/user')(mongoose);
var tokenSecret = process.env.TOKEN_SECRET;
var _ = require('lodash');

var Facebook = require('facebook-node-sdk');


//local strategy, returns a jwt
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

//set up facebook strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FB_APPID,
    clientSecret: process.env.FB_SECRET,
    callbackURL: "http://localhost:"+ process.env.PORT + "/auth/facebook/callback",
    enableProof: false
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    var user = {
      login_type: 'facebook',
      fb_id: profile.id,
      fb_data: {
        accessToken: accessToken,
        refreshToken: refreshToken
      },
      fb_auth_data: profile
    };
    User.findOrCreateFBUser(user)
      .then(function(user) {
        done(null, user);
      })
      .catch(function(err) {
        done(err);
      })
    }
));

var retrieveFBProfile = function(accessToken) {
  var facebook = new Facebook({
    appID: process.env.FB_APPID,
    secret: process.env.FB_SECRET
  });
  facebook.setAccessToken(accessToken);
  return new Promise(function(resolve, reject) {
    facebook.api('/me', function(err, data) {
      if (err) { reject(err); }
      else {
        resolve(data);
      }
    })
  });
};

//twitter strategy
//http://127.0.0.1:5000/auth/twitter/callback
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: "http://127.0.0.1:"+ process.env.PORT + "/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    

    console.log('der profile in twitter strategy ', profile)

    done(null, false, {message: 'just foolin bros'})
  }
));

module.exports.authenticateTwitter = function(req, res, next) {
  passport.authenticate('twitter')(req, res, next);
};

module.exports.twitterCallback = function(req, res, next) {
  passport.authenticate('twitter', function(err, profile) {
    console.log('der profile: ', arguments);
    res.render('twitter-login', {
      jwt: 'yolo'
    })
  })(req, res, next);
};


module.exports.signupLocal = function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.createUser(_.extend({}, req.body, {login_type: 'local' }))
    .then(function(user) {
      console.log('a user', user, jwt)
      var token = jwt.sign({
        _id: user._id
      }, tokenSecret);

      res.status(200).json({
        message: 'successfully logged in',
        token: token
      });

    })
    .catch(next);
  } if ((req.body.type === 'fb' && req.body.accessToken && req.body.userID)) {
    console.log('facebook login!')
    retrieveFBProfile(req.body.accessToken)
      .then(function(data) {
        console.log('der data', data);
        res.send({
          message: profile,
          data: data
        })
      })
      .catch(err);
  
  } else {
    next(new Error('email and or password not provided'));
  }
};


module.exports.fbAuthenticate = function(req, res, next) {
  console.log('hitting this endpoint!!')
  passport.authenticate('facebook')(req, res, next);
};

module.exports.facebookCallback = function(req, res, next) {
  passport.authenticate('facebook', { failureRedirect: '/' } , function(err, user) {
    //does not get called
    if (err) { return res.status(400).send({message: err})}
    var token = jwt.sign({
      _id: user._id
    }, tokenSecret);
    res.render('oauth-fb', {
      jwt_token: token
    })

    
  })(req, res, next)

};

module.exports.authenticateLocal = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return next(new Error('unauthorized')); }

    var token = jwt.sign({
      _id: user._id
    }, tokenSecret);

    res.status(200).json({
      message: 'successfully logged in',
      token: token
    });
  })(req, res, next);
};

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.find({
    _id: id
  }).exec()
  .then(function(user) {
    done(null, user)
  }, function(err) {
    done(err);
  });
});





