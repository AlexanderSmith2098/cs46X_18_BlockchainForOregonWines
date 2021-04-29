const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;


const custUserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	address: {
		type: String,
		required: true,
	},
	firstname: {
		type: String,
		required: true,
	},
	lastname: {
		type: String,
		required: true,
	},
	city: {
		type: String,
		required: true,
	},
	zip: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
	},
	state: {
		type: String,
		required: true,
	},
});

custUserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('custUser', custUserSchema);