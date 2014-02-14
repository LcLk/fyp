'use strict';

/* Directives */

angular.module('app.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  })
  //directive for creating a table of calculated data
  .directive('calculatedDataTable',function ($timeout) {
  return {
      restrict: 'E',   //turns the directive into a tag
      scope: {       
        data: '=', //allows a scope to be passed into the directive by adding data="" to the tag
        visible: '=',
        name: '='
      },
      controller: function($scope, $element, $attrs) {       
       },
      template: '<div class="row">'+
                  '<div class="title row text-left"><h4> Calculated Data for {{name}}</h4>'+
                    '<button type="button" class="btn btn-info btn-xs" ng-model="visible" value="true" ng-click="visible = !visible">{{visible && \'Hide \' || \'Show\'}}</button>' +
                  '</div>' +
                  '<br>' +
                  '<table class="table table-striped table-hover" ng-show="visible">'+
                    '<theader>'+
                      '<tr>'+
                        '<th></th><th colspan="2">Krewer (Debye)</th><th colspan="2">Gabriel (Cole-Cole)</th>'+
                      '</tr>'+
                      '<tr>'+
                      '<th>Frequency</th><th>Permittivity</th><th>Conductivity</th><th>Permittivity</th><th>Conductivity</th>'+
                      '</tr>'+
                    '</theader>'+
                    '<tbody>'+
                      '<tr ng-repeat="frequency in data.frequency">'+
                        '<td>{{frequency.toExponential(2)}}</td><td>{{data.krewer[frequency].permittivity.toExponential(2) || "--"}}</td><td>{{data.krewer[frequency].conductivity.toExponential(2) || "--"}}</td><td>{{data.gabriel[frequency].permittivity.toExponential(2) || "--"}}</td><td>{{data.gabriel[frequency].conductivity.toExponential(2) || "--"}}</td>'+
                      '</tr>'+
                    '</tbody>'+
                  '</table>' +
                '</div>',
      replace: true,
      //html to return
      link: function(scope, element, attributes){
        //update function
        console.log("table made")
        scope.$watch(function() {return scope.data;}, function(value) {
          if(scope.data == value) return;
          else {

          }
        },true);
      }
    };
}).directive('loading', function($timeout) {
    return {
      restrict: 'A',
      template:  '<span>{{dots}}<span>',
      scope: {
      },
      link: function (scope, elem, attrs) {
        scope.dots = "..."
        scope.oneDot = function() {
          scope.dots = ".";
          $timeout(function(){scope.twoDot()},1000);
        };
        scope.twoDot = function() {
          scope.dots = "..";
          $timeout(function(){scope.threeDot()},1000);
        };
        scope.threeDot = function() {
          scope.dots = "...";
          $timeout(function(){scope.noDot()},1000);
        };
        scope.noDot = function() {
          scope.dots = "";
          $timeout(function(){scope.oneDot()},1000);
        };
        console.log(scope.dots);
        scope.noDot();
      },
      replace: true
    }
});