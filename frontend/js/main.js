
(function() {
  //lifted from http://www.w3schools.com/js/js_cookies.asp
  function getCookie(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i=0; i<ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1);
          if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
      }
      return "";
  }

  //returns with the jwt token, null otherwise
  window.loggedIn = function() {
    return (getCookie('jwt').length > 0) ? getCookie('jwt') : false;
  };

  var checkStatus = setInterval((function(status) {
    return function() {
      var jwt = loggedIn();
      if (jwt && (jwt !== status.loggedIn)) {
        console.log('loggedIn', jwt, status.loggedIn)
        status.loggedIn = jwt;
        $(window).trigger('loggedIn', { data: jwt });
      } else {
        //edge cases I haven't thought of; maybe logout?
        if (!jwt) {
          status.loggedIn = false;
          $(window).trigger('loggedOut');
        } else {
          
        }
      }
    }
  })({loggedIn: false}), 500);

}).call(this);

$('window').on('loggedIn', function() {
  module.run(function($http) {
    var jwt = loggenIn();
    $http.defaults.headers.common.Authorization = 'Bearer ' + jwt
  });
});

angular.module('app', ['ui.bootstrap', 'facebook'])
.controller('TabsAccounts', function ($scope, $window, $http) {

  $scope.isLoggedIn = loggedIn();

  setInterval(function() {
    $scope.isLoggedIn = loggedIn();
  }, 500);

  $scope.postLogin = function(data) {
    console.log('data', data)
    return $http.post('/login', data)
      .success(function(data) {
        console.log('success', data);
        $window.JWT_TOKEN = data.token;
        document.cookie = "jwt="+ data.token + ";path=/"
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
        document.cookie = "jwt="+ data.token + ";path=/"

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
.config(function(FacebookProvider) {
   // Set your appId through the setAppId method or
   // use the shortcut in the initialize method directly.
   FacebookProvider.init('1549928668626444');
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


    $window.fbu = fb_win;
    setTimeout(function() { $(fb_win).trigger('load'); }, 8000)

  };


})














