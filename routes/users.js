var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var algorithm = 'aes256';

var User = require('../models/user');

// Login
router.get('/login', function(req, res){
	res.render('login');
});

router.get('/newcode', function(req, res) {
	if (req.user) {
		req.user.code = genCode();
		// this function is separated to allow handling code uniqueness errors
		updateUserCode(req, res);
	}
});

// Register User
router.post("/register", function(req,res){
	var name = req.body.name;
	var email = req.body.email.toLowerCase();
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('login',{ errors: errors });
	}
	else{
		var newUser = new User({
			name: name,
			email: email,
			password: password,
			code: genCode(),
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

		// this function is separated to allow handling code uniqueness errors
		createUser(req, res, newUser);
	}
});

passport.use(new LocalStrategy({
		passReqToCallback: true
	},
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

// attempts to create a new user entry into the database
function createUser(req, res, newUser){
	User.createUser(newUser, function(err, user) {
		if (err && err.errors) {
			if (err.errors.email && err.errors.email.kind == 'unique') {
				// Email is not unique
				req.flash('error_msg', 'Email address is already in use');
			} else if (err.errors.code && err.errors.email.kind == 'unique') {
				// Code is not unique
				newUser.code = genCode();
				createUser(req, res, newUser);
			} else {
				// Something else not unique (should be impossible)
				throw err
			}
		}
		else {
			req.flash('success_msg', 'You are registered and can now login');
		}

		res.redirect('/login');
	});
}

function updateUserCode(req, res){
	User.updateUser(req.user, function(err) {
		if (err && err.errors) {
			if (err.errors.code && err.errors.code.kind == 'unique') {
				// existing code, generate new one and try again
				req.user.code = genCode();
				updateUserCode(req, res);
			}
			else {
				// An unrelated error came up.
				throw err;
			}
		}

		req.flash('success_msg', "Your personal code is now updated. All old references to your profile, including your cards, are now deprecated and will no longer work.");
		res.redirect('/create');
	});
}

module.exports = router;
