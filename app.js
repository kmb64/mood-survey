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
      }).otherwise({
        redirectTo: '/login'
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

        $timeout(function(){
          $scope.animate[mood] = false;
        },1000);
      }
    };

  }).controller('LoginController', function ($scope, $firebaseAuth, $firebaseArray) {

    var auth = $firebaseAuth(new Firebase('https://amber-heat-8057.firebaseio.com'));
    var array = $firebaseArray(new Firebase('https://amber-heat-8057.firebaseio.com/surveys/'));

    $scope.surveys = [];

    auth.$onAuth(function (authData) {
      $scope.authorised = authData;
      console.log(authData + 'fired');
      if(authData) {
        array.$loaded().then(function(surveys) {
          $scope.surveys = surveys;
        });
      }
    });

    $scope.login = function () {
      auth.$authWithOAuthRedirect('google', function (error) {
        console.log('fail redirect' + error);
      });
    };

    $scope.owned = function(s) {
      s.link = '#/survey?s=' + s.$id;
      return s.owner === $scope.authorised.uid;
    };

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

    $scope.logout = function () {
      auth.$unauth();
    };

  }).filter('percentage', ['$filter', function ($filter) {
    return function (input, decimals) {
      return $filter('number')(input * 100, decimals) + '%';
    };
  }]);