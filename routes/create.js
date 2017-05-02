var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
	if (req.user) {
		res.render('create/create');
	} else {
		res.render('create/guestcreate');
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
