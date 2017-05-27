var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var User = require('../models/user');
var config = require('../config')

// Get Homepage
router.get('/', function(req, res){
	res.render('verify');
});

//Gets the submitted token, finds user with token, checks if token is valid, if valid set 'verified' to true in user model
router.get('/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'GET: Email verification token is invalid or has expired.');
      return res.redirect('/verify');
    }

    user.verified = true;
    console.log(user.email + ' is verified? '+user.verified);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    req.flash('Email verified');
    return res.redirect('/create');
  });
});

router.post('/', function(req, res) {
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

        user.verified = true;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        console.log('User ' + user.email + ' verified:'+user.verified)

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
            user: config.username,
            pass: config.password
        }
        });
      var mailOptions = {
        to: user.email,
        from: 'noreply@medid.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that your account ' + user.email + ' has just been verified.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your Accont has been verified.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

module.exports = router;
