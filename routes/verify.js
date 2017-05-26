var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var User = require('../models/user');

// Get Homepage
router.get('/', function(req, res){
	res.render('verify');
});

//Gets the submitted token, finds user with token, checks if token is valid, if valid set 'verified' to true in user model
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'GET: Email verification token is invalid or has expired.');
      return res.redirect('/verify');
    }
    console.log('User: ' + user.email + ' found with verification token');
    user.verified = true;
  });
});

//START: Sent verification token
router.post('/', function(req, res, next) {
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
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    //Logs in to gmail via nodemailer using SMTP and sends the email containing the reset token
    //TODO: use a configuration file (added to .gitignore) and add the file to the server manually. 
    function(token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'medicalid17@gmail.com',
            pass: 'enterpasswordhere'
        }
        });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@medid.herokuapp.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this email because you (or someone else) need to verify the email adress used for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
           'http://'+req.headers.host + '/verify/' + token + '\n\n' +
          'If you did not request this, please ignore this email and this email adress will not be verified.\n'
      };
      
      transporter.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
      req.flash('success_msg', 'An e-mail has been sent to you');
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
    req.flash('error_msg', 'Error');
  });
});
//END: send reset token

module.exports = router;
