var express = require('express');
var router = require('./users')

/*Get homepage*/
router.get('/', function(req, res){
	res.render('index', {page: "Home"});
});

router.get('/about', function (req, res){
	res.render('about');
});

router.get('/FAQ', function (req, res){
	res.render('FAQ');
});

router.get('/terms', function (req, res){
	res.render('terms');
});

router.get('/contact', function (req, res){
	res.render('contact');
});

module.exports = router;
