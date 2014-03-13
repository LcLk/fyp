'use strict';

// Declare app level module which depends on filters, and services

angular.module('app', [
  'app.controllers',
  'app.filters',
  'app.services',
  'app.directives',
  'app.factories',
  'ngSanitize',
  'angularFileUpload',
  'ngRoute', //the route provider(as used below) is a separate module in 1.1.5 onwards (I upgraded to 1.2 from 1.0.4)
  'ngAnimate' //animations have also been split into a separate module.
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/home', {
      templateUrl: '/views/partials/home.html',
      title: "Home"
    }).
    when('/repo/:page',{
      templateUrl: function(rp){
        return '/views/partials/repo/'+rp.page+'.html'
      },
      title: "Repository"
    }).
    when('/repo',{
      redirectTo: '/repo/home'
    }).
    when('/other1', {
      templateUrl: '/views/partials/other1.html',
      title: "Other Page"
    }).
    when('/other2', {
      templateUrl: '/views/partials/other2.html',
      title: "Other Page 2"
    }).
    when('/other3', {
      templateUrl: '/views/partials/other3.html',
      title: "Other Page 3"
    }).
    otherwise({
      redirectTo: '/home'
    });

  $locationProvider.html5Mode(true);
});

angular.module('app.controllers',[]);

