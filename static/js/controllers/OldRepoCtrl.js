
angular.module('app.controllers').controller('RepoCtrl', function ($scope, $http, $routeParams,$route,$compile) {


    $scope.debug = true;  //if true logs are printed to the console
    /*
        initialize on page load:
        We need to get a list of tissues available from the API endpoint "tissuelist"
    */
    $(document).ready(function(){ 
      $scope.$on('$viewContentLoaded', function() {
        //get tissues list
        $http.get('/api/tissuelist/a').then(function(result){
          debug("got the tissue list \n");
          debug(result.data);
          $scope.rx = result.data;
          var models = Object.keys(result.data);
          var tissue = {};
          var tissue_names = [];
          /*
            Parse the received lists of tissues into an array of objects and a sorted array of names
            for display and selection
          */
          for(var i = 0; i < models.length;i++){
            tissue_names = Object.keys(result.data[models[i]]);
            for(var j = 0;j < tissue_names.length;j++){
              $scope.tissues[tissue_names[j]] = $scope.tissues[tissue_names[j]] || {};
              $scope.tissues[tissue_names[j]][models[i]] = $scope.rx[models[i]][tissue_names[j]];
              $scope.tissues[tissue_names[j]].name = tissue_names[j];
              $scope.tissues[tissue_names[j]].selected = false; //if it was selected in the control panel tissue list
              $scope.tissues[tissue_names[j]].disabled = false; //if it is disabled due to an incompatible selection this is true
            }
          }
          debug("tissues object");
          debug($scope.tissues);
          $scope.tissues_sorted = Object.keys($scope.tissues).sort();
          debug("sorted tissues");
          debug($scope.tissues_sorted);
          // for (var i = 0; i < result.data.data.length;i++) {
          //   tissue = result.data.data[i];
          //   tissue.disabled = (tissue.poles.length === 0) ? true : false;
          //   tissue.selected = false;
          //   $scope.rx.push(tissue);
          // };
          debug($scope.rx);
          //sort into alphabetical order after recieving list of tissues
        });
        //set up charts
        $scope.chartP = new Highcharts.Chart($scope.permittivity_data);
        $scope.chartC = new Highcharts.Chart($scope.conductivity_data);
      });
   });


    //container for received data
    $scope.tissues ={};
    $scope.tissues_sorted = [];
    $scope.selectable_poles = {
      Gabriel: {
        disabled: true,
        poles: [4]
      },
      Krewer: {
        disabled: false,
        poles: [1,2,3,4,5,6,7,8,9,10]
      }
    }
    $scope.colours = [
      "#D63333",
      "#3341D6",
      "#33D633",
      "#E7FA1B",
      "#FA1BD9",
      "#1BFAF6",
      "#FAA81B",
      "#0F8719"
    ];
    $scope.tables = {};
    $scope.export = {
      formats: [
        {name:"csv",disabled: false},
        {name:"xls", disabled: false},
        {name:"xml", disabled: true}
      ],
      data: [],
      file_ready: false,
      url: "",
      selected: {
        format: ""
      }
    };


   

    $scope.datasets = {
      Gabriel: {name: "Gabriel",model: "Cole-Cole", selected: false, pole:4},
      Krewer: {name: "Krewer", model:"Debye", selected: false,pole:5}
    };

    $scope.visible ={
      conductivity: false,
      permittivity: false,
      table: false,
      errors: false
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
      {key:"100GHz",   value: 100000000000}
    ];

    $scope.selected = {
        tissuetype: {
          name: "Select a Tissue",
          selected: false,
          name_readable: ""
        },
        poles: {
          Gabriel: 4,
          Krewer: 4
        },
        pointsPerDecade: 10,
        startFreq: 10,
        stopFreq:10000,
        data: null
    };


    $scope.$watch('selected', function (newValue, oldValue) {
      debug("watch triggered");
      // the selected Krewer poles have changed, check that all tissues which don't have this value are disabled
      if(newValue.poles.Krewer != oldValue.poles.Krewer){
        debug("krewer poles changed");
        for(var i = 0;i<$scope.tissues_sorted.length;i++){
          if($scope.tissues[$scope.tissues_sorted[i]].Krewer.poles_available.indexOf(newValue.poles.Krewer) == -1){
            $scope.tissues[$scope.tissues_sorted[i]].disabled = true;
            $scope.tissues[$scope.tissues_sorted[i]].selected = false;
          }
        }
      }
    }, true);

    /*
      watch which datasets & poles the user selects to check for acceptable combinations
    */
    $scope.$watch('datasets', function (newValue, oldValue) {
      debug("dataset watcher triggered");
      debug(newValue);
      for(var i=0;i<$scope.tissues_sorted.length;i++){
        key = $scope.tissues_sorted[i];
        if(newValue.Krewer.selected && newValue.Gabriel.selected){
          debug("both changed");
          if($scope.tissues[key].Krewer.poles_available.indexOf(newValue.Krewer.pole) == -1 && $scope.tissues[key].Gabriel != undefined){
            $scope.tissues[key].disabled = true;
            $scope.tissues[key].selected = false;
          }
          else{
            $scope.tissues[key].disabled = false;
          }
        }
        else if(newValue.Krewer.selected){
          debug("Krewer changed");
          if($scope.tissues[key].Krewer.poles_available.indexOf(newValue.Krewer.pole) == -1){
            $scope.tissues[key].disabled = true;
            $scope.tissues[key].selected = false;
          }
          else{
            $scope.tissues[key].disabled = false;
          }
        }
        else if(newValue.Gabriel.selected){
          debug("Gabriel");
          if($scope.tissues[key].Gabriel != undefined){
            $scope.tissues[key].disabled = true;
            $scope.tissues[key].selected = false;
          }
          else {
            $scope.tissues[key].disabled = false;
          }
        }
        //by default set everything to selectable but not selected
        else {
            $scope.tissues[key].disabled = false;
            $scope.tissues[key].selected = false;
        }
      }
    },true);




    //reset selections
    $scope.reset = function() {
      var names = Object.keys($scope.tissues);
      for(var i = 0;i < names.length;i++){
        $scope.tissues[names[i]].selected = false;
      }
      $scope.datasets = {
        Gabriel: {model: "Cole-Cole", selected: false, pole:4},
        Krewer: {model:"Debye", selected: false,pole:5}
      };
    };

    $scope.validateGraphSettings = function() {
      //TODO fill out this check and implement it
    };

    $scope.tableData = {
      data: {}, 
      show: false
    };


    /*
      returns an array of frequencies for which to calculate model data.
      perDecade can be between 1 and 20 but start needs to be a multiple of 10
    */
    function getLogFrequencies(perDecade,start,decades) {
      var freq = [];
      var decade = start;
      for(var i = 0;i<decades;i++){
        for(var j = 0; j < perDecade;j++){
          freq[(i*perDecade)+j] =  Math.pow(10,((1/perDecade)*j))*decade;
        }
        decade = decade*10;
      }
      freq[perDecade*i] = decade;
      debug(freq);
      return freq;
    };

    /*
      Interpret the user's input and parse it to be used to plot the data
    */
    function parse_settings() {
      debug("parsing settings");
      var tissues = [],
          datasets = [],
          dataset_names = Object.keys($scope.datasets), 
          freq = [];
      for(var i = 0; i < dataset_names.length;i++){
        if($scope.datasets[dataset_names[i]].selected === true){
            datasets.push(dataset_names[i]);
          }
      }
      freq = getLogFrequencies($scope.selected.pointsPerDecade,$scope.selected.startFreq,log10($scope.selected.stopFreq/$scope.selected.startFreq));
      return {
        tissues: tissues,
        datasets: datasets,
        freq: freq
      };
    }

    function plotGabriel(freq,data,poles){
      debug("plotting gabriel data");
      debug(data);
      //set default value for number of poles
      if(typeof(poles)==='undefined') poles = 4;
      data = data.poles;
      var sumation = new Complex(0,0);
      var conductivity = [],permittivity = [];
      var sumation = new Complex(0,0);
      var w;
      var graph_data = {};
      for(var i =0;i<freq.length;i++){
        sumation = new Complex(0,0);
        w =  2*Math.PI*freq[i];
        for(var p = 0;p < poles;p++){
          sumation = sumation.add(new Complex(data.poles[p].del,0).divBy(new Complex(1,0).add( new Complex(0, w*data.poles[p].tau ).pow(1-data.poles[p].alf))) );
        }
        sumation = sumation.add(new Complex(data.ef,0)).add(new Complex(data.sig,0).divBy(new Complex(0,w*e0)));
        permittivity[i] = sumation.re;
        conductivity[i] = -(sumation.i*e0*w);
        graph_data[freq[i]] = {
          permittivity: sumation.re,
          conductivity: -(sumation.i*e0*w)
        };
      }
      return {
        conductivity: conductivity,
        permittivity: permittivity,
        graph_data: graph_data
      };
    };


    function plotKrewer(freq,data){ 
      debug("plotting krewer data"); 
      debug(data); 
      //temp poles assignment

      var w = 0,
          constant = 0,
          sumation = 0,
          poles = data.poles,
          permittivity = [], 
          conductivity = [],
          graph_data = {};

      //loop over frequencies
      for(var i =0; i < freq.length;i++){
        w =  2*Math.PI*freq[i];
        sumation = new Complex(data.const_c,0).divBy(new Complex(0,w*e0));
        //loop over poles
        for(var j = 0; j<poles.length;j++){
          if(poles[j]["delta_permitivity"] != 1)
            sumation = sumation.add( new Complex(poles[j].dp,0).divBy(new Complex(1,(w*poles[j].dc))) );
        }
        sumation = sumation.add(new Complex(data.const_p,0));
        permittivity[i] = sumation.re;
        conductivity[i] = -(sumation.i*e0*w);
        graph_data[freq[i]] = {
          permittivity: sumation.re,
          conductivity: -(sumation.i*e0*w)
        };
      }
      return {
        conductivity: conductivity,
        permittivity: permittivity,
        graph_data: graph_data
      };
    }


    /*
        Here the actual calculations and graphing is executed
    */
    $scope.model_data = function() {
      //loop through rx to find tissues to draw
      //check which data sets to draw
      debug("modeling data");
      var table_data = [],
          graph_data = {
            permittivity: {},
            conductivity: {}
          },
        charts = [],
        result = {},
        output = {},
        params = parse_settings(),
        selected_tissues = [],
        permittivity_series = [],
        conductivity_series = [],
        dataset_names = Object.keys($scope.datasets),
        tissue_names = Object.keys($scope.tissues);

        //Place all the selected tissues into an array for looping over
        for(var i =0;i<tissue_names.length;i++){
          if($scope.tissues[tissue_names[i]].selected)
            selected_tissues.push($scope.tissues[tissue_names[i]]);
        }
        debug("debug 1");
        debug(selected_tissues);
        debug(params);
        for(var i = 0; i < selected_tissues.length;i++){
          output[selected_tissues[i].name] = {};
          output[selected_tissues[i].name]['frequencies'] = params.freq;
          for(var j = 0; j < params.datasets.length;j++){
            debug("calculating data for tissue:" + selected_tissues[i].name);
            switch(params.datasets[j]){
              case "Krewer":
                debug(selected_tissues[i].Krewer.pole_sets);
                output[selected_tissues[i].name][params.datasets[j]] = plotKrewer(params.freq,selected_tissues[i].Krewer.pole_sets[$scope.datasets.Krewer.pole]);
                graph_data.permittivity[selected_tissues[i].Krewer.name + "[Krewer]"] = output[selected_tissues[i].name].Krewer.permittivity;
                graph_data.conductivity[selected_tissues[i].Krewer.name + "[Krewer]"] = output[selected_tissues[i].name].Krewer.conductivity;
              break;
              case "Gabriel":
                output[selected_tissues[i].name][params.datasets[j]] = plotGabriel(params.freq,selected_tissues[i].Gabriel);
                graph_data.permittivity[selected_tissues[i].Gabriel.name+ "[Gabriel]"] = output[selected_tissues[i].name].Gabriel.permittivity;
                graph_data.conductivity[selected_tissues[i].Gabriel.name+ "[Gabriel]"] = output[selected_tissues[i].name].Gabriel.conductivity;
              break;
              default:
              break;
            }/*End Switch*/
          }/*End for loop (params.datasets)*/
        }/*End for loop (selected_tissues)*/

        debug("Tissues have been computed:");
        debug(graph_data);
        //now draw the graphs:
        //grab graph templates and populate it for each graph
        //each series needs to contain the data for each other series for it's graph to allow comparisons
        //names need to be included
        //a function needs to be made for each series on the fly drawing the hover over data.
        var i = 0;
        var keys = Object.keys(graph_data.permittivity);
        var series_data;
        //for each calculated model, make a series containing it as the main data and
        Object.keys(graph_data.permittivity).forEach(function (key) { 
          var dataP = [], dataC = [];
          //remove the current key from the keys array
          keys.splice(i,1);
          for(var j = 0; j < graph_data.permittivity[key].length;j++){
            dataP[j] = {};
            dataC[j] = {};
            if(keys.length > 0){
              for(var k = 0; k < keys.length;k++){
                dataP[j][keys[k]] = graph_data.permittivity[keys[k]][j];
                dataC[j][keys[k]] = graph_data.conductivity[keys[k]][j];
              }
            }
            dataP[j].y = graph_data.permittivity[key][j];
            dataC[j].y = graph_data.conductivity[key][j];
            dataP[j].x = params.freq[j];
            dataC[j].x = params.freq[j];
          }
          permittivity_series[i] = {
            name: key,
            color: $scope.colours[i],
            pointStart: 1,
            lineWidth: 5,
            visible: true,
            data: dataP
          };
          conductivity_series[i] = {
            name: key,
            color: $scope.colours[i],
            pointStart: 1,
            lineWidth: 5,
            visible: true,
            data: dataC
          };
          //add the key back to the list of keys
          keys.splice(i,0,key);
          i++;
          // charts[1] = new Highcharts.Chart();
        //and add the table
        }); /* End loop over calculated models*/
        $scope.permittivity_data.series = permittivity_series;
        $scope.conductivity_data.series = conductivity_series;
        $scope.permittivity_data.chart.models = params.datasets;
        $scope.conductivity_data.chart.models = params.datasets;
        $(document).ready(function(){
          $scope.chartP = new Highcharts.Chart($scope.permittivity_data);
          $scope.chartC = new Highcharts.Chart($scope.conductivity_data);
        });
        //format for tables
        $scope.tables = {};
        debug("making graph data");
        debug(output);
        var tissues = Object.keys(output);
        //loop over tissues
        debug(tissues)
        for(var i = 0; i < tissues.length;i++){
          $scope.tables[tissues[i]] = {
            tableData: {
              frequency: params.freq,
              krewer:  (output[tissues[i]].hasOwnProperty("Krewer")) ? output[tissues[i]].Krewer.graph_data : null,
              gabriel: (output[tissues[i]].hasOwnProperty("Gabriel")) ? output[tissues[i]].Gabriel.graph_data : null,
            },
            visible: false
          }
        }
        debug("Data modeled and tabled");
        debug($scope.graphs);
        $scope.visible.conductivity = true;
        $scope.visible.permittivity = true;
      };/* End $scope.model_data */


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
            debug('The chart was just redrawn');
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
            debug('The chart was just redrawn');
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

  /*
    Export functions and data
  */

   $scope.exportData = function() {
      $scope.export.file_ready = false;

      /*
          the server needs the data formatted like such:
          postData= {
                      tissues: [],
                      freq: {steps: xxx,start: xxx,stop: xxx},
                      models: [],
                      poles: {krewer: xxx}
          }
      */
      var postData = {
        tissues: [],
        freq: {
          steps: $scope.selected.pointsPerDecade,
          start: $scope.selected.startFreq,
          stop: $scope.selected.stopFreq
        },
        datasets: [],
        poles: {
          Krewer: 0
        }
      };

      var names = Object.keys($scope.tissues) ;
      for(var i = 0; i < names.length;i++){
        if($scope.tissues[names[i]].selected == true){
          postData.tissues.push(names[i]);
        }
      }
      var dataset_names = Object.keys($scope.datasets);
      for(var i = 0; i < dataset_names.length;i++){
        if($scope.datasets[dataset_names[i]].selected == true){
          postData.datasets.push($scope.datasets[dataset_names[i]].name);
        }
      }
      postData.poles.Krewer = $scope.datasets.Krewer.pole;
      debug("post data");
      debug(postData);
      $http.post('/api/export/'+$scope.export.selected.format, postData)
        .then(function(result) {
          debug(result);
          $scope.export.url = result.data.url;
          $scope.export.file_ready = true;
      });
    };

  /*
  Helper functions and variables
  */

  //console.log function wrapped so it can be disabled for release version.
  function debug(string){
    if($scope.debug)
      console.log(string);
  }

  //log base 10 for model calculations
  function log10(val){
    return Math.ceil(Math.log(val) / Math.LN10);
  };

  //permittivity of free space
  var e0 = 8.85418782e-12;

//check if property has value in object
function inObject(object,property,value,depth){
  debug("called inObject");
  if(depth == undefined) depth = 20; //default deepest nesting to iterate through
  if(property in object)//property has been found
    if(value == undefined) //only checking if property exists regardless of value
      return true;
    else
      return (object[property] == value);//check if property = value
  else{
    var properties = Object.keys(object),
        objectsFound = 0,
        objectsFalse = 0;
    for(var i =0;i<properties.length;i++){
      if(isObject(properties[i])){
        objectsFound++;
        if(inObject(properties[i],property,value,depth-1))//if it exists in this branch return true
          return true;
        else 
          objectsFalse++;
      }
    }
    if(objectsFound == 0 || objectsFalse == objectsFound){
      return false;//didn't find it and reached the end of a branch
    }
  }

}
//check if var is an object
function isObject(a) {
    return (!!a) && (a.constructor === Object);
};


});