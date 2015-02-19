var passport = require('passport');
var LocalStrategy = require('passport-local');
var FacebookStrategy = require('passport-facebook');
var TwitterStrategy = require('passport-twitter').Strategy;
var Promise = require('bluebird');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var tokenSecret = process.env.TOKEN_SECRET;
var _ = require('lodash');

var Facebook = require('facebook-node-sdk');
var mailer = require('../mailer');




//local strategy, returns a jwt
passport.use(new LocalStrategy({
  usernameField: 'email'
  }, function(email, password, done) {
  User.passwordMatch({
    email: email,
    password: password,
  })
  .then(function(user) {
    console.log('strategy user', user)
    if (user) {
      done(null, user);
    } else {
      done(null, user, {message: 'User not found'});
    }
  })
  .catch(function(err) {
    console.log('cosmonot', err);
    throw err
  })
  .catch(done);
}));
//http://loginus.herokuapp.com/auth/facebook/callback
//set up facebook strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FB_APPID,
    clientSecret: process.env.FB_SECRET,
    callbackURL: process.env.HOSTADDRESS + "/auth/facebook/callback",
    enableProof: false
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('configure strategy', profile);
    user = {};
    user.facebook = {
      id: profile.id,
      session_data: {
        accessToken: accessToken,
        refreshToken: refreshToken
      },
      auth_data: profile
    };
    console.log('inserting user, ', user)
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
console.log(process.env.HOSTADDRESS)
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.HOSTADDRESS + "/auth/twitter/callback"
  },  function(token, tokenSecret, profile, done) {
    //console.log('der profile in twitter strategy ', token, tokenSecret, profile)
    var user = {};
    try {
      var profile = JSON.parse(profile._raw)
    } catch(parseError) {
      return done(parseError);
    }
    user.twitter = _.extend({}, profile, {
      session_data: {
        token: token,
        token_secret: tokenSecret
      }
    })
    console.log('twitterStrategy', user)
    User.findOrCreateTwitterUser(user)
      .then(function(user) {
        done(null, user);
      })
      .catch(done)

  }
));

module.exports.authenticateTwitter = function(req, res, next) {
  passport.authenticate('twitter')(req, res,next) 
};

module.exports.twitterCallback = function(req, res, next) {
  passport.authenticate('twitter', function(err, user) {
    if (err) {
      return next(err)
    }
    /*
    Promise.try(function() {
      return User.find({
        'twitter.id':profile.id
      }).exec();
    })
    .then(function(users) {
      if (users.length === 0) {
        next(new Error('no suck user found'))
      }
    })
    */
    var token = jwt.sign({
      _id: user._id
    }, tokenSecret);

  
    res.render('twitter-login', {
      jwt_token: token
    });
  })(req, res, next);
};


module.exports.signupLocal = function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.createUser(_.extend({}, req.body))
    .then(function(user) {
      console.log('a user', user, jwt)
      var token = jwt.sign({
        _id: user._id
      }, tokenSecret);

      return Promise.all([
        mailer.sendWelcomeEmail(user),
        mailer.sendConfirmationEmail(user)
      ]).then(function() {
        res.status(200).json({
          message: 'successfully logged in',
          token: token
        });
      })
    })
    .catch(next);
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
    });
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

module.exports.createResetCode = function(req, res, next) {
  User.createResetCode({ email: req.body.email })
    .then(function(user) {
      return mailer.sendResetEmail(user);
    })
    .then(function() {
      res.send({
        message: 'reset code sent'
      })
    })
    .catch(next);
}

//GET - renders a view
module.exports.changePassword = function(req, res, next) {
  var resetCode = req.params.reset_code;
  if (_.isUndefined(resetCode)) {
    return next(new Error('no reset code specified'))
  };

  res.render('password-reset', {
    reset_code: resetCode
  });
};

module.exports.resetPassword = function(req, res, next) {


};

passport.serializeUser(function(user, done) {
  //done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  //here only because of twitter
});

module.exports.setSessions = function(app) {
  app.use(passport.initialize());
  app.use(passport.session());

};



