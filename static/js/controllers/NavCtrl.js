
angular.module('app.controllers').controller('NavCtrl', function ($scope, $timeout, $http, $location) {
    $scope.title = "NUIG Dielectrics:";
    $scope.menu = {
      1: {name:"Home",selected:false, link:"/home"},
      2: {name:"Repository",selected:false, link:"/repo"},
      3: {name:"Import",selected:false, link:"/import"},
      4: {name:"About",selected:false, link:"/about"}
    };
    $scope.show_footer = false;
    $scope.init = true;
});