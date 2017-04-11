var express = require('express');
var router = express.Router();
var User = require('../models/user');
var qrcode = require('qrcode-js');
var sharp = require('sharp');
var baseURL = 'https://medid.herokuapp.com';

//TODO: test the data in req.body before using it

router.post('/card', function(req, res){
	req.user.card = req.body;
	User.updateUser(req.user.username, req.user, function(err){
		// needs improvement
		if(err) throw err;
	});
	// req.flash('success_msg', 'Data successfully stored');
	// console.log(req.user); // for testing
	res.json({status: "success"});
});

router.post('/document', function(req, res){
	req.user.document = req.body;
	User.updateUser(req.user.username, req.user, function(err){
		// needs improvement
		if(err) throw err;
	});
	// req.flash('success_msg', 'Data successfully stored');
	// console.log(req.user); // for testing
	res.json({status: "success"});
});

router.get('/document', function(req, res) {
	if (req.user) {
		console.log(req.user.document);
		res.json(req.user.document);
	} else {
		res.sendFile('json/guestDocument.json', {root: __dirname + '/../public/'});
	}
});

router.get('/card', function(req, res) {
	if (req.user) {
		if (req.user.card.length > 0) {
			res.json(req.user.card);
		} else {
			res.sendFile('json/guestCard.json', {root: __dirname + '/../public/'});
		}
	} else {
		res.sendFile('json/guestCard.json', {root: __dirname + '/../public/'});
	}
});

router.get('/qr', function(req, res) {
	if (req.user) {
		url = baseURL + '/profile?id=' + req.user.id;
	} else {
		url = baseURL + '/users/register';
	}
	dataString = qrcode.toBase64(url, 4);
	image = sharp(Buffer.from(dataString, 'base64')).png().toBuffer(function(err, data, info) {
		res.send('data:image/png;base64,' + data.toString('base64'));
	});
});

module.exports = router;
