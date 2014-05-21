var mongoose = require('mongoose'),
	colors = require('colors'),
	findOrCreate = require('mongoose-findorcreate');

var PhoneSchema = new mongoose.Schema({
	number:String,
	store:{type:Object,default:{}}
});

PhoneSchema.plugin(findOrCreate);

mongoose.model('phones',PhoneSchema);

module.exports = function(params) {


	if(mongoose.connection.readyState === 0) {
		if(!params.mongoURI) return console.log("Twilio Session needs a mongodb database. You haven't connected to one. You can also pass in `mongoURI` as a parameter if you want the library to connect for you.".red);
		mongoose.connect(params.mongoURI);
	}

	return function(req,res,next) {

		//if there is no From in the req  body, ignore
		if(!req.body.From) {
			return next();
		}

		mongoose.model('phones').findOrCreate({number:req.body.From},function(err,phone,created) {
			if(err) return next(err);

			//non-exposed phone object
			req.phone = phone.store;

			//after sending the response, save the state of the phone
			res.on('finish',function() {
				phone.markModified('store');
				phone.save();
			});

			next();
		});


	};
};