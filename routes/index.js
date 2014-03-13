
/*
 * GET home page.
 */
var models = require('./../models/models.js');
var Tissue= require('./../models/TissueModel.js');
var object = {};
req = {};
res = {};

exports.api = function(request,response){
	console.log("api called");
	req = request;
	res = response;
	switch(req.params.controller){
		case "tissuelist":
			getTissueList();
		break;
		case "gabriels":
			getGabriels();
		break;
		case "krewers":
			getKrewers();
		break;
		default:
		break;
	}
}




function getGabriels(){
	var tissues = [],
		ids = req.params.method.split(",");
	console.log("getting Gabriel tissues");
	models.Gabriel.find( {'_id': { $in: ids}})
					.exec( function(err,gabriels){
    	if(err){
    		console.log("error");
    		console.log(err);
		  	res.json(500, {data: null});
		  	res.end();		
    	}
    	else{
    		console.log("success");
    		console.log(gabriels);
		  	res.json(200, krewers);
		  	res.end();	
    	}
    });
}

function getKrewers(){
	var tissues = [],
		ids = req.params.method.split(",");
	console.log("getting Krewer tissues");
	models.Krewer.find( {'_id': { $in: ids}})
					.exec( function(err,krewers){
    	if(err){
    		console.log("error");
    		console.log(err);
		  	res.json(500, {data: null});
		  	res.end();		
    	}
    	else{
    		console.log("success");
    		console.log(krewers);
		  	res.json(200, krewers);
		  	res.end();	
    	}
    });
}


function getTissueList(){
	var tissues = [],
		thisone = {},
		keys = [],
		krewers_hash = {},
		gabriels_hash = {};
	console.log("getting tissues");
	models.Gabriel.find()
				//.select('name id poles_available')
				.sort('name')
				.exec( function(err,gabriels){
			    	if(err){
			    		console.log("error");
			    		console.log(err);
					  	res.json(500, {data: null});
					  	res.end();		
			    	}
			    	else{
			    		models.Krewer.find()
			    			//.select('name id poles_available')
							.sort('name')
							.exec( function(err,krewers){
						    	if(err){
						    		console.log("error");
						    		console.log(err);
								  	res.json(500, {data: null});
								  	res.end();		
						    	}
						    	else{
						    		//prep data as array to be sent

						    		//make a hash of the returned krewers array
						    		for(var i = 0; i < krewers.length;i++){
						    			krewers_hash[krewers[i].name] = krewers[i];
						    		}
						    		//make a hash of the returned krewers array
						    		for(var i = 0; i < gabriels.length;i++){
						    			gabriels_hash[gabriels[i].name] = gabriels[i];
						    		}
								  	res.json(200, {Krewer: krewers_hash, Gabriel: gabriels_hash});
								  	res.end();		
						    	}	
					    });
			    	}	
		    });
}













exports.homepage = function(req, res){
	console.log("home");
  res.sendfile('./views/index.html');
};

exports.partials = function (req, res) {
	console.log("partials");
  var name = req.params.name;
  console.log(name);
  res.sendfile('./views/partials/' + name +'.html');
};
exports.partials_repo = function (req, res) {
  console.log("repo");
  var name = req.params.name;
  console.log(name);
  res.sendfile('./views/partials/repo/' + name +'.html');
};

exports.partials_other1 = function (req, res) {
	console.log("other1");
  var name = req.params.name;
  console.log(name);
  res.sendfile('./views/partials/other1/' + name +'.html');
};

/*exports.api = function(req, res){
	console.log("api called");
	switch(req.params.controller){
		case "tissues":
			console.log("getting multiple tissues");
			console.log(req.params.method);
			var tissuelist = [],datalist=[],status=201,tissue="";
			tissuelist = req.params.method.split(',');
			function getNextTissue(list){
				tissue = list.pop();
				console.log("getting tissue "+ tissue);
				//get data
				Tissue.findOne({_id: tissue},function (err, Tissuebject) {
					console.log("returning from searching for "+tissue);
					if (err){
					  	console.log("error for "+tissue);
					  	status = 505;
						res.json(status, "error");
						res.end();			
					}
					else {
					  	console.log("read Tissue: "+Tissuebject.name+"\n");
					  	datalist.push(Tissuebject);
						if(list.length == 0){
							//send data
							console.log("sending data");
							console.log(datalist);
							res.json(status, {data: datalist});
							res.end();			
						}
						else{
							getNextTissue(list);
						}
					  		
					}
				});
			}
			getNextTissue(tissuelist);
			
		break;
		case "tissue":
			var data = {};
			var status = 200;
			Tissue.findOne({_id: req.params.method},function (err, Tissuebject) {
				if (err){
				  	console.log("error");
				  	status = 505;
				}
				else {
				  	console.log("\n\nread Tissue: "+Tissuebject+"\n\n");
					data = Tissuebject;
				}	
			  	res.json(200, {data: Tissuebject});
			  	res.end();		
			});
		break;
		case "tissuelist":
		//get list of Tissuenames and pole values
			console.log("Tissuelist");
			Tissue.find()
				.select('name id poles')
				.sort('name')
				.exec( function(err,obj){
			    	if(err){
			    		console.log("error");
			    		console.log(err);
					  	res.json(500, {data: null});
					  	res.end();		
			    	}
			    	else{
						console.log(obj);
					  	res.json(200, {data: obj});
					  	res.end();		
			    	}	
		    });
		break;
		case "upload":
			console.log("uploading");
			console.log(req);
		break;
		default:
		break;
	}
};
*/

exports.upload = function(req, res){
	console.log("upload called");
	switch(req.params.method){
		case "initial" :
			console.log(req);
		break;
		default:
		break;

	}
};

exports.download = function(req, res){
	console.log("upload called");
	switch(req.params.method){
		case "csv" :
			console.log(req.data);
			response.setHeader('Content-disposition', 'attachment; filename='+req.filename+'.csv');
    		response.writeHead(200, {'Content-Type': 'text/csv'});
			csv().from(req.data).to(res);
		break;
		default:
		break;

	}
};