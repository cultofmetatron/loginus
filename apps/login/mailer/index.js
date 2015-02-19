var User = require('../models/user');
var Promise = require('bluebird');
var _ = require('lodash');
var fs = require('fs')
var path = require('path');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_KEY);

var confirmationTemplate = _.template(fs.readFileSync(path.join(__dirname, 'templates', 'confirmation.tpl'), 'utf8'));
var welcomeTemplate = _.template(fs.readFileSync(path.join(__dirname, 'templates', 'welcome.tpl'), 'utf8'));
var resetTemplate = _.template(fs.readFileSync(path.join(__dirname, 'templates', 'reset.tpl'), 'utf8'));

var injectables = {
  env: {
    host: process.env.HOSTADDRESS
  }
}

//post a confirm token. if its matches, then set the users confirmed 
//status to true
module.exports.confirm = function(req, res, next) {
  console.log('getting here?- confirm');
  var confirm_token = req.params.confirm_token;
  console.log('token', confirm_token);
  Promise.try(function() {
    return User.update({
      "local.confirm_token": confirm_token
    }, {
      "local.confirmed": true
    }, { multi: true })
    .exec();
  })
  .then(function() {
    res.redirect('/')
  })
  .catch(next);
};

module.exports.sendConfirmationEmail = function(opt) {
  opt = _.extend(opt, injectables)
  console.log('mailer opt: ', opt)
  var message = {
    html: confirmationTemplate(opt),
    subject: "please confirm your email!!",
    "from_email": "peter@example.com",
    "from_name": "Loginus",
    "to": [{
      "email": opt.local.email,
      "name": opt.local.email || "new user",
      "type": "to"
    }]
  }

  var async = false;
  var ip_pool = "Main Pool";

  return new Promise(function(resolve, reject) {
    mandrill_client.messages.send({
      "message": message,
      "async": async,
      "ip_pool": ip_pool
    }, resolve, reject)
  });
};

module.exports.sendWelcomeEmail = function(opt) {
  opt = _.extend(opt, injectables)

  var message = {
    html: welcomeTemplate(opt),
    subject: "welcome to loginus app!!",
    "from_email": "peter@example.com",
    "from_name": "Loginus",
    "to": [{
      "email": opt.local.email,
      "name": opt.local.email || "new user",
      "type": "to"
    }]
  }

  var async = false;
  var ip_pool = "Main Pool";

  return new Promise(function(resolve, reject) {
    mandrill_client.messages.send({
      "message": message,
      "async": async,
      "ip_pool": ip_pool
    }, resolve, reject)
  });
};

module.exports.sendResetEmail = function(opt) {
  opt = _.extend(opt, injectables)
  console.log('opt', opt)

  var message = {
    html: resetTemplate(opt),
    subject: "welcome to loginus app!!",
    "from_email": "peter@example.com",
    "from_name": "Loginus",
    "to": [{
      "email": opt.local.email,
      "name": opt.local.email || "new user",
      "type": "to"
    }]
  }

  var async = false;
  var ip_pool = "Main Pool";

  return new Promise(function(resolve, reject) {
    mandrill_client.messages.send({
      "message": message,
      "async": async,
      "ip_pool": ip_pool
    }, resolve, reject)
  });



};




