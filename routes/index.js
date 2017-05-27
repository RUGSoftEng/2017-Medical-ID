var express = require('express');
var router = express.Router();
var User = require('../models/user');

// Get Homepage
router.get('/', function(req, res){
	res.render('index');
});

module.exports = router;
