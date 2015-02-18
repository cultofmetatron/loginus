
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
.run(function($http) {
})
.factory('Auth', function($cookies, $cookieStore, $http) {
  return {
    signup: function() {
      return $http.post('/signup', data)
      .success(function(data) {
        $cookieStore.put('jwt', data.token)
        return data;
      })
      .error(function(err) {
        console.log('signup error', err);
        throw err;
      });
    },
    login: function() {
      console.log('data', data)
      return $http.post('/login', data)
        .success(function(data) {
          //$window.JWT_TOKEN = data.token;
          $cookieStore.put('jwt', data.token);
          return data
        })
        .error(function(err) {
          console.log('login error', err)
          throw err;
        });

    },
    isAuthenticated: function() {
      //debugger
      return !!$cookies.jwt;
    }
  }
})
.controller('TabsAccounts', function ($scope, $window, $http, $interval, Auth) {

  $scope.isLoggedIn = Auth.isAuthenticated();

  $interval(function() {
    $scope.isLoggedIn = Auth.isAuthenticated();
  }, 500);



  $scope.postLogin = function(user) {
    Auth.login({
      email: user.email,
      password: user.password
    })
    .then(function(data) {
      console.log(data);
      return data;
    })
    .catch(function(err) { 
      console.log(err);
      
    });
  };

  $scope.postSignup = function(data) {
    Auth.signup({
      email: data.email,
      password: data.password
    })
    .then(function(data) {
      console.log(data);
      return data;
    })
    .catch(function(err) {
      console.log(err);
      
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
.controller('OauthAccount', function($scope, $window, $http, Facebook) {

  $scope.twitterLogin = function() {
    var w = $window.open('/auth/twitter','windowname','width=600,height=250,scrollbars,resizable,toolbar,status');
    
  };

  $scope.facebookLogin = function() {
    console.log('faceebooko');
    var fb_win = $window.open('/auth/facebook', 'fb_win','width=800,height=350,scrollbars=false,resizable,toolbar,status' );
    $(fb_win).on('load', function(ev) {
      console.log('trying to load')
      var jwt = $(fb_win.document).find('#token').text();
      console.log('jwt', jwt);
    });
    $($window).on('foobar', function(ev) {
      console.log('ev', ev)
    })
    $(fb_win).on('beforeunload', function(ev) {
      console.log('unloading')
      var jwt = $(fb_win.document).find('#token').text();
      console.log('jwt', jwt);
    });
 
  };


})














