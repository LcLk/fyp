

'use strict';

/* Factories */


/*
  This factory gets tissue data from the server once which can be requested by any
  Controller to be reused.
*/
angular.module('app.factories', []).
factory('API', function($http,$q) {
    var tissues = {},
        promise = false,
        data = {},
        models=["Krewer","Gabriel"],
        tissue_names = [],
        returnData = {all:null};


    $http({method: 'GET',url:'/api/tissuelist/a',cache : true}).
    then(function(result){
      data = result.data;
      console.log("received tissues");
      console.log(data);
      for(var i = 0; i < models.length;i++){
        tissue_names = Object.keys(data[models[i]]);
        for(var j = 0;j < tissue_names.length;j++){
          tissues[tissue_names[j]] = tissues[tissue_names[j]] || {};
          tissues[tissue_names[j]][models[i]] = data[models[i]][tissue_names[j]];
          tissues[tissue_names[j]].name = tissue_names[j];
          tissues[tissue_names[j]].selected = false; //if it was selected in the control panel tissue list
          tissues[tissue_names[j]].disabled = true; //if it is disabled due to an incompatible selection this is true
        }
      }
      console.log(tissues);
    });
    return {
      getTissues: function(){return tissues;},
      getTissuesSorted: function(){return Object.keys(tissues).sort();}
  }
}).
factory('Graph', function($http) {
  return {
    draw: function(options,location){

    },
    plotGabriel: function(freq,data,poles){
      console.log("plotting gabriel data");
      console.log(data);
      //set default value for number of poles
      if(typeof(poles)==='undefined') poles = 4;
      var sumation = new Complex(0,0);
      var conductivity = [],permittivity = [];
      var sumation = new Complex(0,0);
      var w;
      var graph_data = {},
          max_p = 0,
          max_c = 0,
          min_p = 10^20,
          min_c = 10^20;

      for(var i =0;i<freq.length;i++){
        sumation = new Complex(0,0);
        w =  2*Math.PI*freq[i];
        for(var p = 0;p < poles;p++){
          sumation = sumation.add(new Complex(data.poles[p].del,0).divBy(new Complex(1,0).add( new Complex(0, w*data.poles[p].tau ).pow(1-data.poles[p].alf))) );
        }
        sumation = sumation.add(new Complex(data.ef,0)).add(new Complex(data.sig,0).divBy(new Complex(0,w*e0)));
        permittivity[i] = sumation.re;
        conductivity[i] = -(sumation.i*e0*w);
        if(permittivity[i] > max_p){
          max_p = permittivity[i];
        }
        else if(permittivity[i] < min_p){
          min_p = permittivity[i];
        }
        if(conductivity[i] > max_c){
          max_c = conductivity[i];
        }
        else if(conductivity[i] < min_c){
          min_c = conductivity[i];
        }

        graph_data[freq[i]] = {
          permittivity: sumation.re,
          conductivity: -(sumation.i*e0*w)
        };
      }
      return {
        conductivity: conductivity,
        permittivity: permittivity,
        graph_data: graph_data,
        max_p: max_p,
        max_c: max_c,
        min_p: min_p,
        min_c: min_c
      };
    },
    plotKrewer: function(freq,data){ 
      console.log("plotting krewer data");
      console.log(data);
      var w = 0,
          constant = 0,
          sumation = 0,
          poles = data.poles,
          permittivity = [], 
          conductivity = [],
          graph_data = {},
          max_p = 0,
          max_c = 0,
          min_p = 10^20,
          min_c = 10^20;
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
        if(permittivity[i] > max_p){
          max_p = permittivity[i];
        }
        else if(permittivity[i] < min_p){
          min_p = permittivity[i];
        }
        if(conductivity[i] > max_c){
          max_c = conductivity[i];
        }
        else if(conductivity[i] < min_c){
          min_c = conductivity[i];
        }
        graph_data[freq[i]] = {
          permittivity: sumation.re,
          conductivity: -(sumation.i*e0*w)

        };
      }
      console.log("permittivity",permittivity);
      return {
        conductivity: conductivity,
        permittivity: permittivity,
        graph_data: graph_data,
        max_p: max_p,
        max_c: max_c,
        min_p: min_p,
        min_c: min_c
      };
    }


  }
}).
factory('Data', function() {
    /*
      Templates for the graph options
    */
    var permittivity_data = {
       title_data: {
          type: "Permittivity",
          tissue: "Tissue"
       },
       chart: {
          type: 'spline',
          animation: Highcharts.svg, // don't animate in old IE
          margin: [0,20,100,50],
          height: 400,
          width: 700,
          zoomType: 'xy',
          renderTo: 'permittivity_container'
        },
       xAxis: {
          type: 'logarithmic',
          min: 10,
          max: 100000000000,
          minorTickInterval: 0.1,
          lineWidth: 2,
          minorLineWidth: 1,
          labels : {
            staggerLines: 2
          },
          title: {
            margin:20,
            text: 'frequency(Hz)'
          },
       },
        yAxis: {
          type: 'logarithmic',
          min: 0.1,
          max: 10000000,
          minorTickInterval: 0.1,
          lineWidth: 2,
          minorLineWidth: 1,
          title: {
            margin: 40,
            text: 'permittivity',
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
          enabled: true,
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'bottom',
          backgroundColor: '#FFFFFF',
          borderWidth: 0
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


    var conductivity_data = {
       title_data: {
          type: "Conductivity",
          tissue: "Tissue"
       },
       chart: {
          type: 'spline',
          animation: Highcharts.svg, // don't animate in old IE
          margin: [0,20,100,50],
          height: 400,
          width: 700,
          zoomType: 'xy',
          renderTo: 'conductivity_container'
        },
       xAxis: {
          type: 'logarithmic',
          min: 10,
          max: 100000000000,
          lineWidth: 2,
          minorLineWidth: 1,
          minorTickInterval: 0.1,
          labels : {
            staggerLines: 2
          },
          title: {
            margin: 20,
            text: 'frequency(Hz)'
          },
       },
       yAxis: {
        type: 'logarithmic',
        min: 0.001,
        max: 1000,
        lineWidth: 2,
        minorLineWidth: 1,
        minorTickInterval: 0.1,
        title: {
            margin: 40,
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
          enabled: true,
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'bottom',
          floating: true,
          backgroundColor: '#FFFFFF',
          borderWidth: 0
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
     return {
      conductivity: function(){
        return JSON.parse(JSON.stringify(conductivity_data));
      },
      permittivity: function(){
        return JSON.parse(JSON.stringify(permittivity_data));
      }
     }

   });

console.log("Factories loaded");