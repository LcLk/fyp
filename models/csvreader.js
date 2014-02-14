var fs = require('fs');
var sys = require('sys');
var Tissue = require('./TissueModel');
var cole = require('./ColeModel').cole;
var Debye = require('./DebyeModel').debye;
var mongoose = require('mongoose');
var extend = require('util')._extend;
mongoose.connect('mongodb://localhost/test');

function parseCsvToDebye(fileName,format){
	//read csv and parse into array of strings corresponding to lines
	var data = fs.readFileSync(fileName).toString().split('\n');
	var dataArray = [];
	var newDebye;
	for(var i =0;i < data.length;i++){
		dataArray[i] = data[i].split(",");
	}
	switch(format)
	{
	
		case "matlabFK":
		//in each line the first two values are the constants: permitivity at infinite frequency and conductivity at dc, following values are delta permitivity and time of each pole in a pair.
		//name of tissue is given in filename
			strings = fileName.split(".");
			data = [];
			var strings = fileName.split(".");
			var data = [];
			var polesArray = [];	
			for (var i = 0; i < dataArray.length;i++){
				polesArray = [];
				for(var j = 0; j < dataArray[i].length - 2;j = j+2){
					polesArray[Math.floor(j/2)] = {
						delta_permitivity: dataArray[i][j+2],
						delta_time: dataArray[i][j+3]
					};
				}
				data[i] = {
					constants:{
						permitivity: dataArray[i][0],
						conductivity: dataArray[i][1]
					},
					poles: polesArray
				};
			}
			newDebye = new Debye({
				name: strings[0],
				tissuetype: strings[1],
				pole: data,
				calculated: []
			});
		break;
		default:
		break;
	}
	newDebye.save(function(err,debye){
			console.log("saving...");
		if(err)
			console.log("error");
		else
			console.log("debye saved");
	});
	return true;

}
function parseCsvToCole(fileName,format){
	//read csv and parse into array of strings corresponding to lines
	var data = fs.readFileSync(fileName).toString().split('\n');
	var dataArray = [];
	var newCole;
	for(var i =0;i < data.length;i++){
		dataArray[i] = data[i].split(",");
	}
	switch(format)
	{
		case "IFAC":
		//precalculated data from teh ILAC online repository
			strings = fileName.split(".");
			data = [];
			for (var i = 0; i < dataArray.length;i++){
				data[i] = {
					frequency: dataArray[i][0],
					conductivity: dataArray[i][1],
					relative_permitivity: dataArray[i][2],
					loss_tangent: dataArray[i][3],
					wavelength: dataArray[i][4],
					penetration_depth: dataArray[i][5]
					};
				}
			newCole = new cole({
				name: strings[0],
				tissuetype: strings[1],
				pole: null,
				calculated: data
			});
		break;
		default:
		break;

	}
	newCole.save(function(err,cole){
			console.log("saving...");
		if(err)
			console.log("error");
		else
			console.log("cole saved");
	});
	return true;
};



function readTissuePoles(fileName){
	//read csv and parse into array of strings corresponding to lines
	var data = fs.readFileSync(fileName).toString().split('\n');
	var dataArray = [];
	var newTissue;
	for(var i =0;i < data.length;i++){
		dataArray[i] = data[i].split(",");
	}
	strings = fileName.split(".");
	//save each line as a tissue
	for (var i = 1; i < dataArray.length;i++){
		newTissue = new Tissue({
			name: dataArray[i][0],
			poles: 4,
			dabye: null,
			cole: {
				ef: dataArray[i][1],
				sig: dataArray[i][8],
				poles:[	{del: dataArray[i][2], tau: dataArray[i][3]/1000000000000, elf: dataArray[i][4]},
						{del: dataArray[i][5], tau: dataArray[i][6]/1000000000, elf: dataArray[i][7]},
						{del: dataArray[i][9], tau: dataArray[i][10]/1000000, elf: dataArray[i][11]},
						{del: dataArray[i][12], tau: dataArray[i][13]/1000, elf: dataArray[i][14]}	]
			}
		});
		console.log(newTissue);
		newTissue.save(function(err,tissue){
			console.log("saving...");
		if(err)
			console.log("error");
		else
			console.log("tissue "+newTissue.name+" saved");
		});
	}

};

function readTissueColePoles(fileName){
	console.log("reading tissues to cole");
	//read csv and parse into array of strings corresponding to lines
	var file = fs.readFileSync(fileName).toString().split('\n');
	var dataArray = [];
	var newTissue;
	var data = '';
	for(var i =1;i < file.length;i++){
		dataArray[i] = file[i].split(",");
	}
	strings = fileName.split(".");
	//save each line as a tissue
	console.log("now the for loop");
	for (var i = 1; i < dataArray.length-1;i++){ 
		console.log("searching for tissue "+ i + ", name: " + dataArray[i][0]);
		data = JSON.stringify(dataArray[i])
		updateTissue(data);		
	}

};
function updateTissue(dataString){
	data = JSON.parse(dataString);
	Tissue.findOne({'name' : data[0]},function(err,doc) {
		readAndSaveCole(err,doc,dataString);
	});
}
function readAndSaveCole(err,doc,dataString) {
	data = JSON.parse(dataString);
	console.log("\n\n readAndSaveCole :" +data[0])
	console.log("doc: "+doc);
	console.log("err: "+err);
	console.log("data: "+data[0]);
	if(err || doc == null || err == null){
		console.log("saving new tissue");
		newTissue = new Tissue({
			name: data[0],
			dabye: null,
			cole: {
				ef: data[1],
				sig: data[8],
				poles:[	{del: data[2], tau: data[3]/1000000000000, alf: data[4]},
						{del: data[5], tau: data[6]/1000000000, alf: data[7]},
						{del: data[9], tau: data[10]/1000000, alf: data[11]},
						{del: data[12], tau: data[13]/1000, alf: data[14]}	]
			}
		});
		console.log(newTissue);
		newTissue.save(saveCallback());
	}
	else{
		console.log("updating existing tissue");
		doc.cole = {
			ef: data[1],
			sig: data[8],
			poles:[	{del: data[2], tau: data[3]/1000000000000, alf: data[4]},
					{del: data[5], tau: data[6]/1000000000, alf: data[7]},
					{del: data[9], tau: data[10]/1000000, alf: data[11]},
					{del: data[12], tau: data[13]/1000, alf: data[14]}	]
		};
		doc.save(saveCallback());
	}

}

