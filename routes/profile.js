var express = require('express');
var router = express.Router();

var User = require('../models/user');

router.get('/', function(req,res){
	if (req.query.code) {
		var code = req.query.code.replace(/[^0-9a-zA-Z]/gi, '');
	}
	if(code) {
		User.getUserByCode(code, function(err,user){
			if(!user){
                req.flash('error_msg', 'No user found');
                res.redirect('/');
            } else if(err){
                req.flash('error_msg', 'Error encountered, please try again');
                res.redirect('/');
			} else{
                res.render('profile',{
				    displayUser: user
                });
            }
		});
	} else {
	    req.flash('error_msg', 'Please enter a code');
	    res.redirect('/');
    }
});

module.exports = router;
