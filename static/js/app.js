'use strict';

// Declare app level module which depends on filters, and services

angular.module('app', [
  'app.controllers',
  'app.filters',
  'app.services',
  'app.directives',
  'ngSanitize'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/home', {
      templateUrl: 'partials/home',
      controller: 'HomeCtrl'
    }).
    when('/repo', {
      templateUrl: 'partials/repo',
      controller: 'RepoCtrl'
    }).
    when('/about', {
      templateUrl: 'partials/about',
      controller: 'AboutCtrl'
    }).
    when('/import', {
      templateUrl: 'partials/import',
      controller: 'ImportCtrl'
    }).
    otherwise({
      redirectTo: '/home'
    });

  $locationProvider.html5Mode(true);
});

angular.module('app.controllers',[]);

