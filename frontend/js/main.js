
angular.module('app', ['ui.bootstrap'])
.controller('TabsAccounts', function ($scope, $window) {
  $scope.loginHandler = function() {
    console.log('login', arguments);
  };

  $scope.signupHandler = function() {
    console.log('signup', arguments);
  
  };
  

});














