
var User = require('../models/user');
var Promise = require('bluebird');
//post a confirm token. if its matches, then set the users confirmed 
//status to true
module.exports.confirm = function(req, res, next) {
  console.log('getting here?- confirm');
  var confirm_token = req.params.confirm_token;
  console.log('token', confirm_token);
  Promise.try(function() {
    return User.update({
      confirm_token: confirm_token
    }, {
      confirmed: true
    }, { multi: true })
    .exec();
  })
  .then(function() {
    res.render('login', {
      notice: 'email confirmed'
    })
  })
  .catch(next);
};





