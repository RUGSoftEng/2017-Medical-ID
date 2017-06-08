var assert = require('assert');
var cleanup = require('./cleanup');
var request = require('request');
var app = require('../app').app;

defaultFields = [
					{"label": "Name", "field": "a", "inprofile": true},
					{"label": "Date of Birth", "field": "", "inprofile": true},
					{"label": "Blood type", "field": "", "inprofile": true},
					{"label": "Donor", "field": "", "inprofile": true},
					{"label": "Insurance", "field": "", "inprofile": true}
				];

editedFields = [
					{"label": "Name", "field": "john", "inprofile": false},
					{"label": "Blood type", "field": "", "inprofile": true},
					{"label": "Donor", "field": "", "inprofile": true},
					{"label": "Phone", "field": "0123456789", "inprofile": false}
				];

var cookieJar = request.jar();

function login(email, pass, callback){
	request(
		{
		    url: "http://localhost:" + app.get('port') + "/login",
		    jar: cookieJar,
		    method: "POST",
		    json: true,
		    body: {
		    	'username': email,
		    	'password': pass
		    }
		}, callback
	);
}

function testLogout(callback){
	app.testCallback = callback;
	request({
	    url: "http://localhost:" + app.get('port') + "/logout",
	    jar: cookieJar,
	    method: "GET",
	    json: true
	});
}

function stripId(fields){
	for (var i = 0; i < fields.length; ++i)
		delete fields[i]._id;
}

function getFields(callback){
	request(
		{
		    url: "http://localhost:" + app.get('port') + "/save/fields",
    		jar: cookieJar,
		    method: "GET",
		    json: true
		}, function (error, response, body){
			stripId(body);
			callback(null, body);
		}
	);
}

function editFields(fields, callback)
{
	request(
		{
		    url: "http://localhost:" + app.get('port') + "/save/fields",
    		jar: cookieJar,
		    method: "POST",
		    json: true,
		    body: editedFields
		},
		callback
	);
}

module.exports = function(suite){
	suite.addBatch({
		'When a user is logged in': {
			topic: function(){
				login("a@b.com", "pass", this.callback);
			},
			'they receive a cookie': function () {
				cleanup.tryCleanup();
				assert.notDeepEqual(cookieJar._jar.store.idx, {});
			}
		}
	}).addBatch({
		'When a new user retrieves their data for the first time': {
			topic: function(){
				getFields(this.callback);
			},
			'they receive the default fields': function (fields) {
				cleanup.tryCleanup();
				assert.deepEqual(fields, defaultFields);
			}
		}
	}).addBatch({
		'When a user modifies their data': {
			topic: function(){
				var callback = this.callback;
				editFields(editedFields, function(){
					getFields(callback);
				});
			},
			'the data is updated in the system': function (fields) {
				cleanup.tryCleanup();
				assert.deepEqual(fields, editedFields);
			}
		}
	}).addBatch({
		'When a user tries to log out': {
			topic: function(){
				testLogout(this.callback);
			},
			'logged out, redirected to /login': function (resMsg, flashMsg) {
				cleanup.tryCleanup();
				cleanup.cleanCallback(app);
				assert.isString(resMsg);
				assert.equal(resMsg, '/login');
				assert.isString(flashMsg);
				assert.equal(flashMsg, 'success_msg: You are logged out');
				//test cookieJar._jar.store.idx in some way
			}
		}
	}).addBatch({
		'When a user retrieves the data they edited in a previous session': {
			topic: function(){
				var callback = this.callback;
				login("a@b.com", "pass", function(){
					getFields(callback);
				});
			},
			'the data is updated in the system': function (fields) {
				cleanup.tryCleanup();
				assert.deepEqual(fields, editedFields);
			}
		}
	});
};