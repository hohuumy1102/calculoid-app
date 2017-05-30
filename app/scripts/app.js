'use strict';

var calculoid = angular.module('calculoid', [
  'ngRoute',
  'ngAnimate',
  'calculoidControllers',
  'calculoidServices',
  'ui.bootstrap',
  'directive.g+signin',
  'ngSanitize',
  'textAngular',
  'chieffancypants.loadingBar',
  'angularMoment',
  'ngTagsInput',
  'googlechart',
  'pasvaz.bindonce',
  'gridster',
  'angularAwesomeSlider',
  'colorpicker.module',
  'cgNotify'
]);

calculoid.config(['$sceDelegateProvider', '$routeProvider', '$httpProvider', function($sceDelegateProvider, $routeProvider, $httpProvider) {

  $httpProvider.defaults.withCredentials = true;

  $routeProvider.
    when('/', {
      templateUrl: 'views/calc-list.html',
      controller: 'CalcListCtrl'
    }).
    when('/showcase', {
      templateUrl: 'views/showcase.html',
      controller: 'ShowcaseCtrl'
    }).
    when('/calculators', {
      templateUrl: 'views/calc-list.html',
      controller: 'CalcListCtrl'
    }).
    when('/:tag/calculators', {
      templateUrl: 'views/calc-list.html',
      controller: 'CalcListCtrl',
      reloadOnSearch: false
    }).
    when('/calculator/:slug', {
      templateUrl: 'views/calc-detail.html',
      controller: 'CalcDetailCtrl',
      activetab : 'slug'
    }).
    when('/calculator/config/:slug', {
      templateUrl: 'views/calc-config.html',
      controller: 'CalcDetailCtrl'
    }).
    when('/calculator/submissions/:slug', {
      templateUrl: 'views/submissions.html',
      controller: 'SubmissionsCtrl'
    }).
    when('/calculator/webhooks/:slug', {
      templateUrl: 'views/webhooks.html',
      controller: 'WebhooksCtrl'
    }).
    when('/calculator/report/:slug', {
      templateUrl: 'views/calc-report.html',
      controller: 'CalcReportCtrl'
    }).
    when('/new', {
      templateUrl: 'views/calc-config.html',
      controller: 'CalcDetailCtrl'
    }).
    when('/calculator/', {
      templateUrl: 'views/calc-detail.html',
      controller: 'CalcDetailCtrl'
    }).
    when('/profile/', {
      templateUrl: 'views/profile.html',
      controller: 'ProfileCtrl'
    }).
    when('/profile/:id', {
      templateUrl: 'views/profile.html',
      controller: 'ProfileCtrl'
    }).
    when('/signin', {
      templateUrl: 'views/signin.html',
      controller: 'SignInCtrl'
    }).
    when('/password/reset/', {
      templateUrl: 'views/password-reset.html',
      controller: 'PasswordResetCtrl'
    }).
    when('/password/reset/:secret', {
      templateUrl: 'views/password-reset.html',
      controller: 'PasswordResetCtrl'
    }).
    when('/users', {
      templateUrl: 'views/user-list.html',
      controller: 'UsersCtrl'
    }).
    when('/stats', {
      templateUrl: 'views/stats.html',
      controller: 'StatsCtrl'
    }).
    otherwise({
      redirectTo: '/calculators'
    });

    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'https://www.sandbox.paypal.com/cgi-bin/webscr',
        'https://www.paypal.com/cgi-bin/webscr'
    ]);

    // Disable preflight OPTIONS request
    $httpProvider.defaults.headers.post = {};

    $httpProvider.interceptors.push('HttpErrorHandler');
}]);

calculoid.run(['$rootScope', '$location', '$window', 'notify', function($rootScope, $location, $window, notify) {
  var path = function() {
    return $location.path();
  };
  $window.ga('send', 'pageview', {page: $location.url()});
  $rootScope.$watch(path, function(newVal){
    $rootScope.activetab = newVal;
  });

  // Display the globar HTTP request errors
  $rootScope.$on('requestError', function(event, error) {
    var errorMessage = 'HTTP request failed.';

    if (error.data) {
      errorMessage = error.data;
    } else if (error.statusText) {
      errorMessage += ' ' + error.statusText;
    }

    notify({message: errorMessage, classes: ['calculoid-error']});
  });
}]);

var calculoidControllers = angular.module('calculoidControllers', []);
var calculoidServices = angular.module('calculoidServices', ['ngResource']);

// dev API
// calculoidServices.baseUrl = 'http://localhost/calculoid-api/';console.log('Note: you are using local server!')

// The API
calculoidServices.baseUrl = 'https://api.calculoid.com/';
