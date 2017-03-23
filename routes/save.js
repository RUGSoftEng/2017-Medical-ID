var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.post('/card', function(req, res){
	if (req.body.card)
	{
		req.user.card = req.body.card;
		User.updateUser(req.user.username, req.user, function(err){
			// needs improvement
			if(err) throw err;
		});
		req.flash('success_msg', 'Data successfully stored');
	}
	else
	{
		req.flash('failure_msg', 'Storing process failure, try again');
	}
	console.log(req.user);
	res.end();
});

router.post('/document', function(req, res){
	console.log(req.body);
});

module.exports = router;