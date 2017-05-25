var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var User = require('../models/user');

// Get Homepage
router.get('/', function(req, res){
	res.render('forgot');
});

//Gets the submitted token, finds user with token, checks if token is valid, if valid promt to reset pw
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'GET: Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    console.log('User: ' + user.email + ' found with reset token');
    res.render('reset', {
      user: req.user
    });
  });
});


//START: Sent reset token
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
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
           'http://'+req.headers.host + '/forgot/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
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


//START: Set new password
//Checks if token is valid, sets and hashes new password, sets token and expiry fields to null, sends a confirmation email.
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token}, function(err, user) {
        if (!user){
          req.flash('error', 'POST: Password reset token is invalid.');
          console.log('ERROR token '+req.params.token+' was not found')
          return res.redirect('back');
        }

        if(Date.now()>user.resetPasswordExpires){
          req.flash('error', 'POST: The password reset token expired.');
          return res.redirect('back');
        }

        user.password = bcrypt.hashSync(req.body.password, 10); 
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        console.log('Changed user ' + user.email + ' password')

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });

      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'medicalid17@gmail.com',
            pass: 'enterpasswordhere'
        }
        });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@medid.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});
//END: set new password

module.exports = router;
