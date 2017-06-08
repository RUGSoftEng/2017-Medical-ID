var express = require('express');
var router = express.Router();
var User = require('../models/user');
var qrcode = require('qrcode-js');
var sharp = require('sharp');
var baseURL = 'https://medid.herokuapp.com';

/* Retrieves user input from client, stores it. */
router.post('/fields', function(req, res){
	if (req.user) {
		fields = [];
		for (i = 0; i < req.body.fields.length; i++) {
			fields.push({
				label: req.body.fields[i].label.substring(0,30),
				field: req.body.fields[i].field.substring(0,200),
				inprofile: (req.body.fields[i].inprofile ? true : false)
			});
		}
		req.user.fields = fields;
		req.user.cardNum = req.body.cardNum;
		User.updateUser(req.user, function(err){
			if(err) throw err;
		});
		res.json({status: "success"});
	}
	else {
		res.json({status: "not authenticated"});
	}
});

/* Returns user fields to client. */
router.get('/fields', function(req, res) {
	if (req.user) {
		res.json({fields: req.user.fields, cardNum: req.user.cardNum});
	} else {
		res.sendFile('json/guestDocument.json', {root: __dirname + '/../public/'});
	}
});

/* Returns medid code, including QR-code to client. */
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
