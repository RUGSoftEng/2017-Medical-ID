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
	//console.log(req.user); // for testing
	res.end();
});

router.get('/document', function(req, res) {
	if (req.user) {
		var output = [];
		for (i = 0; i < req.user.document.length; i++) {
			output.push({label: req.user.document[i].label, field: req.user.document[i].field});
		}
		res.json(output);
	} else {
		res.status(403);
		res.send();
	}
});

router.get('/card', function(req, res) {
	if (req.user) {
		var output = [];
		for (i = 0; i < req.user.card.length; i++) {
			output.push({label: req.user.card[i].label, field: req.user.card[i].field});
		}
		res.json(output);
	} else {
		res.status(403);
		res.send();
	}
});

module.exports = router;
