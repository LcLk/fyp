
angular.module('app.controllers').controller('ImportCtrl', function ($scope, $http) {
	$scope.upload = {
		email: "",
		file: {}	
	};
	$scope.completed = {
		step1: false,
		step2: false
	}
	$scope.fileNameChaged = function(element) {
		$scope.upload.file = element.files[0];
	}
	$scope.uploadOne = function(){
		$scope.uploading == true;
		$http.post('/api/upload/initial', $scope.upload).
			success(function(data, status, headers, config) {
				// this callback will be called asynchronously
				// when the response is available
				console.log(status);
			}).
			error(function(data, status, headers, config) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
				console.log(status);
			});
	}

});