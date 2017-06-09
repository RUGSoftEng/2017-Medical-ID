var express = require('express');
var router = require('./users')

/*Get homepage*/
router.get('/', function(req, res){
	res.render('index', {
		page: "Home",
		include: {
			js: ['medid/hyphenator']
		}});
});

router.get('/about', function (req, res){
	res.render('info/about', {page: "About"});
});

router.get('/FAQ', function (req, res){
	res.render('info/FAQ', {page: "FAQ"});
});

router.get('/terms', function (req, res){
	res.render('info/terms', {page: "Terms"});
});

router.get('/contact', function (req, res){
	res.render('info/contact', {page: "Contact"});
});

module.exports = router;
