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
    password_salt: String
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
  
  })


  return mongoose.model('User', UserSchema);

};


