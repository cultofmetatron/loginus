
angular.module('app',[
  'ui.bootstrap',
  'facebook',
  'angular-jwt',
  'ngCookies'
])
.config(function($httpProvider, FacebookProvider, jwtInterceptorProvider) {
  // Set your appId through the setAppId method or
  // use the shortcut in the initialize method directly.
  FacebookProvider.init('1549928668626444');

   //look for the jwt
  jwtInterceptorProvider.tokenGetter = ['$cookieStore', function($cookieStore) {
    return $cookieStore.get('jwt');
  }];

})
.factory('Reset', function($http, $q) {
  return {
    reset: function(password, reset_code) {
      return $http.post('/resetpassword', {
          password: password,
          reset_code: reset_code
        });
    }
  };
})
.controller('ResetCtrl', function($scope, Reset) {
  $scope.ruben = "I am ruben";
  $scope.reset = $scope.reset || {}
  $scope.submitted = false;
  $scope.reset.reset_code = $('.reset_code').text();
  $scope.submitReset = function(password, reset_code) {
    return Reset.reset(password, reset_code)
      .then(function(res) {
        $scope.submitted = true;
        return res
      })
      .catch(function(res) {
        alert(res.data.message);
        throw res;
      });

  }

});

