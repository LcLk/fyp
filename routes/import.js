exports.upload = function(req, res){
	console.log("upload called");
	console.log(req.body);
	console.log(req.files);
	var lines = fs.readFileSync(req.files.file.path).toString().split('\n');
	for(var i =0; i < lines.length;i++)
		lines[i] = lines[i].split(",");
	var data = {lines: lines};
	//TODO parse received data and create sample file;
	//sendMail(req.body.address,"sampleKey");
	res.json({parsed_data: data});
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
exports.resend = function(req,res){
	console.log("resending email");
	sendMail(req.body.address,"sample key");f
};


function sendMail(address,key){
	var smtpTransport = nodemailer.createTransport('SMTP', {
											service: 'Gmail',
											auth: {
												user: "nuigrepository@gmail.com",
												pass: "nnm,jun,mn,hjjrrty5,rytry455"
											}
	});
	var mailOptions = {
		from: "Liam Krewer <nuigrepository@gmail.com>",
		to: address,
		subject: 'NUIG Repository Conversion',
		text: "Hello,"+
			"\n You have requested the conversion of a Cole-Cole model to a Debye model via " +
			"the website NUIG Dielectrics repository at http://fyp.liam.krewer.me/repo/conversion." +
			"\nIf you have indeed requested this you will need to enter the key below into the page " +
			"to begin the conversion process.\n This is needed as we have limited resources and the conversion " +
			"is a lengthy process so we won't kick it off unless we have your valid and typo-free email to " +
			"send the result to. The conversion can take between 2hrs and 3 days depending on the number of " +
			"poles selected.\n\n    Your passskey is: "+ key +"\n\n" +
			"If you have any queries feel free to email liam.krewer@gmail.com.\n" +
			"Thanks for using our service \n" +
			"-Liam"
	};
	smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }
  });
}
