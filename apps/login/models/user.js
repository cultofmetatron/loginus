var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));
var _ = require('lodash');
var uuid = require('node-uuid');
var mongoose = require('../../../deps/mongoose');


  var Schema = mongoose.Schema;
  var UserSchema = new Schema({
    fb_id: String,
    fb_data: Object,
    email: {
      type: String,
      unique: true,
      index: { sparse: true }
    },
    fb_auth_data: {
      type: Object
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
    twitter_token: String,
    twitter_tokenSecret: String,
    twitter_profile: Object,
    basic_login: {
      type: Boolean,
      default: false
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
    created_at: {
      type: Date,
      default: function() { return new Date(); }
    },
    last_login: {
      type: Date,
      default: function() { return new Date(); }
    }
  });


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
        var newUser = _.extend({}, params, {
          password_crypted: password_crypted,
          password_salt: password_salt
        });
        return this.create(newUser);
      })
      .catch(function(err) {
        /*
        if (err.message.match('E11000')) {
          throw new Error('duplicate email')
        } else {
          throw err;
        }
        */
        throw err;
      })
  });

  UserSchema.static('passwordMatch', function(opt) {
    var email = opt.email;
    var password = opt.password;
    return Promise
      .try((function() {
        return this.find({
          email: email
        }).exec();
      }).bind(this))
      .then(function(users) {
        if (users.length === 0) {
          return false;
        }
        var user = users[0];
        return bcrypt.hashAsync(password, user.password_salt)
          .then(function(hash) {
            return (hash === user.password_crypted) ?
              _.omit(user, 'password_crypted', 'password_salt') : false
          });
      });
  });

  UserSchema.static('findOrCreateFBUser', function(opt) {
    return Promise.try((function() {
      return this.find({
        fb_id: opt.fb_id,
      }).exec();
    }).bind(this))
    .bind(this)
    .then(function(users) {
      if (users.length === 0) {
        return this.create(opt)
      } else {
        return users[0];
      }
    })
  });

  UserSchema.static('findOrCreateFacebookUser', function(options) {
  
  })

  module.exports = mongoose.model('User', UserSchema);


