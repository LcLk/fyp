
var e0 = 8.85418782e-12;
//var zip = new JSZip();


/*
postData needs to contain this JSON object:
{
  tissues: ["Aorta",....],
  freq: {steps: int,start: int,stop: int},
  datasets: ["Krewer","Gabriel"],
  poles: {krewer: int}
}


*/

//
var models = require('./../models/models.js'),
  postData = {},
  res = {},
  req = {},
  singleFile = false,
  format = "",
  datasets = {
    Krewer: {
      done: true,
      needed: false
    },
    Gabriel: {
      done: true,
      needed: false
    }
  },
  tissues = {
    Gabriel: [],
    Krewer: []
  };






exports.main = function(request,response){
  res = response;
  req = request;
  postData = req.body;
  console.log("export API endpoint called");
  console.log(postData);
  if(postData.tissues.length == 1 && postData.datasets.length == 1)
    singleFile = true;
  format = req.params.format;
   if(postData.datasets.indexOf("Krewer") != -1 && postData.datasets.indexOf("Gabriel") != -1){
    console.log("case 1");
    datasets= {
      Gabriel: {
        done: false,
        needed: true
      },
      Krewer: {
        done: false,
        needed: true
      }
    };
    getKrewers(postData.tissues,tissues,function(tissues){
      console.log("in callback");
      console.log(tissues);
      getGabriels(postData.tissues,tissues,makeCSV);
    });
  }
  else if(postData.datasets.indexOf("Gabriel") != -1){ 
  console.log("case 2");

    datasets.Gabriel = {
      done: false,
      needed: true
    };
    getGabriels(postData.tissues,tissues,makeCSV);
  }
  else if(postData.datasets.indexOf("Krewer") != -1 ){
    console.log("case 3");
    datasets.Krewer = {
      done: false,
      needed: true
    };
    getKrewers(postData.tissues,tissues,makeCSV);
  }
  // if(format == "csv" || format == "xls"){
  //   toCsv();
  // }

}




var makeCSV = function(tissues){
  console.log(tissues);
  var freq = getLogFrequencies(postData.freq.steps,postData.freq.start,log10(postData.freq.stop/postData.freq.start));
  var plotted_data = {};
  var csvs = [];
  var csv_data = "";

  //find all directories already in static/exports
  var folders = fs.readdirSync("./static/export");
  folders.sort();
  var nextFolder = pad((parseInt((folders[folders.length -1]) || 0)+1),10);
  var directory = "./static/export/"+nextFolder;
  var path = "";
  //create the next directory in the list
  console.log("making directory");
  fs.mkdirSync(directory,function(err) {
      if(err) {
          console.log("Error Creating new Directory");
          console.log(err);
      } else {
          console.log("New directory was created");
      }
  }); 

  //prepare zip file to contain csv files
  var zip = new AdmZip(),
      currentDataset = "";
  //plot data and make csv files
  console.log("Looping over Datasets");
  for(var j=0;j<postData.datasets.length;j++){
    currentDataset = postData.datasets[j];
    for(var i=0;i<tissues[currentDataset].length;i++){
      switch(postData.datasets[j]){
        case "Krewer":
            path = directory+ "/"+tissues.Krewer[i].name+" [Krewer]."+format;
            console.log(path);
            console.log(tissues.Krewer[i]);
            csv_data =  plotKrewer(freq,tissues.Krewer[i].pole_sets[postData.poles.Krewer]);
        break;
        case "Gabriel":
            path = directory+ "/"+tissues.Gabriel[i].name+" [Gabriel]."+format;
            console.log(path);
            csv_data =  plotGabriel(freq,tissues.Gabriel[i].poles,4);
        break;
        default:
        break;
      }
      //write csv file to static/export
      fs.writeFileSync(path, csv_data, { encoding: 'utf8', mode: 438 , flag: 'w' },function(err) {
          console.log(path);
          if(err) {
              console.log(err);
          } else {
              console.log("Created File");
          }
      }); 
      //add csv file to zip file
      zip.addLocalFile(path);
    }
  }
  console.log(singleFile);
  if(singleFile){
    //only one file, return it's path
    console.log('http://' + req.headers.host +path.split(".")[1]);
    res.json(200, {url: 'http://' + req.headers.host +path.split(".")[1] + '.'+format});
  }
  else {
    //need to make zip archive
    // var zip = new EasyZip();
    // zip.zipFolder(directory,function(){
    //     zip.writeToFileSycn(directory+'/Dielectrics.zip');
    // });
    zip.writeZip(directory+"/NUIG_Dielectrics.zip");
    res.json(200, {url: 'http://' + req.headers.host +directory.split(".")[1]+"/NUIG_Dielectrics.zip"});
  }
  return;  
}
 
