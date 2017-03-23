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
	req.flash('success_msg', 'Data successfully stored');
	console.log(req.user); // for testing
	res.end();
});

router.post('/document', function(req, res){
	req.user.document = req.body;
	User.updateUser(req.user.username, req.user, function(err){
		// needs improvement
		if(err) throw err;
	});
	req.flash('success_msg', 'Data successfully stored');
	console.log(req.user); // for testing
	res.end();
});

module.exports = router;