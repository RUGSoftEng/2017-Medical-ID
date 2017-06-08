var express = require('express');
var router = require('./users')

/*Get homepage*/
router.get('/', function(req, res){
	res.render('index');
});

router.get('/about', function (req, res){
	res.render('about');
});

router.get('/FAQ', function (req, res){
	res.render('FAQ');
});

router.get('/copyright', function (req, res){
	res.render('copyright');
});

router.get('/contact', function (req, res){
	res.render('contact');
});

module.exports = router;
