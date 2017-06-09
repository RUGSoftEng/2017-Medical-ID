var express = require('express');
var router = express.Router();
var validator = require("email-validator");
var User = require('../models/user');

/*Renders different page based on if user is logged in or not*/
router.get('/', function(req, res){
	if (req.user) {
		req.user.hyphenedCode = insertHyphen(req.user.code);
		res.render('create/create', {page: "Profile"});
	} else {
		req.page = "Create";
		res.render('create/guestcreate', {
			page: "Create",
			include: {
				js: ['lib/jquery-ui.min', 'lib/jquery.ui.touch-punch', 'medid/util', 'medid/res', 'medid/hyphenator', 'lib/jspdf.min', 'lib/pdfmake.min', 'lib/vfs_fonts', 'medid/document', 'medid/card', 'medid/creator', 'medid/settings', 'medid/guestcreate']
			}});
	}
});

/*Updates user data if new info is inserted to fields*/
router.post('/settings', function(req, res) {
	if (req.user) {
		/* We need input checking here as well */
		req.user.name = req.body.name;
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
