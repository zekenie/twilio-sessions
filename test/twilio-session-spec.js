var assert = require('assert'),
	request = require('supertest'),
	express = require('express'),
	uuid = require('node-uuid'),
	twilioSessions = require('..');

//define sample server behavior
var createServer = function(params) {
	var _twilioSessions = twilioSessions(params);
	var app = express();
	app.use(_twilioSessions);
	app.all("*",function(req,res) {
		if(req.phone) {
			if(req.phone.requests) {
				req.phone.requests.push(req.body);
			} else {
				req.phone.requests = [req.body];
			}
		}
		res.json(req.phone || {message:'no phone'});
	});
	return app;
}

describe("twilio sessions",function() {
	var server;
	before(function() {
		server = createServer({mongoURI:'mongodb://localhost/twilioSessionsTest'});
	});

	it("should return 'no phone' when req.body.From is absent",function() {
		request(server)
		.post('/')
		.set('Content-Type', 'application/x-www-form-urlencoded')
		.send()
		.expect(200,'{"message":"no phone"}');
	});

	describe('persistence',function() {
		var num = uuid.v1();
		it('should report the request body for one message',function() {
			request(server)
			.post('/')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send("From=" + num + "&Body=foo")
			.expect(200,'[{"From":"' + num + '", "Body":"foo"}]');
		});
		it('should persist a second value',function() {
			request(server)
			.post('/')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send("From=" + num + "&Body=foo")
			.expect(200,'[{"From":"' + num + '", "Body":"foo"},{"From":"' + num + '", "Body":"foo"}]');
		});
	});
});