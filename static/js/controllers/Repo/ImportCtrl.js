angular.module('app.controllers').controller('RepoImportCtrl', function ($upload,$scope, $timeout, $http, $location) {
	$scope.upload = {
		email: "",
		file: null,
		key: ""
	};
	$scope.ready = {
		upload: false,
		convert: false
	}
	$scope.data = {
		head: [],
		lines: []
	};
	$scope.columns = {
		f: 0,
		p: 1,
		c: 2,
	}
	$scope.completed = {
		step1: false,
		step2: false
	}
	$scope.selectFile = function($files){
		$scope.upload.file = $files[0];
	}
	$scope.uploadFile = function(){
		console.log("uploading");
    $scope.upload = $upload.upload({
    	url: '/api/upload/tissue',
      data: {address: $scope.upload.email},
      file: $scope.upload.file
    }).progress(function(evt) {
      console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
    }).success(function(data, status, headers, config) {
      console.log(data);
      $scope.data.head = [
      	{name: data.parsed_data.lines[0][0], col: 0},
      	{name: data.parsed_data.lines[0][1], col: 1},
      	{name: data.parsed_data.lines[0][2], col: 2}
      ];

      data.parsed_data.lines.splice(0,1);//remove header line
      $scope.data.lines = data.parsed_data.lines;
      console.log($scope.data);
    });
	}

  $scope.$watch('upload',function(nu,old){
  	console.log(nu);
  	if( emailRegEx.test(nu.email) && nu.file != null)
  		$scope.ready.upload = true;
		else
  		$scope.ready.upload = false;
  },true);

	//I didn't write this myself, regex is from the official guidelines here: http://www.regular-expressions.info/email.html
	var emailRegEx = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

});