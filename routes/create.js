var express = require('express');
var router = express.Router();
var User = require('../models/user');


router.get('/', function(req, res){
	if (req.user) {
		res.render('create/create');
	} else {
		res.render('create/guestcreate');
	}
});

router.post('/settings', function(req, res) {
	if (req.user) {
		/* We need input checking here as well */
		req.user.name = req.body.name;
		req.user.email = req.body.mail;
		req.user.cardNum = req.body.cardNum;
		req.user.picture = req.body.picture;
		User.updateUser(req.user.username, req.user, function(err){
			if(err) throw err;
		});
		res.json({status: "success"});
	} else {
		res.json({status: "not authenticated"});
	}
});

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
