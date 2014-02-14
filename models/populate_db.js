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


//if ran as "node populate_db.js local" then connect to test db, otherwise connect to openshift's mongodb instance
if(process.argv[2] == "test"){
	mongoose.connect('mongodb://localhost/test');
}
else {
	mongo_connect_string = 'mongodb://' + 
			process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' + 
			process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' +
			process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
			process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
			process.env.OPENSHIFT_APP_NAME;
	mongoose.connect(mongo_connect_string);
}


/*
	Below are functions to read from files to populate the DB, 
	followed by the functions being called to populate the entire DB from scratch, or load in files which aren't already in the DB
	They are synchronous to produce more meaningful logs
*/


/*
All Debye files are stored in the ./models/data/krewer/{tissue name}/DebyePolesBest.csv format
THe script will be called from ./models so use this as root dir
*/
function findKrewerFiles(callback){

	//internal function (aka closure) for writing to DB synchronously
	function readNext(files_left){
		//return if the lsit is empty
		if(files_left.length == 0) callback();
		name = files_left.pop();
		console.log("\n Searching for \""+ name + "\"");
		newKrewerEntry = new models.Krewer(parseKrewerFile(name));
		newKrewerEntry.save(function(err,doc){
			console.log("saving "+name);
			if(err || doc == null){
				console.log("error for "+ name);
				console.log(err);
				console.log(doc);
			}
			else {
				console.log("saved "+name);
				//we successfuly saved a file, now call recursively
				readNext(files_left);
			}
		});	
	}


	var name = "";
	//read directory
	fs.readdir("data/krewer",function(err,files){
		if (err){console.log("error reading directory data/krewer"); return;}
		else {
			//this calls the closure to read the first file to the DB
			readNext(files);
		}
	});
};


/*
Read a csv file of Debye poles created by Finn Krewer
format of file:

1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
6.1271,0.25004,2242.9,2.8161e-06,36173,4.8357e-05,233.5,1.5293e-07,38.054,9.188e-12,1.0024e+07,0.0015553,61.79,2.7417e-09,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
5.4591,0.25003,10.234,2.9806e-11,29.59,6.8696e-12,261.02,1.8544e-07,1.0023e+07,0.0015542,2243,3.022e-06,64.603,3.1343e-09,35004,4.5655e-05,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
5.4266,0.25002,28.837,6.7596e-12,1.003e+07,0.0015746,48809,7.5378e-05,670.69,8.654e-07,56.414,2.7053e-09,4653.8,8.2561e-06,10.955,2.7512e-11,112.13,6.9898e-08,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
4.9604,0.25002,717.82,1.0151e-06,21.048,1.4957e-11,1.0028e+07,0.0015743,54.028,5.2013e-09,136.79,1.107e-07,15.294,9.2021e-10,4377.7,8.278e-06,48759,7.4522e-05,17.925,5.0005e-12,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
4.9565,0.25001,21.51,1.4291e-11,1504.2,2.9795e-06,1.0023e+07,0.0015799,7840.4,1.8015e-05,6.6206,4.2744e-10,17.123,4.9132e-12,78.871,5.5717e-08,348.15,4.7266e-07,54200,0.00010126,54.227,3.5715e-09,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
5.0923,0.25002,19.223,1.5431e-11,88.549,6.7605e-08,49401,0.00010487,54.081,4.0558e-09,1726.4,3.5259e-06,394.77,5.4805e-07,1.0003e+07,0.0015927,9062,2.0782e-05,19.536,5.3853e-12,35326,0.00039608,9.3334,6.1522e-10,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
4.5264,0.25002,51.379,4.4718e-09,5.6237,3.6386e-11,1628.5,3.3725e-06,87.894,6.9175e-08,34607,8.0644e-05,382.08,5.3863e-07,12.579,9.1374e-10,7340.3,1.846e-05,1.0007e+07,0.0015929,29.175,8.8475e-12,48596,0.00026408,5.1708,2.6424e-12,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
4.6391,0.25004,9.836e+06,0.0016202,68.058,7.3199e-08,3.5701,1.1301e-10,155,3.0797e-07,35.707,2.0707e-09,27.893,1.1041e-11,346.44,9.2635e-07,33.899,9.0551e-09,2.2824e+05,0.00069318,6408,1.6072e-05,43501,8.3483e-05,9.7783,3.6554e-12,1352.3,3.3631e-06,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
4.7388,0.25007,6.2748e+05,0.0010242,0.0010001,0.1,1097.8,2.2836e-06,14814,4.6593e-05,11.417,4.0105e-12,4607.6,1.187e-05,78.158,7.6989e-08,44674,0.00012928,3.3552,1.1102e-10,9.4321e+06,0.0016458,282.38,4.356e-07,36.497,8.008e-09,26.228,1.1511e-11,32.377,1.9328e-09,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1

To read over file:
1. read file as string
2. split into array of lines
3. loop over contents of each line:
4. if all vals are 1 then this pole set wasn't calculated
5. else parse as poleset
6. add line number (number of poles to an array of available_poles)
4. first val is const_permittivity(permittivity as freq approaches infinity) of tissue, second is const_conductivity(static ionic conductivity)
5. remaining values make up pole variables (2 for each number)
*/
function parseKrewerFile(name){
	var data = fs.readFileSync("data/krewer/"+name+"/DebyePolesBest.csv").toString().split('\n'),
		current_line = [],
		current_pole_set = 0,
		poles_available = [],
		pole_set = [],
		pole_sets = [];


	for (var i = 1; i < data.length - 1;i++){
		//check if it is a pole set or empty line
		if(data[i] == "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1") {
			console.log("no pole set for "+i);
			continue;//move on to next itteration
		}
		//prepare line etnry to extract pole sets and constants
		current_line = data[i].split(",");
		pole_set = [];
		current_pole_set = i+1;
		poles_available.push(current_pole_set);
		//pole_set x will have x sets of pole coefficients, 2 vals in each set, starting in the current_line array at index 2
		for(var j = 0; j < current_pole_set;j ++){
			pole_set[j] = {
				dp: current_line[(j*2)+2],
				dc: current_line[(j*2)+3]
			};
		}
		pole_sets[current_pole_set] = {
			const_p: current_line[0],
			const_c: current_line[1],
			pole_sets: pole_set
		};
	}	
	return {
		name: name,
		poles_available: poles_available,
		pole_sets: pole_sets
	};
}

//exit the script
function exit(){
	process.exit(code=0);
};








//Actually call the above functions:
findKrewerFiles(exit);
