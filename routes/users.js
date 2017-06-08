var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var algorithm = 'aes256';

var User = require('../models/user');

var bcrypt = require('bcryptjs');
var async = require('async');
var nodemailer = require('nodemailer');

/*Routing related to user account, profile, registering, user code*/

/*Display login page*/
router.get('/login', function(req, res){
	res.render('login');
});

/*Renew code linked to profile*/
router.get('/newcode', function(req, res) {
	if (req.user) {
		req.user.code = genCode();
		updateUserCode(req, res);
	}
});

/*Register user: send user info to server, store user in database*/
router.post("/register", function(req,res, next){
	var name = req.body.name;
	var email = req.body.email.toLowerCase();
	var password = req.body.password;
	var password2 = req.body.password2;
	validateRegisterDetails(req);

	var errors = req.validationErrors();
	
	if(errors){
		res.render('login',{ errors: errors });
	} else {
		var newUser = new User({
			name: name,
			email: email,
			password: password,
			code: genCode(),
			verified: false,
			cardNum: 7,
			picture: "img/placeholder.png",
			fields: [
				{"label": "Name", "field": name, "inprofile": true},
				{"label": "Date of Birth", "field": "", "inprofile": true},
				{"label": "Blood type", "field": "", "inprofile": true},
				{"label": "Donor", "field": "", "inprofile": true},
				{"label": "Insurance", "field": "", "inprofile": true}
			]
		});
		createUser(req, res, newUser);
		console.log(newUser.email+' created');
		
		// send new user an email to verify their email address
		async.waterfall([
			function(done) {
			  crypto.randomBytes(20, function(err, buf) {
			//Generate our reset token	
				var token = buf.toString('hex');
				done(err, token);
			  });
			},
			//Find user with email, save token value and expiry time:
			function(token, done) {
				newUser.resetPasswordToken = token;
				newUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

				newUser.save(function(err) {
				  done(err, token, newUser);
				});
			},
			//Logs in to gmail via nodemailer using SMTP and sends the email containing the reset token
			//TODO: use a configuration file (added to .gitignore) and add the file to the server manually. 
			function(token, newUser, done) {
			  var transporter = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'medicalid17@gmail.com',
					pass: 'enterpasswordhere'
				}
				});
			  var mailOptions = {
				to: newUser.email,
				from: 'passwordreset@medid.herokuapp.com',
				subject: 'Node.js Verify email',
				text: 'You are receiving this email because you (or someone else) need to verify the email adress used for your account.\n\n' +
				  'To verify your account please click on the <a href="http://'+req.headers.host + '/verify/' + token +'">link</a>' + '\n\n' +			
					'If the link does not work paste the token:\n'
					+ token+ '\n\n'+
				  'If you did not request this, please ignore this email and this email adress will not be verified.\n'
			  };
			  
			  transporter.sendMail(mailOptions, function(err) {
				req.flash('info', 'An e-mail has been sent to ' + newUser.email + ' with further instructions.');
				done(err, 'done');
			  });
			  req.flash('success_msg', 'A verification e-mail has been sent to you');
			}
		  ]);
	}
});

/*Flashes an error message to the user if some piece of information is invalid*/
function validateRegisterDetails(req) {
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
}

/*Passport methods authenticate users by email and password*/
passport.use(new LocalStrategy({passReqToCallback: true},
  function(req, email, password, done) {
   User.getUserByEmail(email.toLowerCase(), function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, req.flash('error_msg', 'Unknown user'));
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, req.flash('error_msg', 'Invalid password'));
   		}
   	});
   });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  	passport.authenticate('local', {successRedirect:'/create', failureRedirect:'/login',failureFlash: true}),
  	function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/login');
});

function genCode() {
	var LENGTH = 12;
	var ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var result = '';
  	for (var i = LENGTH; i > 0; --i) result += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  	return result;
}

/*Creates new user in database, displays error if email is not unique, regenerates code if not unique*/
function createUser(req, res, newUser){
	User.createUser(newUser, function(err, user) {
		if (err && err.errors) {
			if (err.errors.email && err.errors.email.kind == 'unique') {
				req.flash('error_msg', 'Email address is already in use');
			} else if (err.errors.code && err.errors.email.kind == 'unique') {
				newUser.code = genCode();
				createUser(req, res, newUser);
			} else {
				throw err;
			}
		} else {
			req.flash('success_msg', 'You are registered and can now login');
		}
		res.redirect('/login');
	});
}

/*Regenerates code upon request from user, tries again if code already exists in database*/
function updateUserCode(req, res){
	User.updateUser(req.user, function(err) {
		if (err && err.errors) {
			if (err.errors.code && err.errors.code.kind == 'unique') {
				req.user.code = genCode();
				updateUserCode(req, res);
			} else {
				throw err;
			}
		}
		req.flash('success_msg', "Your personal code is now updated. All old references to your profile, including your cards, are now deprecated and will no longer work.");
		res.redirect('/create');
	});
}

module.exports = router;
