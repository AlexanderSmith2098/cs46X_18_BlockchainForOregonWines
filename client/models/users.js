// This is the schema for the user class.  This application uses mongodb to to store user data and run its authentication/authorization system.
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    privateKey: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);