
//permittivity of free space
var e0 = 8.85418782e-12;
var tens = [
    1000000000000,
    100000000000,
    10000000000,
    1000000000,
    100000000,
    10000000,
    1000000,
    100000,
    10000,
    1000,
    100,
    10,
    1,
    0.1,
    0.01,
    0.001,
    0.0001,
    0.00001,
    0.000001,
    0.0000001,
    0.00000001,
    0.000000001,
    0.0000000001,
    0.00000000001,
    0.000000000001];

function plotGabriel(freq,data,poles){
  console.log("plotting gabriel data");
  console.log(data);
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
  console.log("plotting krewer data"); 
  console.log(data); 
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






 //log base 10 for model calculations
  function log10(val){
    return (Math.log(val) / Math.LN10);
  };


//check if property has value in object
function inObject(object,property,value,depth){
  console.log("called inObject");
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
  console.log(freq);
  return freq;
};


function getFrequencies(start,stop) {
  var freq = [],
      step = (stop-start)/100;
  for(var i = 0;i<100;i++){
    freq[i] = start+step*i;
  }
  console.log(freq);
  return freq;
};

/*
  Interpret the user's input and parse it to be used to plot the data
*/
function parse_settings() {
  console.log("parsing settings");
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

/*
  Return 10^x, where x is the integer just low enough to acommodate the given number on a graph where
  10^x is the minimum value displayed
  Not for negative numbers
*/
function lowerBound(number){
  for(var i =0;i < tens.length;i++){
    if(number > tens[i])
      return tens[i];
  }
}

function upperBound(number){
  for(var i =0;i < tens.length-1;i++){
    if(number > tens[i+1])
      return tens[i];
  }
}