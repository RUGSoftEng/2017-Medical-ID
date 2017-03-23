var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
	res.render('create/create');
});

router.get('/card', function(req, res){
	res.locals.card = true;
	res.render('create/card');
});

router.get('/document', function(req, res){
	res.locals.doc = true;
	res.render('create/document');
});

module.exports = router;
