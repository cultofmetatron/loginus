var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));
var _ = require('lodash');




module.exports = function(mongoose) {

  var Schema = mongoose.Schema;

  var UserSchema = new Schema({
    id: {
      type: String,
      unique: true
    },
    email: {
      type: String,
      unique: true,
    },
    login_type: String,
    password_crypted: String,
    password_salt: String,
    confirmed: {
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
        console.log('fabulous', newUser )
        return this.create(newUser);
      })
      .catch(function(err) {
        console.log(err.message)
        if (err.message.match('E11000')) {
          throw new Error('duplicate email')
        } else {
          throw err;
        }
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
        var user = users[0];
        console.log('gets here', user)
        return bcrypt.hashAsync(password, user.password_salt)
          .then(function(hash) {
            console.log('but not here?')
            return hash === user.password_crypted;
          })
      })
  
  })


  return mongoose.model('User', UserSchema);

};