function saveCallback(err,doc){
	console.log("saving...");
	if(err || doc == null || err == null){
		console.log("error");
		console.log(err);
		console.log(null);
	}
	else
		console.log("doc "+doc.name+" saved");
}


function readTissueDebyePoles(fileName){
	//read csv and parse into array of strings corresponding to lines
	var data = fs.readFileSync(fileName).toString().split('\n');
	var linesArray = [],debyeArray=[];
	var name = fileName.split(".")[0].split("/")[1];
	var tissue,debye,poleArray=[],empty,polesPresentArray=[];
	for(var i =0;i < data.length;i++){
		linesArray[i] = data[i].split(",");
	}
	for (var i = 1; i < linesArray.length - 1;i++){
		poleArray = [];
		empty = true;
		for(var j = 0; j < linesArray[i].length - 2;j = j+2){
			poleArray[Math.floor(j/2)] = {
				dp: linesArray[i][j+2],
				dc: linesArray[i][j+3]
			};
		}
		debyeArray[i+1] = {
			const_p: linesArray[i][0],
			const_c: linesArray[i][1],
			poles: poleArray
		};
		if(linesArray[i][0] != 1 && linesArray[i][1] != 1)
			polesPresentArray.push(i+1);
	}
	console.log("data");
	console.log(data);
	console.log("poles");
	console.log(polesPresentArray);
	console.log(name);
	Tissue.findOne({ name: name }, function (err, doc){
		if(err || doc == null || err == null)
			console.log(err);
		else
		{
			console.log("found\n\n\n");
			console.log(doc);
			doc.debye = debyeArray;
			doc.poles = polesPresentArray;
			doc.save(saveCallback(err,doc));
		}

	});
};







module.exports.parseCsvToDebye = parseCsvToDebye;
module.exports.parseCsvToCole = parseCsvToCole;

function writeDebyeToTissue(name){
	Tissue.findOne({ 'name' : name }, function (err, doc){
		console.log("\nResults for "+name);
		if(err || doc == null){
			console.log("error");
			console.log("filename: " +name);
			console.log(err);
			console.log(doc);
		}
		else
		{
			var data, linesArray,tissue,debye,poleArray,empty,polesPresentArray;
			var tissue,debye,poleArray=[],empty,polesPresentArray=[];
			var names = {};
			console.log("found: "+name);
			data = fs.readFileSync("data/gabriel/"+name+"/DebyePolesBest.csv").toString().split('\n');
			linesArray = [];
			debyeArray=[];
			poleArray=[];
			polesPresentArray=[];
			for(var i =0;i < data.length;i++){
				linesArray[i] = data[i].split(",");
			}

			for (var i = 1; i < linesArray.length - 1;i++){
				poleArray = [];
				empty = true;
				for(var j = 0; j < linesArray[i].length - 2;j = j+2){
					poleArray[Math.floor(j/2)] = {
						dp: linesArray[i][j+2],
						dc: linesArray[i][j+3]
					};
				}
				debyeArray[i+1] = {
					const_p: linesArray[i][0],
					const_c: linesArray[i][1],
					poles: poleArray
				};
				if(linesArray[i][0] != 1 && linesArray[i][1] != 1)
					polesPresentArray.push(i+1);
			}
			Tissue.update({ 'name' : name },{$set: { 'debye' : debyeArray, 'poles' : polesPresentArray}},{upsert:true}, function(err, data) { 
				console.log(err);
				console.log(doc);
			});
			// doc['debye'] = debyeArray;
			// doc['poles'] = polesPresentArray;
			// doc.save(saveCallback(err,doc));
		}
	});
}

function findDebyeFiles(){
	var name = "";
	fs.readdir("data/gabriel",function(err,files){
		if (err){console.log("error reading dir"); return;}
		else {
			for(var i =1; i < files.length;i++){
				name = files[i];
				console.log("\n Searching for \""+ name + "\"");
				writeDebyeToTissue(name);				
			}
		}
	});
};
//readTissuePoles("all_cole.csv");



// parseCsvToDebye('debye.fat.csv',"matlabFK");
// parseCsvToCole('cole.fat.csv',"IFAC");
//parseCsvToCole('colefat.csv',"IFAC");

//parseCsvToDebye('debye.fat.csv',"matlabFK");
//parseCsvToCole('cole.fat.csv',"IFAC");
//parseCsvToCole('colefat.csv',"IFAC");

//readTissueColePoles("data/all_cole.csv");
//setTimeout(readTissueDebyePoles("data/Fat (Average Infiltrated).csv"),5000);

findDebyeFiles();


// process.exit(code=0)
