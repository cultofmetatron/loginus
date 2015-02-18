
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
.factory('Auth', function($cookies, $cookieStore, $http, $q) {
  return {
    signup: function(user) {
      return $http.post('/signup', user)
      .then(function(res) {
        $cookieStore.put('jwt', res.data.token)
        return res.data;
      })
      .catch(function(res) {
        console.log('signup error', res.data);
        return $q.reject(res.data);
      });
    },
    logout: function() {
      $cookieStore.remove('jwt');
      //ensuring consistentcy with rest of api
      //despite being synchronous
      return $q.when(true);
    },
    login: function(user) {
      return $http.post('/login', user)
        .then(function(res) {
          $cookieStore.put('jwt', res.data.token);
          return res.data
        })
        .catch(function(res) {
          return $q.reject(res.data);
        });

    },
    isAuthenticated: function() {
      return !!$cookies.jwt;
    }
  }
})
.controller('TabsAccounts', function ($scope, $window, $http, Auth) {

  $scope.isLoggedIn = Auth.isAuthenticated;

  $scope.logout = Auth.logout;

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
      alert(err.message)
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
      alert(err.message)
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
  };


})
.directive('passwordsMatch', function() {
  return {
    restrict: "A",
    require: ['^ngModel', '^form'],
    link: function(scope, element, attrs, ctrls) {
      var formCtrl = ctrls[1];
      var ngModel = ctrls[0];
      var otherPasswordModel = formCtrl[attrs.passwordsMatch];
      ngModel.$validators.passwordsMatch = function(password) {
        return otherPasswordModel.$modelValue === password;
      };
    }
  }
})
.directive('emailAvailableValidator', function($http) {
  return {
    require : '^ngModel',
    link : function(scope, element, attrs, ngModel) {
      ngModel.$asyncValidators.emailAvailable = function(email) {
        return $http.get('/email-exists?emailname='+ email);
      };
    }
  }
});













