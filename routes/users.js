var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var algorithm = 'aes256';

var User = require('../models/user');

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Register User
router.post("/register", function(req,res){
	var name = req.body.name;
	var email = req.body.email.toLowerCase();
	var username = req.body.username.toLowerCase();
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{ errors: errors });
	} else{
		User.checkExists(username, email, function(err,user){
			if(err) throw err;

			if(user){
				if(user.username === username){
					req.flash('error_msg', 'Username is already in use ');
				}
				if(user.email === email) {
					req.flash('error_msg', 'Email address is already in use');
				}
				res.redirect('/users/register');
			} else{
				var seed = crypto.randomBytes(32).toString('hex');
				var code = crypto.randomBytes(9).toString('base64');
				//username = crypto.createHash('sha256').update(username).digest('hex');
				var newUser = new User({
					name: encrypt(name, seed),
					email: email,
					username: username,
					password: password,
					seed: seed,
					code: code,
					card: [],
					document: []
				});

				User.createUser(newUser, function(err, user){
					if(err) throw err;
					console.log(user);
				});

				req.flash('success_msg', 'You are registered and can now login');
				res.redirect('/users/login');
			}
		});
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   //username = crypto.createHash('sha256').update(username.toLowerCase()).digest('hex');
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

function encrypt(text, key){
  var cipher = crypto.createCipher(algorithm, key)
  var encrypted = cipher.update(text,'utf8','hex') + cipher.final('hex');
  return encrypted;
}
 
function decrypt(text, key){
  var decipher = crypto.createDecipher(algorithm, key)
  var decrypted = decipher.update(text,'hex','utf8') + decipher.final('utf8');
  return decrypted;
}

module.exports = router;