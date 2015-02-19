
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


})
.controller('ResetView', function($scope, $window, $http) {



});

