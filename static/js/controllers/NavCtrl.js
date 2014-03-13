
angular.module('app.controllers').controller('NavCtrl', function ($window,$scope, $timeout, $http, $location,$rootScope,$route) {
    $scope.title = "NUIG Dielectrics:";
    $scope.loaded = false;
    //links for the breadcrumbs list
    $scope.breadcrumbs = [
    	{name: "NUI Galway Home",link: "http://www.nuigalway.ie/"},
    	{name: "Faculties & Departments",link: "http://www.nuigalway.ie/faculties_departments/"},
    	{name: "Electronic Engineering",link: "http://www.ee.nuigalway.ie/"},
    	{name: "here",link: "http://www.fyp.liam.krewer.me/"}
    ];


    /*
      Make navigation panel scroll along
    */
    $scope.navScrollHeight = 200;
    $scope.navClass = "regular";
    angular.element($window).bind('scroll', function() { 
      if(parseInt($(window).scrollTop()) > $scope.navScrollHeight){
         $scope.$apply(function(){$scope.navClass = "fixed";});
      }
      else{
         $scope.$apply(function(){$scope.navClass = "regular";});
      }
    });




    $scope.menu = [
    	{name:"Home", link: "/home",subMenu:[]},
    	{name:"Repository", link: "/repo",subMenu: [
    		{name:"Main ", link: "/repo/home"},
    		{name:"Introduction ", link: "/repo/introduction"},
    		{name:"Single Tissue ", link: "/repo/single"},
    		{name:"Multiple Tissues ", link: "/repo/multiple"},
    		{name:"Export ", link: "/repo/export"},
    		{name:"Convert ", link: "/repo/import"},
    		{name:"References ", link: "/repo/references"}
    		]},
    	{name:"Other Page 1", link: "/other1",subMenu:[
    		{name:"Sub Page 1", link: "/other1/sub1"},
    		{name:"Sub Page 2", link: "/other1/sub2"},
    		{name:"Sub Page 3", link: "/other1/sub3"}
    		]},
    	{name:"Other Page 2", link: "/other2",subMenu:[]},
    	{name:"Other Page 3", link: "/other3",subMenu:[]}
    ];
    $scope.footerLinks = [
    	{name: "Disclaimer",link: "/disclaimer"},
    	{name: "Privacy",link: "/privacy.html"},
    	{name: "Copyright",link: "/copyright.html"},
    	{name: "Accessibility",link: "/accessibility.html"}
    ];

    $scope.isActive = function(path) {
    	var regex = new RegExp("^"+path,"i");
    	if ($location.path().substr(0, path.length).match(regex) != null)
	        return " selected";
	    else 
	      return " ";
	}
    $scope.show_footer = false;
    $scope.init = true;

//Change page title, based on Route information 
$rootScope.$on("$routeChangeSuccess", function(currentRoute, previousRoute){
    $rootScope.title = ($route.current.title == undefined) ? "Repository" : $route.current.title;
});

    /*
        Helper Functions
    */
function capitalise(word){
    return word.subString(0,1).toUpperCase() + word.subString(1).toLowerCase();
}



/*
    Initializations
*/
// $scope.tissues = {};
// $(document).ready(function(){ 
//       $scope.$on('$viewContentLoaded', function() {
//         //get tissues list
//         if(Object.keys($scope.tissues).length > 1);
//         else{
//             $http.get('/api/tissuelist/a').then(function(result){
//               console.log("got the tissue list \n");
//               console.log(result.data);
//               $scope.rx = result.data;
//               var models = Object.keys(result.data);
//               var tissue = {};
//               var tissue_names = [];
//               /*
//                 Parse the received lists of tissues into an array of objects and a sorted array of names
//                 for display and selection
//               */
//               for(var i = 0; i < models.length;i++){
//                 tissue_names = Object.keys(result.data[models[i]]);
//                 for(var j = 0;j < tissue_names.length;j++){
//                   $scope.tissues[tissue_names[j]] = $scope.tissues[tissue_names[j]] || {};
//                   $scope.tissues[tissue_names[j]][models[i]] = $scope.rx[models[i]][tissue_names[j]];
//                   $scope.tissues[tissue_names[j]].name = tissue_names[j];
//                   $scope.tissues[tissue_names[j]].selected = false; //if it was selected in the control panel tissue list
//                   $scope.tissues[tissue_names[j]].disabled = false; //if it is disabled due to an incompatible selection this is true
//                 }
//               }
//               console.log("tissues object");
//               console.log($scope.tissues);
//               $scope.tissues_sorted = Object.keys($scope.tissues).sort();
//               console.log("sorted tissues");
//               console.log($scope.tissues_sorted);
//               // for (var i = 0; i < result.data.data.length;i++) {
//               //   tissue = result.data.data[i];
//               //   tissue.disabled = (tissue.poles.length === 0) ? true : false;
//               //   tissue.selected = false;
//               //   $scope.rx.push(tissue);
//               // };
//               console.log($scope.rx);
//               //sort into alphabetical order after recieving list of tissues
//               $scope.tissues = $scope.tissues;
//               $scope.loaded = true;
//             });
//         }   
//       });
//    });

    /*
      Templates for the graph options
    */
    $scope.permittivity_data = {
       title_data: {
          type: "Permittivity",
          tissue: "Tissue"
       },
       chart: {
          type: 'spline',
          animation: Highcharts.svg, // don't animate in old IE
          marginRight: 10,
          zoomType: 'xy',
          renderTo: 'permittivity_container'
        },
       xAxis: {
          type: 'logarithmic',
          min: 10,
          max: 100000000000,
          minorTickInterval: 0.1,
        title: {
          text: 'frequency(Hz)'
        },
       },
       yAxis: {
        type: 'logarithmic',
        min: 0.1,
        max: 10000000,
        minorTickInterval: 0.1,
        title: {
          text: 'permittivity'
        },
        plotLines: [{
             value: 0,
             width: 0.1,
             color: '#000088'
          }]
       },
       title: {
        text: ''
       },
       tooltip: {
          backgroundColor: '#FCFFC5',
          borderColor: 'black',
          borderRadius: 10,
          borderWidth: 3,
          formatter: function() {
            var tissues = Object.keys(this.point);
            var tissue = this.series.name.split("[")[0];
            var model = this.series.name.split("[")[1].split("]")[0];
            var error = "";
            var point = 0;
            var array = $scope.permittivity_data.chart.models.slice(0);
            if(array.length > 1){
              //remove this model from the list
              array.splice(array.indexOf(model), 1);
              for(var i = 0;i < array.length;i++){
                point = this.point[""+tissue + "["+array[i]+"]"];
                error = "<b>Error vs. "+ array[i] + ": </b>" + (((point - this.y)/point)*100).toFixed(3) + "%";
              }
            }
            return '<b> Tissue: </b>'+ tissue +'<b> Model: </b>' + model + '<br/><b>Frequency:</b> '+this.x.toExponential(2)+
            'Hz<br/><br/><b>Permittivity:</b> '+this.y.toExponential(2)+'<br/>' + error ;
          }
       },
       legend: {
          enabled: true
       },
       exporting: {
          enabled: false
       },
       events: {
        redraw: function() {
            console.log('The chart was just redrawn');
        }
       },   
       series: [       {
          name: 'Cole-Cole',
          color: '#86C9DE',
          pointStart: 1,
          lineWidth: 5,
          visible:false,
          data: [[1,1]]
       },
       {
          name: 'Debye',
          color: '#9886DE',
          pointStart: 1,
          lineWidth: 5,
          visible:false,
          data: [[1,1]]
       }],
       plotOptions: {
          series: {
              lineWidth: 3,
              marker: {
                  enabled: true,
                  symbol: 'circle',
                  radius: 1,
                  fillColor: "#000000",
                  lineColor: "#000000",
                  lineWidth: 1
              }
          },
          area: {
            stacking: null
          }
       }
     };


    $scope.conductivity_data = {
       title_data: {
          type: "Conductivity",
          tissue: "Tissue"
       },
       chart: {
          type: 'spline',
          animation: Highcharts.svg, // don't animate in old IE
          marginRight: 10,
          zoomType: 'xy',
          renderTo: 'conductivity_container'
        },
       xAxis: {
          type: 'logarithmic',
          min: 10,
          max: 100000000000,
          minorTickInterval: 0.1,
        title: {
          text: 'frequency(Hz)'
        },
       },
       yAxis: {
        type: 'logarithmic',
        min: 0.001,
        max: 1000,
        minorTickInterval: 0.1,
        title: {
          text: 'Conductivity'
        },
        plotLines: [{
             value: 0,
             width: 0.1,
             color: '#000088'
          }]
       },
       title: {
        text: ''
       },
       tooltip: {
          backgroundColor: '#FCFFC5',
          borderColor: 'black',
          borderRadius: 10,
          borderWidth: 3,
          formatter: function() {
            var tissues = Object.keys(this.point);
            var tissue = this.series.name.split("[")[0];
            var model = this.series.name.split("[")[1].split("]")[0];
            var error = "";
            var point = 0;
            var array = $scope.conductivity_data.chart.models.slice(0);
            if(array.length > 1){
              //remove this model from the list
              array.splice(array.indexOf(model), 1);
              for(var i = 0;i < array.length;i++){
                point = this.point[""+tissue + "["+array[i]+"]"];
                error = "<b>Error vs. "+ array[i] + ": </b>" + (((point - this.y)/point)*100).toFixed(3) + "%";
              }
            }
            return '<b> Tissue: </b>'+ tissue +'<b> Model: </b>' + model + '<br/><b>Frequency:</b> '+this.x.toExponential(2)+
            'Hz<br/><br/><b>Conductivity:</b> '+this.y.toExponential(2)+'<br/>' + error ;
          }
       },
       legend: {
          enabled: true
       },
       exporting: {
          enabled: false
       },
       events: {
        redraw: function() {
            console.log('The chart was just redrawn');
        }
       },   
       series: [
         {
            name: 'Cole-Cole',
            color: '#86C9DE',
            pointStart: 1,
            lineWidth: 5,
            visible:false,
            data: [[1,1]]
         },
         {
            name: 'Debye',
            color: '#9886DE',
            pointStart: 1,
            lineWidth: 5,
            visible:false,
            data: [[1,1]]
         }
       ],
       plotOptions: {
          series: {
              lineWidth: 3,
              marker: {
                  enabled: true,
                  symbol: 'circle',
                  radius: 1,
                  fillColor: "#000000",
                  lineColor: "#000000",
                  lineWidth: 1
              }
          },
          area: {
            stacking: null
          }
       }
     };
});

