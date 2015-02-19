var dotenv = require('dotenv');
dotenv.load();


var mocha = require('mocha');
var should = require('should');
var _ = require('lodash');
var User = require('../models/user');

describe('User', function() {
 
  it('should create a user', function(done) {
    var user = {
      email: 'foobar@foobar.com',
      password: 'hushpuppy',
    };
    User.createUser(user)
      .then(function(user) {
        console.log(user);
        done();
      })
      .catch(done);
  });

  it('should error if there is a duplicate user', function(done) {
    var user = {
      email: 'foobar@foobar.com',
      password: 'hushpuppy',
    };
    User.createUser(user)
      .catch(function(err) {
        err.message.should.equal('duplicate email');
        done();
      });
  });

  it('should return true for a matching password, email pair', function(done) {
    var user = {
      email: 'foobar@foobar.com',
      password: 'hushpuppy',
    };
    User.passwordMatch(user)
      .then(function(matches) {
        matches.should.not.equal(false);
        done();
      })
      .catch(done)
  });

  it('should return false for a matching password, email pair', function(done) {
    var user = {
      email: 'foobar@foobar2.com',
      password: 'hushpuppy',
    };
    User.passwordMatch(user)
      .then(function(matches) {
        matches.should.equal(false);
        done();
      })
      .catch(done)
  });

  var reset_code;

  it("should create a reset code", function(done) {
    return User.createResetCode({
        email: 'foobar@foobar.com'
      })
      .then(function(user) {
        console.log('resset ', user)
        reset_code = user.local.reset_code;
        done()
      })
      .catch(done)
  });

  it("should chnage the password", function(done) {
    return User.changePassword({
      reset_code: reset_code,
      password: "hushkitty"
    })
    .then(function() {
      
      done();
    })
    .catch(done)
  });


  after(function(done) {
    //delete the user
    User.find({
      'local.email': 'foobar@foobar.com'}).remove().exec()
      .then(function() {
        done();
      }, done);
  });


});
