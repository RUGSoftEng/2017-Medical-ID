var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var User = require('../models/user');
var transporter = require('../emailConfig');
var config = require('../config')

// Get Homepage
router.get('/', function (req, res) {
    res.render('verify');
});

//Gets the submitted token, finds user with token, checks if token is valid, if valid set 'verified' to true in user model
router.get('/:token', function (req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function (err, user) {
        if (!user) {
            req.flash('error', 'Email verification token is invalid or has expired.');
            res.redirect('/verify');
        } else {
            user.verified = true;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function (err) {
                if (err) {
                    res.send(err);
                } else {
                    console.log('from get(/:token) ' + user.email + ' is verified: ' + user.verified);
                    req.flash('success_msg', 'Email verified. You can now log in');
                    res.redirect('/login');
                }
            });   
        }
    });
});

router.post('/', function (req, res) {
    async.waterfall([
    function (done) {
        User.findOne({
            resetPasswordToken: req.body.token
        }, function (err, user) {
            if (!user) {
                req.flash('error', 'Password reset token is invalid.');
                console.log('ERROR token ' + req.params.token + ' was not found')
                res.redirect('back');
            } else if (Date.now() > user.resetPasswordExpires) {
                req.flash('error', 'The password reset token expired.');
                res.redirect('back');
            } else {
                user.verified = true;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                console.log('User ' + user.email + ' verified:' + user.verified)

                user.save(function (err) {
                    req.logIn(user, function (err) {
                        done(err, user);
                    });
                });
            }
        });
    },
    function (user, done) {
        var mailOptions = {
            to: user.email,
            subject: 'Medical ID: Your account has been verified',
            template: 'verificationconfirm-email',
            context: {
                name: user.name,
                useremail: user.email
            }
        };
        transporter.sendMail(mailOptions, function (err) {
            done(err);
        });
    }
  ], function (err) {
        if(err) {
            res.send(err);
        } else {
            req.flash('success', 'Success! Your account has been verified.');
            res.redirect('/');
        }
    });
});

module.exports = router;
