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

module.exports = router;
