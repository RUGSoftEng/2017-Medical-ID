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
    res.render('forgot');
});

//Gets the submitted token, finds user with token, checks if token is valid, if valid promt to reset pw
router.get('/reset/:token', function (req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function (err, user) {
        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            res.redirect('/forgot');
        } else {
            console.log('User: ' + user.email + ' found with reset token');
            res.render('reset', {
                user: req.user
            });
        }
    });
});


//Send reset token
router.post('/', function (req, res, next) {
    async.waterfall([
        // Generate the token
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                //Generate our reset token  
                var token = buf.toString('hex');
                done(err, token);
            });
        },

        // Find user with email, save token value and expiry time:
        function (token, done) {
            User.findOne({
                email: req.body.email
            }, function (err, user) {
                if (!user) {
                    req.flash('error_msg', 'No account with that email address exists.');
                    res.redirect('/forgot');
                } else {
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function (err) {
                        done(err, token, user);
                    });   
                }
            });
        },

        // Send email to user with reset link
        function (token, user, done) {
            var mailOptions = {
                to: user.email,
                subject: 'Medical ID: Password Reset',
                template: 'forgotpass-email',
                context: {
                    name: user.name,
                    host: req.headers.host,
                    token: token
                }
            };

            transporter.sendMail(mailOptions, function (err) {
                done(err);
            });
        }
    ], function (err) {
        if (err) {
            res.send(err);
        } else {
            req.flash('success_msg', 'An e-mail has been sent to you with further instructions');
            res.redirect('/login');
        }
    });
});


//Set new password
router.post('/reset/:token', function (req, res) {
    async.waterfall([
        // Check user token is valid
        function (done) {
            User.findOne({
                resetPasswordToken: req.params.token
            }, function (err, user) {
                if (!user) {
                    req.flash('error_msg', 'Password reset token is invalid.');
                    res.redirect('back');
                } else if (Date.now() > user.resetPasswordExpires) {
                    req.flash('error_msg', 'The password reset token expired.');
                    res.redirect('back');
                } else {
                    done(err, user);   
                }
            });
        },
        
        // Set the new password and set token to undefined
        function(user, done){
            user.password = bcrypt.hashSync(req.body.password, 10);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
			if(!user.verified)			
				user.verified = true;
            
            console.log('Changed user ' + user.email + ' password')
            
            user.save(function (err) {
                req.logIn(user, function (err) {
                    done(err, user);
                });
            });
        },
        
        // Send confirmation email to user
        function (user, done) {
            var mailOptions = {
                to: user.email,
                subject: 'Medical ID: Your password has been changed',
                template: 'forgotpassconfirm-email',
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
            req.flash('success_msg', 'Success! Your password has been changed.');
            res.redirect('/');
        }
    });
});

module.exports = router;
