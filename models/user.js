var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var uniqueValidator = require('mongoose-unique-validator');

/*User schema for database: defines user info
  cardNum = the card contains the first "cardNum" elements of "fields"*/
var UserSchema = mongoose.Schema({
	email: {
		type: String,
		index: true,
		unique: true
	},
	password: {
		type: String
	},
	code: {
		type: String,
		unique: true
	},
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date
	},
	verified: {
		type: Boolean
	},
	name: {
		type: String
	},
    cardNum: {
        type: Number
    },
    picture: {
        type: Buffer
    },
	fields: [{
		label: String,
		field: String,
		inprofile: Boolean
	}]
}, { versionKey: false });

/*apply the uniqueValidator plugin to UserSchema: pre save validation for unique fields */
UserSchema.plugin(uniqueValidator);

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByEmail = function(email, callback){
	var query = {email: email};
	User.findOne(query, callback);
}

module.exports.getUserByCode = function(code, callback){
	var query = {code: code};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}

/* this way of updating will execute validators */
module.exports.updateUser = function(update, callback){
	User.findById(update._id, function(err, user){
		if (err)
			throw err;

		user = update;
		user.save(callback);
	});
}
