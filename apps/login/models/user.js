var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));
var _ = require('lodash');
var uuid = require('node-uuid');
var mongoose = require('../../../deps/mongoose');


  var Schema = mongoose.Schema;
  var UserSchema = new Schema({
    local: {
      email: {
        type: String,
        unique: true,
        index: { sparse: true }
      },
      password_crypted: String,
      password_salt: String,
      confirmed: {
        type: Boolean,
        default: false
      },
      confirm_token: {
        type: String,
        unique: true,
        index: { sparse: true },
        default: function() { return uuid.v4(); }
      },
      reset_code: String
    },
    facebook: {
      id: {
        type: String,
        unique: true,
        index: { sparse: true }
      },
      session_data: {
        accessToken: String,
        refreshToken: String
      },
      auth_data: Object
    },
    twitter: {
      session_data: {
        token: String,
        token_secret: String
      },
      id: {
        type: String,
        unique: true,
        index: { sparse: true }
      },
      name: String,
      screen_name: String,
      url: String,
      status: Object,
      profile_image_url: String,
      profile_image_url_https: String
    },
    login_type: String,
    fb_login: {
      type: Boolean,
      default: false
    },
    twitter_login: {
      type: Boolean,
      default: false
    },
    local_login: {
      type: Boolean,
      default: false
    },
    created_at: {
      type: Date,
      default: function() { return new Date(); }
    },
    last_login: {
      type: Date,
      default: function() { return new Date(); }
    }
  });


  var generatePair = function(password) {
    return bcrypt.genSaltAsync(10)
      .then(function(salt) {
        return Promise.all([salt, bcrypt.hashAsync(password, salt)]);
      })
      .spread(function(password_salt, password_crypted) {
        return {
          password_salt: password_salt,
          password_crypted: password_crypted
        };
      });
  };


  //create a user with the options, returns a promise
   UserSchema.static('createUser', function(opt) {
    console.log('der user ', opt)
    var params = _.omit(opt, 'password' , 'password_crypted', 'password_salt');
    return bcrypt.genSaltAsync(10)
      .bind(this)
      .then(function(salt) {
        return Promise.all([
          salt,
          bcrypt.hashAsync(opt.password, salt)
        ]);
      })
      .spread(function(password_salt, password_crypted) {
        var newUser = _.extend({}, {
          local: {
            email: params.email,
            password_crypted: password_crypted,
            password_salt: password_salt
          }
        });
        return this.create(newUser);
      })
      .catch(function(err) {
        if (err.message.match('duplicate key error index')) {
          throw new Error('duplicate email')
        } else {
          throw err;
        }
      });
  });

  //generate a reset code for the model
  UserSchema.static('createResetCode', function(opt) {
    var email = opt.email;
    var resetCode = uuid.v4();
    return Promise
      .try((function() {
        return this.update({
          "local.email": email
        }, {
          "local.reset_code": resetCode
        }).exec();
      }).bind(this))
      .bind(this)
      .then(function(users) {
        return this.find({
          "local.reset_code": resetCode
        }).exec();
      })
      .then(function(users) {
        return users[0];
      });
  });


  
  //given a reset code, change the password
  UserSchema.static('changePassword', function(opt) {
    return generatePair(opt.password)
      .then((function(pair) {
        return this.update({
          "local.reset_code": opt.reset_code
        }, {
          "local.reset_code": null,
          "local.password_crypted": pair.password_crypted,
          "local.password_salt": pair.password_salt
        }).exec();
      }).bind(this));
  });

  UserSchema.static('passwordMatch', function(opt) {
    var email = opt.email;
    var password = opt.password;
    return Promise
      .try((function() {
        return this.find({
          "local.email": email
        }).exec();
      }).bind(this))
      .then(function(users) {
        if (users.length === 0) {
          return false;
        }
        var user = users[0];
        return bcrypt.hashAsync(password, user.local.password_salt)
          .then(function(hash) {
            return (hash === user.local.password_crypted) ?
              _.omit(user, 'password_crypted', 'password_salt') : false
          });
      });
  });

  //opt: id
  UserSchema.static('findOrCreateFBUser', function(opt) {
    return Promise.try((function() {
      return this.find({
        "facebook.id": opt.facebook.id
      }).exec();
    }).bind(this))
    .bind(this)
    .then(function(users) {
      if (users.length === 0) {
        return this.create(opt)
      } else {
        return users[0];
      }
    });
  });

  UserSchema.static('findOrCreateTwitterUser', function(opt) {
    return Promise.try((function() {
      return this.find({
        "twitter.id": opt.twitter.id
      }).exec();
    }).bind(this))
    .bind(this)
    .then(function(users) {
      if (users.length === 0) {
        return this.create(opt)
      } else {
        return users[0];
      }
    });
  });

 
  module.exports = mongoose.model('User', UserSchema);


