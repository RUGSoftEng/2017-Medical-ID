var express = require('express');
var router = express.Router();
var User = require('../models/user');
var qrcode = require('qrcode-js');
var sharp = require('sharp');
var baseURL = 'https://medid.herokuapp.com';

//TODO: test the data in req.body before using it

/* Old routes
router.post('/card', function(req, res){
	req.user.card = req.body;
	User.updateUser(req.user.username, req.user, function(err){
		// needs improvement
		if(err) throw err;
	});
	// req.flash('success_msg', 'Data successfully stored');
	res.json({status: "success"});
});

router.post('/document', function(req, res){
	req.user.document = req.body;
	User.updateUser(req.user.username, req.user, function(err){
		// needs improvement
		if(err) throw err;
	});
	// req.flash('success_msg', 'Data successfully stored');
	res.json({status: "success"});
});

router.get('/document', function(req, res) {
	if (req.user) {
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
*/

/* Current routes */

router.post('/fields', function(req, res){
	if (req.user) {
		req.user.fields = req.body;
		User.updateUser(req.user, function(err){
			if(err) throw err;
		});
		res.json({status: "success"});
	}
	else {
		res.json({status: "not authenticated"});
	}
});

router.get('/fields', function(req, res) {
	if (req.user) {
		res.json(req.user.fields);
	} else {
		res.sendFile('json/guestDocument.json', {root: __dirname + '/../public/'});
	}
});

router.get('/code', function(req, res) {
	if (req.user) {
		url = baseURL + '/profile?code=' + req.user.code;
	} else {
		url = baseURL + '/users/register';
	}
	dataString = qrcode.toBase64(url, 4);
	image = sharp(Buffer.from(dataString, 'base64')).jpeg().toBuffer(function(err, data, info) {
		var qr = 'data:image/jpeg;base64,' + data.toString('base64');
		var code = (req.user ? req.user.code : false);
		res.json({code: code, qr: qr})
	});
});

module.exports = router;
