var express = require('express');
var router = express.Router();

var User = require('../models/user');

router.get('/', function(req,res){
	var id = req.query.id;
	if(id){
		User.getUserById(id, function(err,user){
			if(err){
				res.send(err);
			}
			
			res.render('profile',{
				displayUser: user
			});
		});
	}
});

module.exports = router;