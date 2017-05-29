var request = require('request');
var mongoose = require('mongoose');
var serverSettings = require('../serverSettings.js');

serverSettings.parameters.db = 'mongodb://localhost/loginapp';

serverSettings.parameters.test = function(req, res, next){
	req.flash = function(type, msg){
		this.flashMsg = type + ": " + msg;
	};
	res.req = req;
	res.oldRender = res.render;
	res.oldRedirect = res.redirect;
	res.redirect = function(msg){
		app.testCallback(msg, res.req.flashMsg);
		this.oldRedirect(msg);
	};
	next();
};

var serverApp = require('../app');
var app = serverApp.app;
var server = serverApp.server;

app.testCallback = function(msg, flashMsg){
	//console.log(msg, flashMsg);
}

var address = "http://localhost:" + app.get('port');
/*
request(
	{
	    url: address + "/register",
	    method: "POST",
	    json: true,
	    body: {
	    	'name': 'a',
	    	'email': 'a@b.com',
	    	'password': 'a',
	    	'password2': 'a'
	    }
	}, function (error, response, body){
    	console.log(response);
    	server.close();
    	mongoose.disconnect();
	}
);
*/

//request.defaults({'jar': true});

var cookieJar = request.jar();
console.log("before: ", cookieJar._jar.store.idx);
request(
	{
	    url: address + "/login",
	    jar: cookieJar,
	    method: "POST",
	    json: true,
	    body: {
	    	'username': 'a@b.com',
	    	'password': 'a'
	    }
	}, function (error, response, body){
    	request(
			{
			    url: address + "/save/fields",
	    		jar: cookieJar,
			    method: "GET",
			    json: true
			}, function (error, response, body){
		    	console.log(body);
		    	console.log("after: ", cookieJar._jar.store.idx);
			}
		);
	}
);
/*
request(
	{
	    url: address + "/create",
	    method: "GET",
	    json: true,
	    body: ''
	}, function (error, response, body){
    	//console.log(error, response);
	}
);
*/