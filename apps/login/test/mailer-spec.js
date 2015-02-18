var dotenv = require('dotenv');
dotenv.load();

var mocha = require('mocha');
var should = require('should');
var _ = require('lodash');

var mailer = require('../mailer');

describe('mailer', function() {

  it('should send a confirmation mail', function(done) {
    mailer.sendConfirmationMail({
      email: 'cultofmetatron@aumlogic.com',
      confirmation_token: "asfgasdkygfaks"
    })
    .then(function() {
      done()
    })
    .catch(function(err) {
      done(err);
    })
  
  
  });





});
