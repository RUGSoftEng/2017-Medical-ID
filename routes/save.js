var express = require('express');
var router = express.Router();
var User = require('../models/user');

//TODO: test the data in req.body before using it

router.post('/card', function(req, res){
	req.user.card = req.body;
	User.updateUser(req.user.username, req.user, function(err){
		// needs improvement
		if(err) throw err;
	});
	// req.flash('success_msg', 'Data successfully stored');
	// console.log(req.user); // for testing
	res.end();
});

router.post('/document', function(req, res){
	req.user.document = req.body;
	User.updateUser(req.user.username, req.user, function(err){
		// needs improvement
		if(err) throw err;
	});
	// req.flash('success_msg', 'Data successfully stored');
	console.log(req.user); // for testing
	res.json({status: "success"});
});

router.get('/document', function(req, res) {
	if (req.user) {
		console.log(req.user.document);
		res.json(req.user.document);
	} else {
		res.sendFile('json/guestDocument.json', {root: __dirname + '/../public/'});
	}
});

router.get('/card', function(req, res) {
	if (req.user) {
		if (req.user.card.length > 0) {
			res.json(req.user.card);
		} else {
			res.sendFile('json/guestCard.json', {root: __dirname + '/../public/'});
		}
	} else {
		res.sendFile('json/guestCard.json', {root: __dirname + '/../public/'});
	}
});

module.exports = router;
