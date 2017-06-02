var express = require('express');
var router = express.Router();
var validator = require("email-validator");
var User = require('../models/user');

/*Renders different page based on if user is logged in or not*/
router.get('/', function(req, res){
	if (req.user) {
		req.user.hyphenedCode = insertHyphen(req.user.code);
		res.render('create/create');
	} else {
		res.render('create/guestcreate');
	}
});

/*Updates user data if new info is inserted to fields*/
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

/*Inserts dash between every third character of a string*/
function insertHyphen(string) {
	if (string.length > 3) {
		return string.slice(0, 3) + "-" + insertHyphen(string.slice(3));
	} else {
		return string;
	}
}

module.exports = router;
