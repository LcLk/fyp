var fs = require('fs');
var sys = require('sys');
var mongoose = require('mongoose');
var models = require('./models');
var extend = require('util')._extend;

//for debugging print out all command line arguments used to call this script
console.log("command line arguements");
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
console.log("\n");

mongoose.connect('mongodb://localhost/test');

/*
	Below are functions to read from files to populate the DB,
	followed by the functions being called to populate the entire DB from scratch, or load in files which aren't already in the DB
	They are synchronous to produce more meaningful logs
*/


/*
All Debye files are stored in the ./models/data/krewer/{tissue name}/DebyePolesBest.csv format
THe script will be called from ./models so use this as root dir
*/
function readGabrielFile(callback){

	//internal function (aka closure) for writing to DB synchronously
	function readNext(lines_left){
		//return if the lsit is empty
		console.log(lines_left.length);
		if(lines_left.length == 0) callback();
		var line = lines_left.pop();
		var line_array = line.split(',');
		console.log(line_array);
		console.log("\n Searching for \""+ line_array[0] + "\"");
		models.Gabriel.update({name: line_array[0]}, parseGabrielLine(line_array), {upsert: true}, function(err,doc){
			console.log("saving "+line_array[0]);
			if(err || doc == null){
				console.log("error for "+ line_array[0]);
				console.log(err);
				console.log(doc);
			}
			else {
				console.log("saved "+line_array[0]);
				//we successfuly saved a file, now call recursively
				readNext(lines_left);
			}
		});
	}


	console.log("reading tissues from all_cole file");
	var lines = fs.readFileSync("data/all_cole.csv").toString().split('\n');
	console.log("number of lines = "+ lines.length);
	readNext(lines);
};



//exit the script
function exit(){
	process.exit(code=0);
};

/*
Gabriel's 4 pole cole cole models are all saved ina single csv, each line (except line[0] which is column names) is a separate tissue
Line sample:
	Tissue Type \ Parameter,ef,del1,tau1 (ps),alf1,del2,tau2 (ns),alf2,sig,del3,tau3 (us),alf3,del4,tau4 (ms),alf4

*/
function parseGabrielLine(data){
	console.log(data)
	return {
		name: data[0],
		poles_available: 4,
		poles:{
			ef: data[1],
			sig: data[8],
			poles:[
					{del: data[2], tau: data[3]/1000000000000, alf: data[4]},
					{del: data[5], tau: data[6]/1000000000, alf: data[7]},
					{del: data[9], tau: data[10]/1000000, alf: data[11]},
					{del: data[12], tau: data[13]/1000, alf: data[14]}
			]
		}
	};
};








//Actually call the above functions:
readGabrielFile(exit);
