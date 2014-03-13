
/*
NodeJS server application for OpenShift using express
*/
self 					= this;
express 			= require('express');
app 					= express();
debug 				= require('debug')('http');
fs 						= require('fs');
http 					= require('http');
path 					= require('path');
router 				= require('./routes');
exporter 			= require('./routes/export.js');
importer			= require('./routes/import.js');
mongoose 			= require('mongoose');
AdmZip 				= require('adm-zip');
companion 		= require('companion');
Complex 			= companion.require('./libs/complex.js').Complex;
mysql 				= require('mysql');
nodemailer 		= require('nodemailer');

/*
Environment Variables
*/
var mongo_connect_string = 'mongodb://localhost/test';


//running on OpenShift?
if("OPENSHIFT_NODEJS_IP" in process.env){
	app.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
	app.port      = process.env.OPENSHIFT_NODEJS_PORT;
	mongo_connect_string = 'mongodb://' + 
		process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' + 
		process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' +
		process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
		process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
		process.env.OPENSHIFT_APP_NAME;
}
else {
	//otherwise assume running locally in test environment
	app.ipaddress = "127.0.0.1";
	app.port = "3000";


	mySQLConnection = mysql.createConnection({
	  host     : '127.0.0.1',
	  port 		 : '3306',
	  user     : 'root',
	  password : 'mm,.kim.,m.jkk'
	});
}

//connect to mongo db depending on environment
mongoose.connect(mongo_connect_string, function(err) {
	console.log(err);
    if (err) console.log("error connecting to mongo \n",err);
});	

//connect to mysql db
mySQLConnection.connect(function(err) {
	if (err)	console.log("error connecting to mysql \n",err);
});

/*
Define Middlewares
*/

//DON'T PLACE ANY APP.USE CALLS ABOVE COMPRESS.

//send static data compressed with gzip.
app.use(express.compress());

//serve static files from the public directory (relative to the current directory by using the '__dirname' var)
//the '{ maxAge: 86400000 }' part sets the client to cache static content for up to one day (or 86400000ms)
app.use('/static', express.static(__dirname + '/static', { maxAge: 86400000 }));
app.use('/views', express.static(__dirname + '/views', { maxAge: 86400000 }));


//parses the post body of requests into request.body 
app.use(express.bodyParser());

//allows using PUT and DELETE along with GET and POST requests
app.use(express.methodOverride());

//allows defining of routes and routing variables
app.use(app.router);


/*
* Define routes
*/


//fyp routes
app.get('/', router.homepage)
app.get('/pages/repo/:name', router.partials_repo);
app.get('/pages/other1/:name', router.partials_other1);
app.get('/pages/:name', router.partials);
//api functions 
app.post('/api/export/:format', exporter.main);
app.post('/api/upload/:method', importer.upload);
app.get('/api/:controller/:method', router.api);
app.get('/*', router.homepage);


/*
*	run server
*/
app.listen(app.port,app.ipaddress);	

