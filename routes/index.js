var express = require('express');
var router = require('./users')

/*Get homepage*/
router.get('/', function(req, res){
	res.render('index');
});

module.exports = router;
