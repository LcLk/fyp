angular.module('app.controllers').controller('RepoReferencesCtrl', function ($scope, $timeout, $http, $location,$anchorScroll) {
	$scope.scrollNumber = 1;
   	$timeout(function(){$anchorScroll();},500);
   	$scope.hash = $location.hash();
   	console.log($scope.hash);
   	if($scope.hash != ""){
   		$scope.scrollNumber = $scope.hash.split("ref")[1];
   	}
   	$scope.select = function(number){
   		$scope.scrollNumber = number;
   	};

	$scope.references = [
		{
			number: "0",
			title:"Padding",
			content: "<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/> " +
				"<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/> " +
				"<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/> "
		},
		{
			number: "1",
			title:"Gabriel",
			content: "Throughout the repository the term <i>'Gabriel'</i> refers to Cole-Cole data as presented" +
			"by C. Gabriel in the publications [TODO: add publications] and on the <a "+
			"href='http://niremf.ifac.cnr.it/tissprop/'>online repository at IFAC</a>. " +
			"<br/><b>Further reading:</b><br/>"+
			"[TODO: add links to gabriel papers on dielectrics 1, 2 and 3]"
		},
		{
			number: "2",
			title:"Krewer",
			content: "F. Krewer published a <a>paper</a> on optimised and accurate conversion algorithms from "+
			"Cole-Cole to Debye models using Genetic Algorithms. These values are"+
			"[TODO: include link for paper or page showing paper/algorithm]."
		}
	];


});