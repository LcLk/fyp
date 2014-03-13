angular.module('app.controllers').controller('RepoExportCtrl',
	function ($scope,$timeout,$http,$location,API,Graph,Data ) {
    console.log(API);

    $scope.tissues = API.getTissues();

    $scope.tissues_sorted = API.getTissuesSorted();//will be populated by watcher once above API call returns
    $scope.tissues_display = [];
    $scope.formValidated = false;


    $scope.export = {
      url: "",
      file_ready: false
    };
    $scope.datasets = {
      Gabriel: {name: "Gabriel",model: "Cole-Cole", selected: false, pole:4, reference: 1},
      Krewer: {name: "Krewer", model:"Debye", selected: false, pole:9, reference: 2}
    };

    $scope.graph = {
      axis: ["logarithmic","linear"],
      popout: {"Open graph in new window": true, "Keep graph inline": false}
    };
    $scope.formats = [
        {name:"csv",disabled: false},
        {name:"xls", disabled: false}
    ];

    $scope.initial_settings = {
      datasets: {
        Gabriel: {
          selected: false,
          poles: 4
        },
        Krewer: {
          selected: false,
          poles: 9
        }
      },
      tissues_selected: 0,
      frequency: {
        start: 100000,
        stop: 100000000,
        steps:5
      },
      format: {
        file_type: null
      }
    };
    $scope.settings = {
      datasets: {
        Gabriel: {
          selected: false,
          poles: 4
        },
        Krewer: {
          selected: false,
          poles: 9
        }
      },
    	tissues_selected: 0,
    	frequency: {
    		start: 100000,
    		stop: 100000000,
    		steps:5
    	},
    	format: {
    		file_type: null
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
	    '<b>First:</b><br /><p> Select the datasets to model. For details on each dataset see the reference page on '+
	    '<a href="/repo/references#ref1">Gabriel</a> and  <a href="/repo/references#ref2">Krewer</a></p>' +
	    '<p>Then for each selected dataset select the number of poles for each model. For details on the maths'+
      'involved see the <a href="/repo/introduction">introduction</a> ' +
	    '(the Cole-Cole models by Gabriel are only available with 4 poles and the Debye models by Krewer aren\'t '+
	    	'all available with the same number of poles).</p>'+
	    '<p>If both datasets are selected error metrics will be calculated and displayed for comparison' +
      'of the datasets\' accuracy.</p>',

	    '<b>Second:</b><br /><p> Select the tissues to model. These will change depending on the datasets and poles '+
      'selected.</p><p> To see the poles available for the Krewer dataset for a particular tissue hover over it\'s name.'+
      'This will work even if the tissue is currently greyed out.</p>',


	    '<b>Third:</b><br /><p> Set the frequency range for the modeled data. Make sure that the Stop frequency is '+
      'larger than the Start frequency.</p>'+
	    '<p>The points per decade can range from 1 to 20 points. When exporting all models will be calculated at ' +
      'frequencies on a logarithmic scale.</p>',

      '<b>Fourth:</b><br /> <p> Select the file format to export the data in. CSV is advised as the most common '+
      'and useful format. XLS is used by Microsoft Excel.</p>',

	    '<b>Fifth:</b><br /><p>Finally send your settings to the server to generate the file(s) and wait for the '+
      'download button to be enabled. Then you can download your file(s) by clicking on the button( it is actually '+
      'a link). You can right click and save/send the download link but it will expire after a week.</p>',
	    ];

      
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
          steps: $scope.settings.frequency.steps,
          start: $scope.settings.frequency.start,
          stop: $scope.settings.frequency.stop
        },
        datasets: [],
        poles: {
          Krewer: $scope.settings.datasets.Krewer.poles
        }
      };

      var names = $scope.tissues_sorted;
      for(var i = 0; i < names.length;i++){
        if($scope.tissues[names[i]].selected == true){
          postData.tissues.push(names[i]);
        }
      }
      var dataset_names = Object.keys($scope.datasets);
      for(var i = 0; i < dataset_names.length;i++){
        if($scope.settings.datasets[dataset_names[i]].selected == true){
          postData.datasets.push($scope.datasets[dataset_names[i]].name);
        }
      }
      console.log("post data");
      console.log(postData);
      $http.post('/api/export/'+$scope.settings.format.file_type, postData)
        .then(function(result) {
          console.log(result);
          $scope.export.url = result.data.url;
          $scope.export.file_ready = true;
      });
    };


    $scope.selectDataset = function(poles){
      console.log("iterating over tissues");
      var datasets = Object.keys(poles),
          tissue = null,
          list = [];
      for(var i =0;i<$scope.tissues_sorted.length;i++){
        tissue = $scope.tissues[$scope.tissues_sorted[i]];
        if(datasets[0] == "Krewer" && datasets[1] == "Gabriel"){
          if( tissue.Krewer != undefined && 
              tissue.Krewer.poles_available.indexOf(poles.Krewer) != -1 &&
              "Gabriel" in tissue)
            $scope.tissues[$scope.tissues_sorted[i]].disabled = false;
          else
            $scope.tissues[$scope.tissues_sorted[i]].disabled = true;
        }
        else if(datasets[0] == "Krewer"){
          if(tissue.Krewer.poles_available.indexOf(poles.Krewer) != -1 )
            $scope.tissues[$scope.tissues_sorted[i]].disabled = false;
          else
            $scope.tissues[$scope.tissues_sorted[i]].disabled = true;
        }
        else if(datasets[0] == "Gabriel"){
          if("Gabriel" in tissue)
            $scope.tissues[$scope.tissues_sorted[i]].disabled = false;
          else
            $scope.tissues[$scope.tissues_sorted[i]].disabled = true;
        }
      }
    };


  /*
    Watchers
  */
  $scope.$watch('tissues',function(nu,old){
      $scope.tissues_sorted = Object.keys(nu).sort();
  },true);



  $scope.$watch('settings.datasets',function(nu,old){
      if(nu.Krewer.selected && nu.Gabriel.selected)
        $scope.selectDataset({Krewer: nu.Krewer.poles,Gabriel: nu.Gabriel.poles});
      else if(nu.Krewer.selected)
        $scope.selectDataset({Krewer: nu.Krewer.poles});
      else if(nu.Gabriel.selected)
        $scope.selectDataset({Gabriel: nu.Gabriel.poles});
  },true);


  $scope.$watch('tissues',function(nu,old){
      for(var i = 0;i<$scope.tissues_sorted.length;i++){
        if(nu[$scope.tissues_sorted[i]].selected)
          $scope.settings.tissues_selected ++;
        else
          $scope.settings.tissues_selected --;
      }
      if($scope.settings.tissues_selected < 0)
        $scope.settings.tissues_selected = 0;
  },true);



  $scope.$watch('settings',function(nu,old){
    if( nu.tissues_selected > 0 &&
        nu.frequency.start < nu.frequency.stop &&
        nu.format.file_type != null){
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

});