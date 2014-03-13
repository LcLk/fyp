angular.module('app.controllers').controller('RepoMultipleCtrl', 
  function ($scope,$timeout,$http,$location,API,Graph,Data ) {
    console.log(API);

    $scope.tissues = API.getTissues();

    $scope.tissues_sorted = [];//will be populated by watcher once above API call returns
    $scope.formValidated = false;
    $scope.datasets = {
      Gabriel: {name: "Gabriel",model: "Cole-Cole", selected: false, pole:4},
      Krewer: {name: "Krewer", model:"Debye", selected: false,pole:5}
    };

    $scope.graph = {
      axis: ["logarithmic","linear"],
      popout: {"Open graph in new window": true, "Keep graph inline": false}
    };

    $scope.initial_settings = {
    	dataset: {
			selected: null,
			poles: null
    	},
    	tissues_selected: 0,
      frequency: {
        start: 100000,
        stop: 100000000,
        steps:5
      },
    	graph: {
    		axis: null
    	}
    };
    $scope.settings = {
    	dataset: {
			selected: null,
			poles: null
    	},
    	tissues_selected: 0,
      frequency: {
        start: 100000,
        stop: 100000000,
        steps:5
      },
    	graph: {
    		axis: null
    	}
    };

    $scope.selectable_poles = {
      Gabriel: {
        disabled: true,
        poles: [4]
      },
      Krewer: {
        disabled: false,
        poles: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
      }
    };
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

    $scope.currentStep = 1;

    $scope.instructions = [
      '<b>First:</b><br /><p> Select the dataset to model. For details on each dataset see the reference page on '+
      '<a href="/repo/references#ref1">Gabriel</a> and  <a href="/repo/references#ref2">Krewer</a></p>' +
      '<p>Then for each selected dataset select the number of poles for each model. For details on the maths'+
      'involved see the <a href="/repo/introduction">introduction</a> ' +
      '(the Cole-Cole models by Gabriel are only available with 4 poles and the Debye models by Krewer aren\'t '+
        'all available with the same number of poles).</p>',

      '<b>Second:</b><br /><p> Select the tissues to model. These will change depending on the datasets and poles '+
      'selected.</p><p> To see the poles available for the Krewer dataset for a particular tissue hover over it\'s name.'+
      'This will work even if the tissue is currently greyed out.</p>',


      '<b>Third:</b><br /><p> Set the frequency range for the modeled data. Make sure that the Stop frequency is '+
      'larger than the Start frequency.</p>'+
      '<p>The points per decade can range from 1 to 20 points. This only applies for the logarithmic axis, ' +
      'while all linear graphs have a set 100 points on the X-axis.</p>',

      
      '<b>Fourth:</b><br /><p>Select whether or not the graph\'s X-axis should be logarithmic or linear.<br /> The Y-axis will always be'+
      'logarithmic.</p>',


      '<b>Fifth:</b><br /><p>Finally generate the graph or reset the settings.</p>',
      ];



    $scope.$watch('settings.tissues_selected',function(nu,old){
      console.log("selected: "+nu);
    });
    $scope.selectDataset = function(dataset,pole){
      console.log("iterating over tissues");
      var tissue = null;
      console.log(dataset);	
      for(var i =0;i<$scope.tissues_sorted.length;i++){
        tissue = $scope.tissues[$scope.tissues_sorted[i]];
        if(dataset == "Krewer"){
          if(tissue.Krewer.poles_available.indexOf(pole) != -1 )
            $scope.tissues[$scope.tissues_sorted[i]].disabled = false;
    	    else
            $scope.tissues[$scope.tissues_sorted[i]].disabled = true;
        }
        else if(dataset == "Gabriel"){
          if(tissue.Gabriel != undefined)
            $scope.tissues[$scope.tissues_sorted[i]].disabled = false;
    	  else
            $scope.tissues[$scope.tissues_sorted[i]].disabled = true;
        }
      }
    };

    //reset settings to initial settings, using JSON to create a deep copy
    $scope.reset = function() {
      $scope.settings = JSON.parse(JSON.stringify($scope.initial_settings));
    };


    $scope.visible ={
      conductivity: false,
      permittivity: false,
      table: false,
      errors: false
    }

    /*
      Interpret the user's input and parse it to be used to plot the data
    */
    function parse_settings() {
      console.log("parsing settings");
      var datasets = [],
          dataset_names = [$scope.settings.dataset.selected], 
          freq = [],
          tissues = [];
      for(var i = 0;i < $scope.tissues_sorted.length;i++){
      	if($scope.tissues[$scope.tissues_sorted[i]].selected)
      		tissues.push($scope.tissues[$scope.tissues_sorted[i]]);
      }
      if($scope.settings.graph.axis = "logarithmic")
        freq = getLogFrequencies($scope.settings.frequency.steps,$scope.settings.frequency.start,log10($scope.settings.frequency.stop/$scope.settings.frequency.start));
      else
        freq = getFrequencies($scope.settings.frequency.start,$scope.settings.frequency.stop);
      return {
	        tissues: tissues,
	        datasets: [$scope.settings.dataset.selected],
	        freq: freq
    	};

    } 

    $scope.model_data = function() {
      //loop through rx to find tissues to draw
      //check which data sets to draw
      console.log("modeling data");
      var table_data = [],
          graph_data = {
            permittivity: {},
            conductivity: {}
          },
        charts = [],
        result = {},
        output = {},
        params = parse_settings(),
        selected_tissues = params.tissues,
        permittivity_series = [],
        conductivity_series = [],
        dataset_names = Object.keys($scope.datasets),
        tissue_names = Object.keys($scope.tissues),
        max_p = 0,
        max_c = 0,
        min_p = 10^20,
        min_c = 10^20;
        console.log("console.log 1");
        console.log(selected_tissues);
        console.log(params);
        for(var i = 0; i < selected_tissues.length;i++){
          console.log("loop1");
          output[selected_tissues[i].name] = {};
          output[selected_tissues[i].name]['frequencies'] = params.freq;
          for(var j = 0; j < params.datasets.length;j++){
            console.log("loop2");
            console.log("calculating data for tissue:" + selected_tissues[i].name);
            switch(params.datasets[j]){
              case "Krewer":
                console.log(selected_tissues[i]);
                console.log(selected_tissues[i].Krewer.pole_sets);
                console.log($scope.settings.dataset.poles);
                output[selected_tissues[i].name][params.datasets[j]] = Graph.plotKrewer(params.freq,selected_tissues[i].Krewer.pole_sets[$scope.settings.dataset.poles]);
                graph_data.permittivity[selected_tissues[i].Krewer.name + "[Krewer]"] = output[selected_tissues[i].name].Krewer.permittivity;
                graph_data.conductivity[selected_tissues[i].Krewer.name + "[Krewer]"] = output[selected_tissues[i].name].Krewer.conductivity;
              break;
              case "Gabriel":
                output[selected_tissues[i].name][params.datasets[j]] = Graph.plotGabriel(params.freq,selected_tissues[i].Gabriel.poles);
                graph_data.permittivity[selected_tissues[i].Gabriel.name+ "[Gabriel]"] = output[selected_tissues[i].name].Gabriel.permittivity;
                graph_data.conductivity[selected_tissues[i].Gabriel.name+ "[Gabriel]"] = output[selected_tissues[i].name].Gabriel.conductivity;
              break;
              default:
              break;
            }/*End Switch*/
            if (output[selected_tissues[i].name][params.datasets[j]].max_p > max_p ) max_p = output[selected_tissues[i].name][params.datasets[j]].max_p;
            if (output[selected_tissues[i].name][params.datasets[j]].max_c > max_c ) max_c = output[selected_tissues[i].name][params.datasets[j]].max_c;
            if (output[selected_tissues[i].name][params.datasets[j]].min_p < min_p ) min_p = output[selected_tissues[i].name][params.datasets[j]].min_p;
            if (output[selected_tissues[i].name][params.datasets[j]].min_c < min_c ) min_c = output[selected_tissues[i].name][params.datasets[j]].min_c;
          }/*End for loop (params.datasets)*/
        }/*End for loop (selected_tissues)*/

        console.log("Tissues have been computed:");
        console.log(graph_data);
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

        //set linear or logarithmic axis

        console.log("max_p: " + max_p + " , max_c: " + max_c);
        console.log("upperbound p: " + upperBound(max_p) + " , upperBound c: " + upperBound(max_c));
        console.log("min_p: " + min_p + " , min_c: " + min_c);
        console.log("lowerbound p: " + lowerBound(min_p) + " , lowerBound c: " + upperBound(min_c));
        $scope.permittivity_data.xAxis.type = $scope.settings.graph.axis;
        $scope.permittivity_data.xAxis.min = $scope.settings.frequency.start;
        $scope.permittivity_data.xAxis.max = $scope.settings.frequency.stop;
        $scope.permittivity_data.xAxis.tickInterval = ($scope.settings.graph.axis == "linear") ? ($scope.settings.frequency.stop - $scope.settings.frequency.start) / 20  : null;
        $scope.permittivity_data.xAxis.minorTickInterval = ($scope.settings.graph.axis == "linear") ?  "auto" : 0.1;
        $scope.permittivity_data.yAxis.min = lowerBound(0);
        $scope.permittivity_data.yAxis.max = upperBound(max_p);

        $scope.conductivity_data.xAxis.type = $scope.settings.graph.axis;
        $scope.conductivity_data.xAxis.min = $scope.settings.frequency.start;
        $scope.conductivity_data.xAxis.max = $scope.settings.frequency.stop;
        $scope.conductivity_data.xAxis.tickInterval = ($scope.settings.graph.axis == "linear") ? ($scope.settings.frequency.stop - $scope.settings.frequency.start) / 20 : null;
        $scope.conductivity_data.xAxis.minorTickInterval = ($scope.settings.graph.axis == "linear") ?  "auto" : 0.1;
        $scope.conductivity_data.yAxis.min = lowerBound(0);
        $scope.conductivity_data.yAxis.max = upperBound(max_c);

        //fill series data into graph options.
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
        console.log("making graph data");
        console.log(output);
        var tissues = Object.keys(output);
        //loop over tissues
        console.log(tissues)
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
        console.log("Data modeled and tabled");
        console.log($scope.graphs);
        $scope.visible.conductivity = true;
        $scope.visible.permittivity = true;
      };/* End $scope.model_data */
  /*
    Watchers
  */


  $scope.$watch('settings.dataset',function(nu,old){
    	console.log("dataset changed",nu);
      if(nu.selected == "Krewer")
        $scope.selectDataset("Krewer", nu.poles);
      else if(nu.selected == "Gabriel")
        $scope.selectDataset("Gabriel", nu.poles);
  },true);


  $scope.$watch('tissues',function(nu,old){
      console.log("tissue changed");
      for(var i = 0;i<$scope.tissues_sorted.length;i++){
      	if(nu[$scope.tissues_sorted[i]].selected != old[$scope.tissues_sorted[i]].selected){
      		if(nu[$scope.tissues_sorted[i]].selected)
      			$scope.settings.tissues_selected ++;
      		else
      			$scope.settings.tissues_selected --;
      	}
      } console.log("changed",$scope.settings.tissues_selected);
      if($scope.settings.tissues_selected < 0)
      	$scope.settings.tissues_selected = 0;
      $scope.tissues_sorted = Object.keys(nu).sort();
  },true);

  $scope.$watch('settings',function(nu,old){
    if( nu.dataset.selected != "" && 
        nu.dataset.poles != null &&
        nu.tissues_selected > 0 &&
        nu.frequency.start < nu.frequency.stop &&
        nu.graph.axis != ""){
      $scope.formValidated = true;
    }
    else
      $scope.formValidated = false;

  },true);


   /*
    Scroll the instruction to the same level as the corrseponding form group
  */
  $scope.$watch('currentStep',function(nu,old){
    $timeout(function() {
      console.log("currentStep changed",nu);
      var panelHeight = $(".controlPanel.row").height(),
          instructionHeight = $("#instructions")[0].clientHeight
          offset = $(".step"+nu)[0].offsetTop;
      if(offset + instructionHeight > panelHeight)
        offset = panelHeight - instructionHeight - 45;
      $("#instructions").css("margin-top", offset+"px");      
    }, 100);
    
  });


  /*
    Initialize 
  */

  $(document).ready(function(){ 
    //set up charts
    console.log(Data.permittivity());
    $scope.permittivity_data =Data.permittivity();
    $scope.conductivity_data =Data.conductivity();
    $scope.chartP = new Highcharts.Chart($scope.permittivity_data);
    $scope.chartC = new Highcharts.Chart($scope.conductivity_data);
    $scope.settings.dataset.poles = null;
  });
});