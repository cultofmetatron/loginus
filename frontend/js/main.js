
angular.module('app', ['ui.bootstrap'])
.controller('TabsAccounts', function ($scope, $window, $http) {

  $scope.postLogin = function(data) {
    console.log('data', data)
    return $http.post('/login', data)
      .success(function(data) {
        console.log('success', data);
        $window.JWT_TOKEN = data.token;
      })
      .error(function(err) {
        console.log('login error', err)
      });
  };

  $scope.postSignup = function(data) {
    return $http.post('/signup', data)
      .success(function(data) {
        console.log('success', data)
        $window.JWT_TOKEN = data.token;
      })
      .error(function(err) {
        console.log('signup error', err)
      });

  };


  
  $scope.loginHandler = function(login) {
    console.log('login', login);
    $scope.postLogin({
      email: login.email,
      password: login.password
    })
  };

  
  
  $scope.signupHandler = function(signup) {
    console.log('signup', signup);
    if (signup.password === signup.passwordConfirm) {
      $scope.postSignup({
        email: signup.email,
        password: signup.password
      })
    } else {
      console.log('passowords do not match')
    }
  };
})
.controller('OauthAccount', function($scope, $window, $http) {

  $scope.twitterLogin = function() {
    console.log('twitter logginer')
  };

  $scope.facebookLogin = function() {
    console.log('faceebooko');
  }


})














