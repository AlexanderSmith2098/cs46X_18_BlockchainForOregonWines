const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;


const custUserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    privateKey: String
});

custUserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('custUser', custUserSchema);