function getGabriels(names,tissues,callback){
  console.log("fetching Gabriel data:");
  console.log(names);
  console.log(tissues);
  models.Gabriel.find( {'name': { $in: names}})
          .exec( function(err,gabriels){
      console.log("fetching Gabriel data completed:");
      if(err || gabriels == null){
        console.log("error");
        console.log(err);
        return null;
      }
      else{
        console.log("success");
        console.log(gabriels); 
        datasets.Gabriel.done = true;
        tissues.Gabriel = gabriels;
        callback(tissues);
      }
    });
}

function getKrewers(names,tissues,callback){
  console.log("fetching Krewer data:");
  console.log(names);
  console.log(tissues);
  models.Krewer.find( {'name': { $in: names}})
          .exec( function(err,krewers){
      console.log("fetching Krewer data completed:");
      if(err || krewers == null){
        console.log("error");
        console.log(err);
        return null;  
      }
      else{
        console.log("success");
        console.log(krewers);
        datasets.Krewer.done = true;
        tissues.Krewer = krewers;
        callback(tissues);
      }
    });
}



function plotKrewer(freq,data){ 
  console.log("plotting krewer data"); 
  console.log(data); 
  var w = 0,
      constant = 0,
      sumation = 0,
      poles = data.poles,
      permittivity = [], 
      conductivity = [],
      graph_data = {},
      csv_dat = [];

  csv_dat[0] = collapseArray(["frequency","permittivity","conductivity"]);
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
    csv_dat[i+1] = collapseArray([freq[i], sumation.re, -1*sumation.i*e0*w]);
  }
  console.log(csv_dat.join("\r\n"));
  return csv_dat.join("\r\n");
}



function plotGabriel(freq,data,poles){
    console.log("plotting gabriel data");
    console.log(data);
    //set default value for number of poles
    if(typeof(poles)==='undefined') 
      poles = 4; 
    var sumation = new Complex(0,0);
        conductivity = [],
        permittivity = [],
        sumation = new Complex(0,0),
        w = 0,
        graph_data = {},        
        csv_dat = [];

    csv_dat[0] = collapseArray(["frequency","permittivity","conductivity"]);
    for(var i =0;i<freq.length;i++){
      sumation = new Complex(0,0);
      w =  2*Math.PI*freq[i];
      for(var p = 0;p < poles;p++){
        sumation = sumation.add(new Complex(data.poles[p].del,0).divBy(new Complex(1,0).add( new Complex(0, w*data.poles[p].tau ).pow(1-data.poles[p].alf))) );
      }
      sumation = sumation.add(new Complex(data.ef,0)).add(new Complex(data.sig,0).divBy(new Complex(0,w*e0)));
      permittivity[i] = sumation.re;
      conductivity[i] = -(sumation.i*e0*w);
      csv_dat[i+1] = collapseArray([freq[i] ,sumation.re, -1*sumation.i*e0*w]);
    }
    console.log(csv_dat.join("\r\n"));
    return csv_dat.join("\r\n");
  };



/*
Helper functions
*/


function log10(val){
  return Math.ceil(Math.log(val) / Math.LN10);
};

//perdecade can be any number but start and stop need to be multiples of 10
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
  return freq;
};

//convert a number to string and pad with leading zeros
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

//function had to be broken into two parts for an asynchronous callback
function toCsv() {
  csvPart1(postData);
};

//join array into either csv (,) or xls (\t) string based on format
function collapseArray(array){
  return array.join((format == "csv") ? "," : "\t");
}
