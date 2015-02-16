var mocha = require('mocha');
var should = require('should');
var _ = require('lodash');
var mongoose = require('../../../deps/mongoose');
var User = require('../models/user')(mongoose);

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
        matches.should.equal(true);
        done();
      })
      .catch(done)
  });

  after(function(done) {
    //delete the user
    User.find({email: 'foobar@foobar.com'}).remove().exec()
      .then(function() {
        done();
      }, done);
  });


});
