
var e0 = 8.85418782e-12;
//var zip = new JSZip();

//postData needs to contain this JSON object:
/*
postData= {
            tissues: [],
            freq: {steps: xxx,start: xxx,stop: xxx},
            models: [],
            poles: {krewer: xxx}
}


*/

var Tissue= require('./../models/TissueModel.js');
postData = {};
res = {};
req = {};
singleFile = false;
format = "";
exports.main = function(request,response){
  res = response;
  req = request;
  postData = req.body;
  if(postData.tissues.length == 1 && postData.models.length == 1)
    singleFile = true;
  format = req.params.format;
  if(format == "csv" || format == "xls"){
    toCsv();
  }
}

//convert a number to string and pad with leading zeros
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


function toCsv() {
  csvPart1(postData);
};

//join array into either csv (,) or xls (\t) string based on format
function collapseArray(array){
  return array.join((format == "csv") ? "," : "\t");
}

/*
  to csv function has to be split into two to allow it to be a callback from an async function which needs to complete (getting tissue data from db)
*/
function csvPart1(postData){
  console.log("to csv");
  console.log(postData);
  var csvLink = "";
  var csvs = [];
  var tissues = getTissues(postData.tissues);
}

function csvPart2(tissues){
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
  fs.mkdirSync(directory,function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("New directory was created");
      }
  }); 

  //prepare zip file to contain csv files
  var zip = new AdmZip();
  //plot data and make csv files
  for(var i=0;i<tissues.length;i++){
 
    for(var j=0;j<postData.models.length;j++){
      switch(postData.models[j]){
        case "Krewer":
            path = directory+ "/"+tissues[i].name+" [Krewer]."+format;
            console.log(path);
            csv_data =  plotKrewer(freq,tissues[i],4);
        break;
        case "Gabriel":
            path = directory+ "/"+tissues[i].name+" [Gabriel]."+format;
            console.log(path);
            csv_data =  plotGabriel(freq,tissues[i],4);
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




//get all tissues for given ids from database
function getTissues(ids){
  console.log(ids);
			var datalist=[]
			function getNextTissue(list){
				var tissue = list.pop();
				console.log("getting tissue "+ tissue);
				//get data
				Tissue.findOne({_id: tissue},function (err, Tissuebject) {
					console.log("returning from searching for "+tissue);
					if (err){
					  	console.log("error for "+tissue);
					}
					else {
					  	console.log("read Tissue: "+Tissuebject.name+"\n");
					  	datalist.push(Tissuebject);
						if(list.length == 0){
							csvPart2(datalist);
						}
						else{
							getNextTissue(list);
						}
					  		
					}
				});
			}
			getNextTissue(ids);
};

function log10(val){
      return Math.ceil(Math.log(val) / Math.LN10);
    };

function plotGabriel(freq,data,poles){
      console.log("plotting gabriel data");
      //set default value for number of poles
      if(typeof(poles)==='undefined') poles = 4;
      data = data.cole;
      var sumation = new Complex(0,0);
      var conductivity = [],permittivity = [];
      var sumation = new Complex(0,0);
      var w;
      var csv_dat = [];
      csv_dat[0] = collapseArray(["frequency","permittivity","conductivity"]);
      var graph_data = {};
      for(var i =0;i<freq.length;i++){
        sumation = new Complex(0,0);
        w =  2*Math.PI*freq[i];
        for(var p = 0;p < poles;p++){
          sumation = sumation.add(new Complex(data.poles[p].del,0).divBy(new Complex(1,0).add( new Complex(0, w*data.poles[p].tau ).pow(1-data.poles[p].alf))) );
        }
        sumation = sumation.add(new Complex(data.ef,0)).add(new Complex(data.sig,0).divBy(new Complex(0,w*e0)));
        csv_dat[i+1] = collapseArray([freq[i] ,sumation.re, -1*sumation.i*e0*w]);
      }
      console.log(csv_dat.join("\r\n"));
      return csv_dat.join("\r\n");
    };

	function plotKrewer(freq,data){ 
      console.log("plotting krewer data"); 
      var data = data.debye[data.poles[data.poles.length-1]];
      var w,constant,sumation,poles = data.poles,permittivity = [], conductivity = [],graph_data = {};
      //loop over frequencies
      var csv_dat = [];
      csv_dat[0] = collapseArray(["frequency","permittivity","conductivity"]);
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
      console.log(freq);
      return freq;
    };