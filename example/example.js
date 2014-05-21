var express = require('express'),
	app = express(),
	twilio = require('twilio'),
	twilioSessions = require('./')
	bodyParser = require('body-parser');

app.use(bodyParser());

app.use("/twilio",twilioSessions({ mongoURI: 'mongodb://localhost/twilioSessionExample'}));

app.post("/twilio",function(req,res,next) {
	console.log(req.phone)
	if(!req.phone.messages) {
		req.phone.messages = [req.body.Body];
	} else {
		req.phone.messages.push(req.body.Body);
	}

	console.log(req.phone.messages);

	var resp = new twilio.TwimlResponse();
	resp.say('You said' + req.body.Body);
	res.type('text/xml');
	res.send(resp.toString());
})

app.listen(8000);