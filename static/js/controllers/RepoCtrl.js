
angular.module('app.controllers').controller('RepoCtrl', function ($scope, $http, $routeParams,$route,$compile) {
    /*
      Redirect to the specific repository page within this controller
    */
    console.log("Loaded RepoCtrl");
    console.log("rerouting to actual template page");
    console.log($routeParams.subpage);  
    $scope.repo_pages = [
      'home',
      'import',
      'export',
      'instructions',
      'multiple',
      'single',
      'references'
    ];
    $scope.controllerFunction = function(){return $scope.controller};
    if($scope.repo_pages.indexOf($routeParams.subpage) != -1){
      $route.current.templateUrl = '/views/partials/repo/'+$routeParams.subpage+'.html';
      $scope.currentPage = $routeParams.subpage;
    }
    else{
      $route.current.templateUrl = '/views/partials/repo/index.html';
      $scope.currentPage = "home";
    }

    console.log($route.current.templateUrl);

    $http.get($route.current.templateUrl).then(function (msg) {
      $('#repo').html($compile(msg.data)($scope));
    });

    /*
      End Redirect Code
    */
});