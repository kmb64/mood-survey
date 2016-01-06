var MOODS = ['veryBad', 'bad', 'fine', 'good', 'veryGood'];

angular.module('mood-survey', ['ngRoute', 'firebase']
).config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        redirectTo: '/login'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      })
      .when('/survey', {
        templateUrl: 'views/survey.html',
        controller: 'SurveyController'
      })
      .when('/about', {
        templateUrl: 'views/about.html'
      });

  }).controller('SurveyController', function($scope, $routeParams, $firebaseObject, $timeout) {

    var s = $routeParams.s;
    var ref = new Firebase('https://amber-heat-8057.firebaseio.com/surveys/' + s);
    var survey= $firebaseObject(ref);

    survey.$loaded(function(response) {
      $scope.show = true;
      survey.$bindTo($scope, 'survey');
      if(response.$value === null) {
        //TODO: Show some kind of 404 page
      }

    });

    $scope.animate = {};

    $scope.addMood = function(mood) {
      if(!$scope.animate[mood]) {

        $scope.survey.totalHits += 1;
        $scope.survey[mood] += 1;
        $scope.animate[mood] = true;
        $scope.showResults = true;
        $timeout(function(){
          $scope.animate[mood] = false;
          $scope.showResults = false;
        },2000);
      }
    };

  }).controller('LoginController', function ($scope, $firebaseAuth, $firebaseArray) {

    var auth = $firebaseAuth(new Firebase('https://amber-heat-8057.firebaseio.com'));
    var array = $firebaseArray(new Firebase('https://amber-heat-8057.firebaseio.com/surveys/'));

    $scope.surveys = [];

    auth.$onAuth(function (authData) {
      $scope.authorised = authData;
      console.log(authData);
    });

    $scope.login = function () {
      auth.$authWithOAuthRedirect('google').then(function (authData) {
        console.log('Logged in as:', authData.uid);
      }).catch(function (error) {
        console.log('Authentication failed:', error);
      });
    };

    $scope.owned = function(s) {
      s.link = '#/survey?s=' + s.$id;
      return s.owner === $scope.authorised.uid;
    };

    array.$loaded().then(function(surveys) {

      $scope.surveys = surveys;
      console.log(surveys);

    });

    $scope.createSurvey = function() {

      var date = new Date();

      array.$add(
        {
          owner : $scope.authorised.uid,
          date : date.toJSON(),
          veryBad : 0,
          bad : 0,
          fine : 0,
          good : 0,
          veryGood : 0,
          totalHits : 0
        }
      ).then(function(response){
          $scope.newUrl = '#/survey?s=' + response.key();
        });

    };

    $scope.surveys = array;

    $scope.logout = function () {
      auth.$unauth();
    };

  }).filter('percentage', ['$filter', function ($filter) {
    return function (input, decimals) {
      return $filter('number')(input * 100, decimals) + '%';
    };
  }]);