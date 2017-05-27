var express = require('express');
var router = express.Router();
var validator = require("email-validator");
var User = require('../models/user');


router.get('/', function(req, res){
	if (req.user) {
		if(!req.user.verified){
	    		res.redirect('/verify')
			console.log('Profile: User ' + req.user.email + ' verified: '+req.user.verified)
		}else {
			req.user.hyphenedCode = insertHyphen(req.user.code);
			res.render('create/create');
		}
	} else {
		res.render('create/guestcreate');
	}
});

router.post('/settings', function(req, res) {
	if (req.user) {
		/* We need input checking here as well */
		req.user.name = req.body.name;
		req.user.cardNum = Math.min(Math.max(req.body.cardNum, 1), 7);
		req.user.picture = req.body.picture;
		User.updateUser(req.user, function(err) {
			if (err) {
				throw err;
			}
			else {
				res.json({status: "success"});
			}
		});
	} else {
		res.json({status: "not authenticated"});
	}
});

function insertHyphen(string) {
	if (string.length > 3) {
		return string.slice(0, 3) + "-" + insertHyphen(string.slice(3));
	} else {
		return string;
	}
}

/*
router.get('/card', function(req, res){
	res.locals.card = true;
	res.render('create/card');
});

router.get('/document', function(req, res){
	res.locals.doc = true;
	res.render('create/document');
});*/

module.exports = router;
