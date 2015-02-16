var Strategy = require('passport-strategy').Strategy;
var util = require('util');
var _ = require('lodash');
var jwt = require('jsonwebtoken');

var JWTStrategy = function(secretKey, options, verify) {
  if (_.isFunction(options)) {
    verify = options;
    options = {};
  };
  
  if (!_.isFunction(verify)) {
    throw new Error('verify callback not supplied');
  }

  if (_.isUndefined(secret)) {
    throw new Error('secret must be defined');
  }
  
  Strategy.call(this);

  this.name = 'jwt-local';
  this._secretKey = secretKey;
  this._verify = verify;
  this._addToken = false;
  this._passReqToCallback = options.passReqToCallback;
  this._authScheme = options.authScheme || "jwt-local";
  this._tokenBodyField = options.tokenBodyField;
  this._verifOpts = {}

  if (options.issuer) {
    this._verifOpts.issuer = options.issuer;
  }

  if (options.audience) {
    this._verifOpts.audience = options.audience;
  }
  
  if (options.addToken && typeof options.addToken=="boolean") {
    this._addToken = options.addToken;
  }


};


util.inherits(JWTStrategy, PassportStrategy);


JWTStrategy.prototype.authenticate = function(req, options) {
  




}






