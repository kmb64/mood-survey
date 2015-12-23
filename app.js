angular.module('mood-survey', ['ngRoute', 'firebase']
).config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        redirectTo: '/login'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      });

  }).controller('LoginController', function ($scope, $firebaseAuth) {

    var ref = new Firebase('https://amber-heat-8057.firebaseio.com');
    // create an instance of the authentication service
    var auth = $firebaseAuth(ref);

    auth.$onAuth(function (authData) {
      $scope.authorised = authData;
      console.log(authData);
    });

    $scope.login = function () {
      auth.$authWithOAuthPopup('google').then(function (authData) {
        console.log('Logged in as:', authData.uid);
      }).catch(function (error) {
        console.log('Authentication failed:', error);
      });
    };

    $scope.logout = function () {
      auth.$unauth();
    };

  });