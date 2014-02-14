'use strict';

/* Controllers */

angular.module('app.controllers', []).
  controller('NavCtrl', function ($scope, $timeout, $http, $location) {
    $scope.title = "NUIG Dielectrics:";
    $scope.menu = {
      1: {name:"Home",selected:false, link:"/home"},
      2: {name:"Repository",selected:false, link:"/repo"},
      3: {name:"About",selected:false, link:"/about"}
    };

  }).controller('HomeCtrl', function ($scope, $http) {




  }).controller('RepoCtrl', function ($scope, $http) {

    $scope.poles = [];

    $scope.visible ={
      conductivity: false,
      permittivity: false,
      table: false
    }
    $scope.frequencies = [
      {key:"1Hz",      value: 1},      
      {key:"10Hz",     value: 10},
      {key:"100Hz",    value: 100},
      {key:"1KHz",     value: 1000},
      {key:"10KHz",    value: 10000},
      {key:"100KHz",   value: 100000},
      {key:"1MHz",     value: 1000000},
      {key:"10MHz",    value: 10000000},
      {key:"100MHz",   value: 100000000},
      {key:"1GHz",     value: 1000000000},
      {key:"10GHz",    value: 10000000000},
      {key:"100GHz",   value: 100000000000},
      {key:"1THz",     value: 1000000000000},
      {key:"10THz",    value: 10000000000000}
    ];

    $scope.selected = {
        tissuetype: {
          name: "Select a Tissue",
          selected: false,
          name_readable: ""
        },
        poles: null,
        pointsPerDecade: 10,
        startFreq: 10,
        stopFreq:100,
        data: null
    };
    $scope.e0 = 8.85418782e-12;
    //reset selections
    $scope.reset = function() {
      $scope.selected =  {
        tissuetype: {
          name: "Select a Tissue",
          selected: false
        },
        poles: null
      };
      $scope.poles = [];
    };

    $scope.validateGraphSettings = function() {
      //TODO fill out this check and implement it
      if($scope.selected.poles == null)
        return false;
    };
    $scope.tableData = {
      data: {}, 
      show: false
    };
    $scope.graphIt = function(){
      console.log("plotting...");
      $scope.validateGraphSettings();
      var freq = $scope.getLogFrequencies($scope.selected.pointsPerDecade,$scope.selected.startFreq,$scope.log10($scope.selected.stopFreq/$scope.selected.startFreq));
      console.log($scope.selected.data.debye);
      console.log($scope.selected.poles);
      var result = {
        cole: $scope.plotCole(freq, $scope.selected.data.cole),
        debye: $scope.plotDebye(freq, $scope.selected.data.debye[$scope.selected.poles])
      };
      console.log("\n\n\n results \n");
      console.log(result);
      console.log("\n\n\n");


      $scope.permittivity_data.title_data.tissue = $scope.conductivity_data.title_data.tissue = $scope.selected.tissuetype.name_readable;

      var tableData = []
      for(var i = 0; i < result.cole.length;i++){
        console.log("looping" + i);
        tableData[i] = {
          frequency: freq[i], 
          cole: {
            permittivity: result.cole[i].permittivity,
            conductivity: result.cole[i].conductivity,
          },
          debye: {
            permittivity: result.debye[i].permittivity,
            conductivity: result.debye[i].conductivity,
          }
        };
      }

      $scope.tableData.data = tableData;

      console.log("\n\n\n table data \n");
      console.log($scope.tableData);
      console.log("\n\n\n");
      var plot_data = $scope.separate_data(result);

      console.log("\n\n\n");
      console.log(plot_data);
      console.log("\n\n\n");
      $scope.plot_series(plot_data);
      console.log($scope.permittivity_data);
      console.log($scope.conductivity_data);


      $scope.visible = {
        conductivity: true,
        permittivity: true,
        table: true
      }
      console.log($scope.visible);
      
    };
    //take the models and separate them into the format needed to plot them.
    $scope.separate_data = function(data){
      var f;
      var result = {
        debye_c:  [],
        debye_p: [],
        cole_c:  [],
        cole_p: []
      };
      for(var i = 0; i < data.debye.length;i++){
        f = data.debye[i].frequency;
        result.debye_c[i] =  {
          x: f,
          y: data.debye[i].conductivity,
          cole: data.cole[i].conductivity
        };
        result.cole_c[i] = { 
          x: f,
          y: data.cole[i].conductivity,
          debye: data.debye[i].conductivity
        };
        result.debye_p[i] =  {
          x: f,
          y: data.debye[i].permittivity,
          cole: data.cole[i].permittivity
        };
        result.cole_p[i] = { 
          x: f,
          y: data.cole[i].permittivity,
          debye: data.debye[i].permittivity
        };
      }
      return result;
    }

    $scope.plotCole = function(freq,data){
      console.log(data);
      var e0 = $scope.e0;
      console.log(e0);
      var result = [];
      var a,b,c,d,res,w;
      for(var i =0;i<freq.length;i++){
        w =  2*Math.PI*freq[i];
        a = new Complex(data.poles[0].del,0).divBy(new Complex(1,0).add( new Complex(0, w*data.poles[0].tau ).pow(1-data.poles[0].alf) ) );
        b = new Complex(data.poles[1].del,0).divBy(new Complex(1,0).add( new Complex(0, w*data.poles[1].tau ).pow(1-data.poles[1].alf) ) );
        c = new Complex(data.poles[2].del,0).divBy(new Complex(1,0).add( new Complex(0, w*data.poles[2].tau ).pow(1-data.poles[2].alf) ) );
        d = new Complex(data.poles[3].del,0).divBy(new Complex(1,0).add( new Complex(0, w*data.poles[3].tau ).pow(1-data.poles[3].alf) ) );
        res = new Complex(data.ef,0).add(a.add(b.add(c.add(d.add( new Complex(data.sig,0).divBy(new Complex(0,w*e0)) )))));
        if(freq[i] == 10){
          console.log("\n Here is freq = 10Hz\n");
          console.log(data.poles);
          console.log(a);
          console.log(b);
          console.log(c);
          console.log(d);
          console.log(res);
        }
        result[i] = {
          permittivity: res.re,
          conductivity: -(res.i*e0*w),
          frequency: freq[i],
        };
      }
      return result;
    };
    $scope.plotDebye = function(freq,data){  
      var w,constant,result=[],sumation,poles = data.poles;
      var e0 = $scope.e0;
      //loop over frequencies
      for(var i =0; i < freq.length;i++){
        result[i] = {};
        sumation = new Complex(0,0);
        w =  2*Math.PI*freq[i];
        constant = new Complex(data.const_c,0).divBy(new Complex(0,w*e0));
        //loop over poles
        for(var j = 0; j<poles.length;j++){
          if(poles[j]["delta_permitivity"] != 1)
            sumation = sumation.add( new Complex(poles[j].dp,0).divBy(new Complex(1,(w*poles[j].dc))) );
        }
        sumation = sumation.add(new Complex(data.const_p,0)).add(constant);
        result[i] = {
          frequency: freq[i],
          conductivity: -(sumation.i*e0*w),
          permittivity: sumation.re
        };
      }
      return result;
    }

    //perdecade can be any number but start and stop need to be multiples of 10
    $scope.getLogFrequencies = function(perDecade,start,decades) {
      var freq = [];
      var decade = start;
      for(var i = 0;i<decades;i++){
        for(var j = 0; j < perDecade;j++){
          freq[(i*perDecade)+j] =  Math.pow(10,((1/perDecade)*j))*decade;
        }
        decade = decade*10;
      }
      freq[perDecade*i] = decade;
      console.log(freq);
      return freq;
    };

    $scope.log10 = function(val){
      return Math.ceil(Math.log(val) / Math.LN10);
    };

    //get tissue from server
    $scope.getTissue = function() {
      //already received this value
      $scope.poles = $scope.rx[$scope.selected.tissuetype.name].poles;
      $scope.selected.tissuetype.selected = true;

      if("debye" in $scope.rx[$scope.selected.tissuetype.name]){
        $scope.selected.data = $scope.rx[$scope.selected.tissuetype.name];
        $scope.selected.tissuetype.name_readable = $scope.rx[$scope.selected.tissuetype.name].name;
      }
      else {
        $http.get('/api/tissue/'+$scope.selected.tissuetype.name)
          .then(function(result) {
            $scope.rx[$scope.selected.tissuetype.name] = result.data.data;
            $scope.selected.data = result.data.data;
        $scope.selected.tissuetype.name_readable = $scope.rx[$scope.selected.tissuetype.name].name;
        }); 
      }
    };

    $http.get('/api/tissuelist/a').then(function(result){
      console.log("got the tissue list \n\n\n\n\n");
      console.log(result.data);
      for (var i = 0; i < result.data.data.length;i++) {
        $scope.rx[result.data.data[i]._id] = result.data.data[i];
        $scope.rx[result.data.data[i]._id].disabled = ($scope.rx[result.data.data[i]._id].poles.length == 0) ? true : false;
      };
      console.log($scope.rx);
    });
    //container for received data
    $scope.rx = {

    };

    $scope.plot_series = function(plot){
      $scope.permittivity_data.series[1].data = plot.debye_p;
      $scope.permittivity_data.series[0].data = plot.cole_p;
      $scope.conductivity_data.series[1].data = plot.debye_c;
      $scope.conductivity_data.series[0].data = plot.cole_c;

      $scope.conductivity_data.xAxis.min = $scope.selected.startFreq;
      $scope.conductivity_data.xAxis.max = $scope.selected.stopFreq;
      $scope.permittivity_data.xAxis.min = $scope.selected.startFreq;
      $scope.permittivity_data.xAxis.max = $scope.selected.stopFreq;
    }

    $scope.permittivity_data = {
       title_data: {
          type: "Permittivity",
          tissue: "Tissue"
       },
       chart: {
          type: 'spline',
          animation: Highcharts.svg, // don't animate in old IE
          marginRight: 10,
          zoomType: 'xy'
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
            if(this.series.name == 'Cole-Cole'){
               return '<b>'+ this.series.name +'</b><br/>frequency: '+this.x.toExponential(2)+'Hz<br/><br/>Permittivity: '+this.y.toExponential(2)+'<br/>';
            }
            else if(this.series.name == 'Debye')
              var error = (((this.point.cole - this.y)/this.point.cole)*100).toFixed(3);
              return '<b>'+ this.series.name +'</b><br/><b>frequency:</b> '+this.x.toExponential(2)+'Hz<br/><b>Permittivity:</b> '+this.y.toExponential(2)+'<br/><br/><br/><b>Error:</b> '+error+'%';
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
          zoomType: 'xy'
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
            if(this.series.name == 'Cole-Cole'){
               return '<b>'+ this.series.name +'</b><br/>frequency: '+this.x.toExponential(2)+'Hz<br/><br/>Conductivity: '+this.y.toExponential(2)+'<br/>';
            }
            else if(this.series.name == 'Debye')
              var error = (((this.point.cole - this.y)/this.point.cole)*100).toFixed(3);
              return '<b>'+ this.series.name +'</b><br/><b>frequency:</b> '+this.x.toExponential(2)+'Hz<br/><b>Conductivity:</b> '+this.y.toExponential(2)+'<br/><br/><br/><b>Error:</b> '+error+'%';
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

  $scope.clearGraph = function(){
    for(var i =0; i< $scope.data.series.length;i++){
      $scope.data.series[i].data = [[1,1]];
    }
    $scope.output = 'Graph cleared';
  };

  $scope.plotPermittivity = function(points,offset){
    console.log("plot permittivity");
    var data = [];
    for(var i = 0; i < points.length;i++){
      data[i] = [parseFloat(points[i]["frequency"]), parseFloat(points[i]["relative_permitivity"]) ];
    }
    $scope.data.series[1+offset].data = data;
    console.log("finished");
  }; 


  $scope.plotConductivity = function(points,offset){
    console.log("plot conductivity");
    var data = [];
    for(var i = 0; i < points.length;i++){
      data[i] = [parseFloat(points[i]["frequency"]), parseFloat(points[i]["conductivity"]) ];
    }
    $scope.data.series[offset].data = data;
    console.log("finished");
  };




});
